import { Link } from '@/components/LocalizedLink';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackEvent } from '@/utils/ga';

const LINKS: { to: string; key: string; dest: string }[] = [
  { to: '/prix-eaux', key: 'rankAlso.prices', dest: 'prix-eaux' },
  { to: '/quelle-eau-boire', key: 'rankAlso.profile', dest: 'quelle-eau-boire' },
  { to: '/marques', key: 'rankAlso.brands', dest: 'marques' },
  { to: '/durete-eau-france', key: 'rankAlso.hardness', dest: 'durete-eau-france' },
  { to: '/gout-eau', key: 'rankAlso.taste', dest: 'gout-eau' },
  { to: '/traiter-eau-robinet', key: 'rankAlso.treat', dest: 'traiter-eau-robinet' },
];

/** Bloc « À lire aussi » en bas de page : liens internes réels, sans média. */
export default function AlsoReadSection() {
  const { t } = useLanguage();

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="mb-4 text-xl font-semibold">{t('rankAlso.title')}</h2>
      <ul className="grid list-none gap-2 p-0 sm:grid-cols-2">
        {LINKS.map(({ to, key, dest }) => (
          <li key={to}>
            <Link
              to={to}
              onClick={() => trackEvent('ranking_cta_click', { destination: dest, placement: 'also_read' })}
              className="text-sm text-primary underline hover:no-underline"
            >
              {t(key)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
