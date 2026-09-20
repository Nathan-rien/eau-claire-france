import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from '@/components/LocalizedLink';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackEvent } from '@/utils/ga';

/**
 * Barre d'action mobile discrète (jamais un interstitiel) :
 * - apparaît après ~un écran de défilement,
 * - masquée si la barre de comparaison est active (évite la superposition),
 * - fermable définitivement pour la session de navigation.
 */
export default function MobileActionBar({ hidden = false }: { hidden?: boolean }) {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (hidden || dismissed || !scrolled) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-blue-200 bg-white/95 backdrop-blur md:hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <Link
          to="/prix-eaux"
          onClick={() => trackEvent('ranking_cta_click', { destination: 'prix-eaux', placement: 'mobile_bar' })}
          className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white"
        >
          {t('rankBar.prices')}
        </Link>
        <Link
          to="/quelle-eau-boire"
          onClick={() => trackEvent('ranking_cta_click', { destination: 'quelle-eau-boire', placement: 'mobile_bar' })}
          className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-blue-300 px-3 text-sm font-medium text-blue-700"
        >
          {t('rankBar.profile')}
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t('rankBar.close')}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
