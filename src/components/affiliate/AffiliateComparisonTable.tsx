import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowUpDown, Check, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AFFILIATE_PRODUCTS,
  getAmazonUrl,
  parseMinPrice,
  type ProductCategory,
} from '@/config/affiliateProducts';
import AffiliateDisclosure from './AffiliateDisclosure';

interface Props {
  /** Limite le tableau à une catégorie. Omis = filtration + goût avec filtre. */
  category?: ProductCategory;
  title?: string;
  intro?: string;
  showDisclosure?: boolean;
  className?: string;
}

const LABELS = {
  fr: {
    title: 'Comparatif des solutions',
    all: 'Toutes',
    filtration: 'Filtration',
    taste: 'Goût',
    product: 'Produit',
    price: 'Prix',
    annual: 'Coût annuel',
    treats: 'Traite',
    doesNotTreat: 'Ne traite pas',
    rating: 'Note',
    action: 'Action',
    cta: 'Voir sur Amazon',
    sort: 'Trier par prix',
    none: '—',
    scrollHint: 'Faites défiler horizontalement pour voir toutes les colonnes.',
    reviews: 'avis',
  },
  en: {
    title: 'Comparison of solutions',
    all: 'All',
    filtration: 'Filtration',
    taste: 'Taste',
    product: 'Product',
    price: 'Price',
    annual: 'Annual cost',
    treats: 'Treats',
    doesNotTreat: 'Does not treat',
    rating: 'Rating',
    action: 'Action',
    cta: 'View on Amazon',
    sort: 'Sort by price',
    none: '—',
    scrollHint: 'Scroll horizontally to see all columns.',
    reviews: 'reviews',
  },
};

export default function AffiliateComparisonTable({
  category,
  title,
  intro,
  showDisclosure = true,
  className = '',
}: Props) {
  const { language } = useLanguage();
  const L = language === 'en' ? LABELS.en : LABELS.fr;
  const [filter, setFilter] = useState<ProductCategory | 'all'>(category ?? 'all');
  const [sortAsc, setSortAsc] = useState<boolean | null>(null);

  const rows = useMemo(() => {
    let list = AFFILIATE_PRODUCTS.filter((p) => (category ? p.category === category : true));
    if (!category && filter !== 'all') list = list.filter((p) => p.category === filter);
    if (sortAsc !== null) {
      list = [...list].sort((a, b) => {
        const d = parseMinPrice(a.priceRange) - parseMinPrice(b.priceRange);
        return sortAsc ? d : -d;
      });
    }
    return list;
  }, [category, filter, sortAsc]);

  return (
    <div className={className}>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">
        {title ?? L.title}
      </h2>
      {intro && <p className="text-muted-foreground leading-relaxed mb-4 max-w-3xl">{intro}</p>}
      {showDisclosure && <AffiliateDisclosure className="mb-6 max-w-3xl" />}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {!category && (
          <>
            {(['all', 'filtration', 'taste'] as const).map((key) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={filter === key ? 'default' : 'outline'}
                onClick={() => setFilter(key)}
                className="min-h-[44px] md:min-h-0"
              >
                {key === 'all' ? L.all : key === 'filtration' ? L.filtration : L.taste}
              </Button>
            ))}
          </>
        )}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setSortAsc((v) => (v === null ? true : !v))}
          className="min-h-[44px] md:min-h-0"
        >
          <ArrowUpDown className="w-4 h-4 mr-1" />
          {L.sort}
        </Button>
      </div>

      <p className="md:hidden text-xs text-muted-foreground mb-2">{L.scrollHint}</p>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold">{L.product}</th>
              <th className="px-4 py-3 font-semibold">{L.price}</th>
              <th className="px-4 py-3 font-semibold">{L.annual}</th>
              <th className="px-4 py-3 font-semibold">{L.treats}</th>
              <th className="px-4 py-3 font-semibold">{L.doesNotTreat}</th>
              <th className="px-4 py-3 font-semibold">{L.rating}</th>
              <th className="px-4 py-3 font-semibold">{L.action}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.slug} className="border-t border-border align-top">
                <td className="px-4 py-4 max-w-[240px]">
                  <span className="block font-medium text-foreground">{p.name}</span>
                  <span className="block text-xs text-muted-foreground">{p.brand}</span>
                  <span className="block text-xs text-muted-foreground mt-1">{p.bestFor}</span>
                  {p.editorialWarning && (
                    <span className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50 border border-amber-200 px-2 py-1.5 text-[11px] text-amber-900">
                      <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                      {p.editorialWarning}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap font-semibold text-foreground">
                  {p.priceRange}
                </td>
                <td className="px-4 py-4 text-muted-foreground">{p.annualCost ?? L.none}</td>
                <td className="px-4 py-4">
                  <ul className="space-y-1">
                    {p.treats.map((t) => (
                      <li key={t} className="flex items-start gap-1.5 text-foreground">
                        <Check className="w-3.5 h-3.5 mt-1 text-emerald-600 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-4">
                  {p.doesNotTreat.length === 0 ? (
                    <span className="text-muted-foreground">{L.none}</span>
                  ) : (
                    <ul className="space-y-1">
                      {p.doesNotTreat.map((t) => (
                        <li key={t} className="flex items-start gap-1.5 text-muted-foreground">
                          <X className="w-3.5 h-3.5 mt-1 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                  {typeof p.rating === 'number' && p.rating <= 5
                    ? `${p.rating.toFixed(1)}/5${p.reviewCount ? ` (${p.reviewCount.toLocaleString('fr-FR')} ${L.reviews})` : ''}`
                    : L.none}
                </td>
                <td className="px-4 py-4">
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={getAmazonUrl(p)}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                    >
                      {L.cta}
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
