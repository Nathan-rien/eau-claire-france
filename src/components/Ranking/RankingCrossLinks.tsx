import { Euro, UserRound } from 'lucide-react';
import { Link } from '@/components/LocalizedLink';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackEvent } from '@/utils/ga';

/**
 * Encadré de circulation placé SOUS le podium (jamais au-dessus de la ligne de
 * flottaison) : pas d'image, pas de fetch, hauteur stable -> aucun impact LCP/CLS.
 */
export default function RankingCrossLinks({ profile }: { profile?: string }) {
  const { t } = useLanguage();

  const items = [
    {
      to: '/prix-eaux',
      icon: Euro,
      title: t('rankCross.pricesTitle'),
      desc: t('rankCross.pricesDesc'),
      dest: 'prix-eaux',
    },
    {
      to: '/quelle-eau-boire',
      icon: UserRound,
      title: t('rankCross.profileTitle'),
      desc: t('rankCross.profileDesc'),
      dest: 'quelle-eau-boire',
    },
  ];

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2">
      {items.map(({ to, icon: Icon, title, desc, dest }) => (
        <Link
          key={to}
          to={to}
          onClick={() => trackEvent('ranking_cta_click', { destination: dest, placement: 'podium', profile })}
          className="flex items-start gap-3 rounded-xl border border-blue-200 bg-white p-4 shadow-sm transition hover:border-blue-400 hover:bg-blue-50/60"
        >
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
          <span>
            <span className="block font-semibold text-gray-900">{title}</span>
            <span className="mt-0.5 block text-sm text-gray-600">{desc}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
