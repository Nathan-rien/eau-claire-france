import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/components/LocalizedLink';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { SITE_ALERTS, type SiteAlert } from '@/data/alerts';
import { useLanguage } from '@/contexts/LanguageContext';

const DISMISS_PREFIX = 'ticker-dismissed-';

const NewsTicker = () => {
  const { t } = useLanguage();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const dismissed = new Set<string>();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(DISMISS_PREFIX)) {
          dismissed.add(key.slice(DISMISS_PREFIX.length));
        }
      }
    } catch {
      // ignore
    }
    setDismissedIds(dismissed);
  }, []);

  const alert: SiteAlert | null = useMemo(() => {
    const now = Date.now();
    const eligible = SITE_ALERTS.filter(
      (a) =>
        (!a.displayUntil || new Date(a.displayUntil).getTime() >= now) &&
        !dismissedIds.has(a.id),
    );
    if (eligible.length === 0) return null;
    return eligible.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )[0];
  }, [dismissedIds]);

  if (!alert) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.setItem(`${DISMISS_PREFIX}${alert.id}`, '1');
    } catch {
      // ignore
    }
    setDismissedIds((prev) => new Set(prev).add(alert.id));
  };

  const StatusIcon = alert.status === 'resolved' ? CheckCircle2 : AlertTriangle;
  const statusColor =
    alert.status === 'resolved' ? 'text-green-400' : 'text-orange-400';

  return (
    <div
      className="sticky top-0 z-[100] w-full bg-slate-900 text-white shadow-sm hidden md:block"
      role="region"
      aria-label={t('ticker.ariaLabel')}
    >
      <div className="relative flex items-center h-9 sm:h-10">
        {/* Static status icon */}
        <div className="flex items-center justify-center px-3 shrink-0 border-r border-white/10 h-full">
          <StatusIcon className={`h-4 w-4 ${statusColor}`} aria-hidden="true" />
        </div>

        {/* Scrolling clickable area */}
        <Link
          to={`/actualites/${alert.articleSlug}`}
          className="flex-1 overflow-hidden group h-full flex items-center"
          aria-label={alert.title}
        >
          <div className="ticker-track flex whitespace-nowrap will-change-transform group-hover:[animation-play-state:paused] [animation-play-state:running]">
            {[0, 1].map((k) => (
              <span
                key={k}
                className="inline-flex items-center px-8 text-sm font-medium"
                aria-hidden={k === 1 ? 'true' : undefined}
              >
                {alert.title}
              </span>
            ))}
          </div>
        </Link>

        {/* Close button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="flex items-center justify-center px-3 shrink-0 border-l border-white/10 h-full hover:bg-white/10 transition-colors"
          aria-label={t('ticker.close')}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <style>{`
        .ticker-track {
          animation: ticker-scroll 50s linear infinite;
        }
        .ticker-track:active {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; }
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;
