

## Plan : Corriger le scroll auto dans Ondine

### Problème
Le `useEffect` actuel scrolle à `scrollHeight` à chaque changement de `messages`, ce qui inclut les mises à jour token-par-token du streaming. L'utilisateur est donc "bloqué" en bas de la réponse longue et doit remonter manuellement.

### Solution
Ne plus scroller sur chaque update de contenu. À la place :
1. Scroller uniquement quand un **nouveau message** apparaît (user envoie → nouveau message assistant démarre)
2. Scroller le **dernier message** en vue, pas le bas du conteneur
3. Ajouter une référence au dernier élément de message pour `scrollIntoView`

### Changements dans `src/components/OndineChat.tsx`

**1. Nouveau state pour tracker le dernier message**
```typescript
const [lastMessageId, setLastMessageId] = useState<number>(0);
```

**2. Modifier `sendMessage` pour incrémenter l'ID**
Quand l'utilisateur envoie un message → `setLastMessageId(prev => prev + 1)` pour déclencher le scroll.

**3. Modifier `upsertAssistant` pour incrémenter l'ID**
Quand Ondine commence à répondre (premier chunk) → `setLastMessageId(prev => prev + 1)` pour scroller au début de sa réponse.

**4. Nouveau `useEffect` ciblé**
```typescript
useEffect(() => {
  if (lastMessageRef.current) {
    lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
}, [lastMessageId]); // Dépend de l'ID, pas de messages.content
```

**5. Supprimer l'ancien `useEffect`**
Remplacer l'actuel qui scrolle sur `[messages]` par le nouveau logique.

**6. Ajouter `ref` sur le dernier message**
Dans le rendu des messages, attacher `lastMessageRef` uniquement au dernier élément (`i === messages.length - 1`).

### Fichier modifié
- `src/components/OndineChat.tsx` (~20 lignes changées)

### Détail technique
- Le scroll se déclenche 2 fois par échange : une fois quand le user envoie (voir son message), une fois quand Ondine commence à répondre (voir le début de sa réponse)
- Pendant le streaming, plus de scroll auto → l'utilisateur peut lire tranquillement
- `block: 'end'` pour voir le bas du message (où le nouveau texte apparaît) sans être collé au fond absolu

