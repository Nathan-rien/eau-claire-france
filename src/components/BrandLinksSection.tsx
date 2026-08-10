import { Link } from '@/components/LocalizedLink';
import { useLanguage } from '@/contexts/LanguageContext';
import { PRICED_BRAND_SLUGS, PRICED_BRAND_LABELS } from '@/config/pricedBrands';

const EUROPE_LINKS: { path: string; key: string }[] = [
  { path: '/classement-europe', key: 'brandLinks.euRanking' },
  { path: '/prix-eaux-europe', key: 'brandLinks.euPrices' },
  { path: '/composition-europe', key: 'brandLinks.euComposition' },
  { path: '/polluants-europe', key: 'brandLinks.euPollutants' },
];

/**
 * Maillage interne : marques ayant réellement des prix (même source de vérité que
 * le sitemap et le noindex de /marque/:slug) + renvoi vers le pôle Europe.
 * Tous les liens passent par LocalizedLink pour conserver le préfixe /en.
 */
export default function BrandLinksSection() {
  const { t } = useLanguage();

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="text-xl font-semibold mb-2">{t('brandLinks.title')}</h2>
      <p className="text-sm text-muted-foreground mb-4">{t('brandLinks.intro')}</p>
      <ul className="flex flex-wrap gap-2 mb-8 list-none p-0">
        {PRICED_BRAND_SLUGS.map((slug) => (
          <li key={slug}>
            <Link
              to={`/marque/${slug}`}
              className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              {PRICED_BRAND_LABELS[slug] ?? slug}
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2">{t('brandLinks.europeTitle')}</h2>
      <p className="text-sm text-muted-foreground mb-4">{t('brandLinks.europeIntro')}</p>
      <ul className="flex flex-wrap gap-4 list-none p-0">
        {EUROPE_LINKS.map((l) => (
          <li key={l.path}>
            <Link to={l.path} className="text-sm text-primary underline hover:no-underline">
              {t(l.key)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
