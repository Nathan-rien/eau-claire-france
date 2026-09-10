import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Link } from '@/components/LocalizedLink';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { PRICED_BRAND_SLUGS, PRICED_BRAND_LABELS } from '@/config/pricedBrands';
import { getBrandFacts } from '@/config/brands';
import { seoData } from '@/utils/seoData';

const HUB_LINKS: { path: string; key: string }[] = [
  { path: '/prix-eaux', key: 'brandsIndex.hub.prices' },
  { path: '/classement', key: 'brandsIndex.hub.ranking' },
  { path: '/comparatif-filtres-eau', key: 'brandsIndex.hub.filters' },
  { path: '/traiter-eau-robinet', key: 'brandsIndex.hub.treat' },
];

/**
 * Annuaire des marques d'eau en bouteille suivies (page /marques).
 * Rôle SEO : hub interne qui donne un chemin d'exploration direct vers chaque
 * page /marque/:slug depuis une page indexable, elle-même liée depuis les pages
 * à trafic (prix, classement, fiches communes) et le pied de page.
 */
export default function Marques() {
  const { t } = useLanguage();

  const brands = PRICED_BRAND_SLUGS.map((slug) => {
    const facts = getBrandFacts(slug);
    return {
      slug,
      label: PRICED_BRAND_LABELS[slug] ?? slug,
      type: facts?.type ?? null,
      source: facts?.source ?? null,
    };
  });

  const typeLabel = (type: string | null) => {
    if (type === 'mineral_sparkling') return t('brandsIndex.type.sparkling');
    if (type === 'spring') return t('brandsIndex.type.spring');
    if (type === 'mineral') return t('brandsIndex.type.mineral');
    return t('brandsIndex.type.bottled');
  };

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: seoData.marques.title,
    itemListElement: brands.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.label,
      url: `https://infoeau.fr/marque/${b.slug}`,
    })),
  };

  return (
    <Layout>
      <SEOHead
        title={seoData.marques.title}
        description={seoData.marques.description}
        keywords={seoData.marques.keywords}
        canonical="/marques"
        schemaData={[seoData.marques.schemaData, itemList]}
      />

      <main className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-3">{t('brandsIndex.h1')}</h1>
        <p className="text-muted-foreground mb-8 max-w-3xl">{t('brandsIndex.intro')}</p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 mb-12">
          {brands.map((b) => (
            <li key={b.slug}>
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <Link to={`/marque/${b.slug}`} className="font-semibold text-primary hover:underline">
                    {b.label}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {typeLabel(b.type)}
                    {b.source ? ` — ${t('brandsIndex.source')} ${b.source}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('brandsIndex.cardCta', { brand: b.label })}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        <section className="border-t border-border pt-8">
          <h2 className="text-xl font-semibold mb-4">{t('brandsIndex.hub.title')}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none p-0">
            {HUB_LINKS.map((l) => (
              <li key={l.path}>
                <Link
                  to={l.path}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm hover:bg-muted transition-colors"
                >
                  <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </Layout>
  );
}
