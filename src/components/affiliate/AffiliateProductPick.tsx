import { ArrowRight, Check, X, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getAmazonUrl,
  getProductPicks,
  type ProductCategory,
  type ProductTier,
} from '@/config/affiliateProducts';
import AffiliateDisclosure from './AffiliateDisclosure';
import { Link } from '@/components/LocalizedLink';

interface Props {
  category: ProductCategory;
  /** ex: "nitrates", "calcaire", "chlore", "plomb" */
  problemContext?: string;
  showDisclosure?: boolean;
  className?: string;
}

const LABELS = {
  fr: {
    title: 'Nos recommandations pour tous les budgets',
    intro:
      "Trois options par niveau de budget. Chaque produit est présenté avec ce qu'il traite réellement et ses limites.",
    tiers: { entry: 'Entrée de gamme', standard: 'Standard', premium: 'Premium' } as Record<
      ProductTier,
      string
    >,
    treats: 'Traite',
    doesNotTreat: 'Ne traite pas',
    annual: 'Coût annuel',
    cta: 'Voir sur Amazon',
    reviews: 'avis',
    compare: 'Voir le comparatif complet des filtres à eau',
  },
  en: {
    title: 'Our recommendations for every budget',
    intro:
      'Three options by budget level. Each product is listed with what it actually treats and its limits.',
    tiers: { entry: 'Entry level', standard: 'Standard', premium: 'Premium' } as Record<
      ProductTier,
      string
    >,
    treats: 'Treats',
    doesNotTreat: 'Does not treat',
    annual: 'Annual cost',
    cta: 'View on Amazon',
    reviews: 'reviews',
    compare: 'See the full water filter comparison',
  },
};

export default function AffiliateProductPick({
  category,
  problemContext,
  showDisclosure = true,
  className = '',
}: Props) {
  const { language } = useLanguage();
  const L = language === 'en' ? LABELS.en : LABELS.fr;
  const picks = getProductPicks(category, problemContext);

  if (picks.length === 0) return null;

  return (
    <section className={`px-4 py-12 md:py-16 ${className}`} aria-label={L.title}>
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">
          {L.title}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4 max-w-3xl">{L.intro}</p>
        {showDisclosure && <AffiliateDisclosure className="mb-8 max-w-3xl" />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {picks.map((p) => (
            <div key={p.slug} className="flex flex-col">
              <Card className="border-border h-full flex flex-col">
                <CardContent className="p-5 flex flex-col h-full">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-700 mb-2">
                    {L.tiers[p.tier]}
                  </span>
                  <h3 className="text-base font-semibold text-foreground leading-snug">{p.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{p.brand}</p>

                  <p className="text-lg font-bold text-foreground mb-1">{p.priceRange}</p>
                  {p.annualCost && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {L.annual} : {p.annualCost}
                    </p>
                  )}

                  {typeof p.rating === 'number' && p.rating <= 5 && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {p.rating.toFixed(1)}/5
                      {p.reviewCount ? ` — ${p.reviewCount.toLocaleString('fr-FR')} ${L.reviews}` : ''}
                    </p>
                  )}

                  <ul className="space-y-1 mb-3">
                    {p.treats.slice(0, 3).map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>

                  {p.doesNotTreat.length > 0 && (
                    <ul className="space-y-1 mb-4">
                      {p.doesNotTreat.slice(0, 2).map((t) => (
                        <li
                          key={t}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <X className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{p.bestFor}</p>

                  <div className="mt-auto">
                    <Button asChild variant="outline" className="w-full">
                      <a
                        href={getAmazonUrl(p)}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                      >
                        {L.cta}
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {p.editorialWarning && (
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{p.editorialWarning}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            to="/comparatif-filtres-eau"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
          >
            {L.compare}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
