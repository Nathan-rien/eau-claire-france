import { Link } from '@/components/LocalizedLink';
import { useLanguage } from '@/contexts/LanguageContext';
import { REGION_PAGE_KEYS, REGION_PAGE_SLUGS, type RegionPageKey } from '@/config/regionPages';

const REGION_LABELS: Record<RegionPageKey, { fr: string; en: string }> = {
  alpes: { fr: 'Alpes', en: 'Alps' },
  vosges: { fr: 'Vosges', en: 'Vosges' },
  auvergne: { fr: 'Auvergne', en: 'Auvergne' },
  pyrenees: { fr: 'Pyrénées', en: 'Pyrenees' },
  mediterranee: { fr: 'Méditerranée', en: 'Mediterranean' },
};

/**
 * Maillage interne : pages régionales « eaux minérales par région ».
 * Même source de vérité que le sitemap (regionPages.ts).
 */
export default function RegionLinksSection() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="text-xl font-semibold mb-2">
        {isEn ? 'Mineral waters by region' : 'Eaux minérales par région'}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {isEn
          ? 'Discover the mineral waters bottled in each French region, their composition and their springs.'
          : "Découvrez les eaux minérales embouteillées dans chaque massif français, leur composition et leurs sources."}
      </p>
      <ul className="flex flex-wrap gap-2 list-none p-0">
        {REGION_PAGE_KEYS.map((key) => (
          <li key={key}>
            <Link
              to={`/${REGION_PAGE_SLUGS[key]}`}
              className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              {isEn
                ? `Mineral waters — ${REGION_LABELS[key].en}`
                : `Eaux minérales ${REGION_LABELS[key].fr}`}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
