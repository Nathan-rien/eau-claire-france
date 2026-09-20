import { useEffect, useState } from 'react';
import { getPrices } from '@/services/pricesApi';
import { brandToSlug } from '@/config/brands';
import { isPricedBrandSlug } from '@/config/pricedBrands';

export interface BrandMinPrice {
  slug: string;
  pricePerL: number;
}

/**
 * Prix minimum au litre par marque (dernier relevé).
 * Chargé APRÈS le premier rendu : la colonne "Prix/L" du tableau réserve sa
 * largeur, donc l'hydratation ne provoque aucun décalage de mise en page (CLS).
 * Seules les marques réellement relevées (PRICED_BRAND_SLUGS) sont retournées.
 */
export function useBrandMinPrices() {
  const [minBySlug, setMinBySlug] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getPrices({ sort_by: 'price_per_l_eur', sort_order: 'asc', limit: 1000, page: 1 })
      .then((res) => {
        if (cancelled) return;
        const map: Record<string, number> = {};
        for (const row of (res?.data ?? []) as Array<{ brand?: string | null; price_per_l_eur?: number | null }>) {
          const brand = row.brand;
          const price = row.price_per_l_eur;
          if (!brand || typeof price !== 'number' || !(price > 0)) continue;
          const slug = brandToSlug(brand);
          if (!isPricedBrandSlug(slug)) continue;
          if (map[slug] === undefined || price < map[slug]) map[slug] = price;
        }
        setMinBySlug(map);
      })
      .catch(() => {
        if (!cancelled) setMinBySlug({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { minBySlug, loading };
}
