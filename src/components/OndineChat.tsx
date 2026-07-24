import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, Send, Droplets, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const ChatLink = ({ href, children, onNavigate, ...props }: any) => {
  const isInternal = href?.startsWith('/');
  const linkClasses = "text-primary underline underline-offset-2 font-medium hover:text-primary/80 transition-colors inline-flex items-center gap-0.5";
  if (isInternal) {
    return <Link to={href} className={linkClasses} onClick={() => onNavigate?.()}>{children}</Link>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClasses} {...props}>
      {children}<ExternalLink className="w-3 h-3 inline-block ml-0.5 shrink-0" />
    </a>
  );
};

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ondine-chat`;

const WELCOME_FR = "Bonjour ! 💧 Je suis **Ondine**, votre assistante eau.\n\nPosez-moi vos questions sur :\n- La **qualité de l'eau du robinet** de votre commune\n- La **composition** des eaux en bouteille\n- Les **prix** comparés\n- Les **polluants** et seuils réglementaires\n- Quelle eau choisir selon votre **profil santé**";

// Simple commune detection in user text
function detectCommune(text: string): string | undefined {
  const patterns = [
    /(?:eau|robinet|qualit[eé])\s+(?:de|du|à|a)\s+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:[-\s][A-ZÀ-Ÿa-zà-ÿ]+)*)/i,
    /(?:commune|ville)\s+(?:de\s+)?([A-ZÀ-Ÿ][a-zà-ÿ]+(?:[-\s][A-ZÀ-Ÿa-zà-ÿ]+)*)/i,
    /(?:à|a)\s+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:[-\s][A-ZÀ-Ÿa-zà-ÿ]+)*)\s*[,?!.]?\s*$/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1] && m[1].length > 2) return m[1];
  }
  return undefined;
}

const OndineChat: React.FC = () => {
  const { t } = useLanguage();
  const welcomeMessage = useMemo<Msg>(() => ({ role: 'assistant', content: t('ondine.welcome') }), [t]);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Refresh welcome message when language changes and no user has replied yet
  useEffect(() => {
    setMessages(prev => (prev.length <= 1 ? [welcomeMessage] : prev));
  }, [welcomeMessage]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [lastMessageId]);


  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: 'user', content: text };
    setInput('');
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setLastMessageId(prev => prev + 1);

    const commune = detectCommune(text);
    let assistantSoFar = '';
    let assistantStarted = false;

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      if (!assistantStarted) {
        assistantStarted = true;
        setLastMessageId(prev => prev + 1);
      }
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && prev.length > 1 && prev[prev.length - 2]?.role === 'user' && prev[prev.length - 2]?.content === text) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      const allMessages = [...messages.filter(m => m !== WELCOME_MESSAGE || messages.indexOf(m) > 0), userMsg]
        .map(m => ({ role: m.role, content: m.content }));

      // Only send last 20 messages for context window
      const contextMessages = allMessages.slice(-20);

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: contextMessages, commune }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Erreur réseau' }));
        upsertAssistant(`⚠️ ${err.error || 'Une erreur est survenue. Réessayez.'}`);
        setIsLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error('No reader');
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buf.indexOf('\n')) !== -1) {
          let line = buf.slice(0, nlIdx);
          buf = buf.slice(nlIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            buf = line + '\n' + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error('Ondine chat error:', e);
      upsertAssistant("⚠️ Impossible de me connecter pour le moment. Réessayez dans quelques instants.");
    }

    setIsLoading(false);
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          <span className="bg-background text-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-md border border-border animate-in fade-in slide-in-from-bottom-2 duration-500">
            Une question ?
          </span>
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
            aria-label="Ouvrir le chat Ondine"
          >
            <Droplets className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[400px] h-full sm:h-[600px] sm:max-h-[80vh] bg-background border border-border rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground shrink-0">
            <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">Ondine</h3>
              <p className="text-xs opacity-80">Assistante eau • InfoEau.fr</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
              aria-label="Fermer le chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                ref={i === messages.length - 1 ? lastMessageRef : undefined}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-1.5 [&>ul]:mb-1.5 [&>ul]:mt-0 [&>p:last-child]:mb-0">
                      <ReactMarkdown components={{ a: (props: any) => <ChatLink {...props} onNavigate={() => setIsOpen(false)} /> }}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-border shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question sur l'eau..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-24"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors shrink-0"
                aria-label="Envoyer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OndineChat;
