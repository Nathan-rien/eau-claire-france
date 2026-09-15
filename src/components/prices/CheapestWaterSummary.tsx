/**
 * Bloc SEO haut de page pour /prix-eaux : capte les requêtes larges
 * ("eau la moins chère", "comparaison prix eau en bouteille", "prix pack d'eau")
 * plutôt que les requêtes marque + enseigne, où les sites d'enseignes gagnent.
 *
 * - Top 3 des eaux au prix au litre le plus bas (relevé le plus récent)
 * - Prix moyen au litre par type d'eau
 * - Coût annuel de l'eau en bouteille vs eau du robinet
 * - FAQ balisée (FAQPage) pour l'affichage enrichi Google
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Droplets, Calendar } from 'lucide-react';
import { getPrices } from '@/services/pricesApi';

type Row = {
  brand: string;
  product_name: string;
  price_per_l_eur?: number;
  price_total_eur?: number;
  pack_count?: number;
  unit_volume_l?: number;
  scraped_at?: string;
  created_at?: string;
};

const SPARKLING = ['perrier', 'badoit', 'san pellegrino', 'salvetat', 'quezac', 'quézac', 'vichy', 'saint-yorre', 'rozana', 'arvie', 'st-yorre'];
const SPRING = ['cristaline', 'mont roucous', 'volvic', 'thonon', 'plancoet', 'plancoët', 'saint-amand', 'wattwiller'];

type Category = 'sparkling' | 'spring' | 'mineral';

function categorize(row: Row): Category {
  const hay = `${row.brand} ${row.product_name}`.toLowerCase();
  if (SPARKLING.some((b) => hay.includes(b)) || /gazeu|pétillan|petillan|sparkling/.test(hay)) return 'sparkling';
  if (SPRING.some((b) => hay.includes(b)) || /eau de source/.test(hay)) return 'spring';
  return 'mineral';
}

const CATEGORY_LABELS: Record<Category, string> = {
  spring: 'Eau de source',
  mineral: 'Eau minérale plate',
  sparkling: 'Eau minérale gazeuse',
};

const LITERS_PER_PERSON_PER_YEAR = 1.5 * 365; // 1,5 L/jour
const TAP_PRICE_PER_L = 0.004; // ~4,30 €/m³ en France (eau + assainissement)

function formatPricePerL(v: number) {
  return `${v.toFixed(2).replace('.', ',')} €/L`;
}

function formatEur(v: number) {
  return `${v.toFixed(v < 10 ? 2 : 0).replace('.', ',')} €`;
}

export default function CheapestWaterSummary() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPrices({ sort_by: 'price_per_l_eur', sort_order: 'asc', limit: 300, page: 1 })
      .then((res) => {
        if (!cancelled) setRows((res.items || []) as Row[]);
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const valid = useMemo(
    () => rows.filter((r) => typeof r.price_per_l_eur === 'number' && (r.price_per_l_eur as number) > 0),
    [rows],
  );

  const cheapest = useMemo(() => {
    const byBrand = new Map<string, Row>();
    [...valid]
      .sort((a, b) => (a.price_per_l_eur as number) - (b.price_per_l_eur as number))
      .forEach((r) => {
        const key = (r.brand || '').toLowerCase();
        if (!byBrand.has(key)) byBrand.set(key, r);
      });
    return Array.from(byBrand.values()).slice(0, 3);
  }, [valid]);

  const averages = useMemo(() => {
    const buckets: Record<Category, number[]> = { spring: [], mineral: [], sparkling: [] };
    valid.forEach((r) => buckets[categorize(r)].push(r.price_per_l_eur as number));
    return (Object.keys(buckets) as Category[])
      .map((c) => ({
        category: c,
        count: buckets[c].length,
        avg: buckets[c].length ? buckets[c].reduce((a, b) => a + b, 0) / buckets[c].length : null,
      }))
      .filter((x) => x.count > 0)
      .sort((a, b) => (a.avg as number) - (b.avg as number));
  }, [valid]);

  const lastUpdate = useMemo(() => {
    const dates = valid.map((r) => r.scraped_at || r.created_at).filter(Boolean) as string[];
    if (!dates.length) return null;
    const max = dates.sort().slice(-1)[0];
    return new Date(max).toLocaleDateString('fr-FR');
  }, [valid]);

  const cheapestPrice = cheapest[0]?.price_per_l_eur ?? null;
  const avgAll = valid.length ? valid.reduce((a, b) => a + (b.price_per_l_eur as number), 0) / valid.length : null;

  const annualCheapest = cheapestPrice ? cheapestPrice * LITERS_PER_PERSON_PER_YEAR : null;
  const annualAvg = avgAll ? avgAll * LITERS_PER_PERSON_PER_YEAR : null;
  const annualTap = TAP_PRICE_PER_L * LITERS_PER_PERSON_PER_YEAR;

  const faq = useMemo(() => {
    const items: { q: string; a: string }[] = [];
    if (cheapest.length) {
      items.push({
        q: "Quelle est l'eau en bouteille la moins chère ?",
        a: `D'après notre dernier relevé de prix, l'eau la moins chère est ${cheapest[0].brand} à ${formatPricePerL(
          cheapest[0].price_per_l_eur as number,
        )}, suivie de ${cheapest.slice(1).map((c) => `${c.brand} (${formatPricePerL(c.price_per_l_eur as number)})`).join(' et ')}.`,
      });
    }
    if (avgAll) {
      items.push({
        q: "Combien coûte un litre d'eau en bouteille en moyenne ?",
        a: `Le prix moyen constaté est de ${formatPricePerL(avgAll)}, contre environ 0,004 €/L pour l'eau du robinet, soit près de ${Math.round(
          avgAll / TAP_PRICE_PER_L,
        )} fois plus cher.`,
      });
    }
    if (annualAvg) {
      items.push({
        q: "Combien coûte l'eau en bouteille par an ?",
        a: `Pour 1,5 litre par jour et par personne, l'eau en bouteille représente environ ${formatEur(
          annualAvg,
        )} par an, contre ${formatEur(annualTap)} pour l'eau du robinet.`,
      });
    }
    items.push({
      q: 'Eau de source ou eau minérale : laquelle est la moins chère ?',
      a: "Les eaux de source (Cristaline, Mont Roucous, Thonon) sont généralement les moins chères au litre. Les eaux minérales gazeuses sont les plus coûteuses, en raison du conditionnement et du gaz carbonique.",
    });
    return items;
  }, [cheapest, avgAll, annualAvg, annualTap]);

  if (loading || !valid.length) return null;

  return (
    <section className="mb-8 space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />

      {/* Encadré : l'eau la moins chère aujourd'hui */}
      <Card className="p-5 border-primary/30">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <TrendingDown className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Les eaux en bouteille les moins chères</h2>
          {lastUpdate && (
            <Badge variant="outline" className="ml-auto flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Relevé le {lastUpdate}
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cheapest.map((r, i) => (
            <div key={`${r.brand}-${i}`} className="rounded-lg border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground mb-1">#{i + 1} · {CATEGORY_LABELS[categorize(r)]}</p>
              <p className="font-semibold leading-tight">{r.brand}</p>
              <p className="text-2xl font-bold text-primary mt-1">{formatPricePerL(r.price_per_l_eur as number)}</p>
              {r.price_total_eur ? (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatEur(r.price_total_eur)}{' '}
                  {(r.pack_count ?? 1) > 1
                    ? `le pack de ${r.pack_count}${r.unit_volume_l ? ` × ${r.unit_volume_l} L` : ''}`
                    : `la bouteille${r.unit_volume_l ? ` de ${r.unit_volume_l} L` : ''}`}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      {/* Prix moyen au litre par type d'eau */}
      <Card className="p-5">
        <h2 className="text-xl font-bold mb-3">Prix moyen au litre par type d'eau</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4 font-medium">Type d'eau</th>
                <th className="py-2 pr-4 font-medium">Prix moyen au litre</th>
                <th className="py-2 font-medium">Références relevées</th>
              </tr>
            </thead>
            <tbody>
              {averages.map((a) => (
                <tr key={a.category} className="border-b last:border-0">
                  <td className="py-2 pr-4">{CATEGORY_LABELS[a.category]}</td>
                  <td className="py-2 pr-4 font-semibold">{formatPricePerL(a.avg as number)}</td>
                  <td className="py-2 text-muted-foreground">{a.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Coût annuel */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Combien coûte l'eau en bouteille par an ?</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Base de calcul : 1,5 litre par jour et par personne, soit {Math.round(LITERS_PER_PERSON_PER_YEAR)} litres par an.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Eau du robinet</p>
            <p className="text-2xl font-bold">{formatEur(annualTap)}</p>
            <p className="text-xs text-muted-foreground mt-1">≈ 0,004 €/L</p>
          </div>
          {annualCheapest !== null && (
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Bouteille la moins chère</p>
              <p className="text-2xl font-bold">{formatEur(annualCheapest)}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatPricePerL(cheapestPrice as number)}</p>
            </div>
          )}
          {annualAvg !== null && (
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Prix moyen constaté</p>
              <p className="text-2xl font-bold">{formatEur(annualAvg)}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatPricePerL(avgAll as number)}</p>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link to="/traiter-eau-robinet" className="font-medium text-primary hover:underline">
            Améliorer le goût de l'eau du robinet
          </Link>
          <Link to="/comparatif-filtres-eau" className="font-medium text-primary hover:underline">
            Comparatif bouteille / filtration
          </Link>
        </div>
      </Card>

      {/* FAQ visible (miroir du balisage FAQPage) */}
      <Card className="p-5">
        <h2 className="text-xl font-bold mb-3">Questions fréquentes sur le prix de l'eau</h2>
        <div className="space-y-3">
          {faq.map((f) => (
            <details key={f.q} className="rounded-lg border p-3">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Card>
    </section>
  );
}
