import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { brandToSlug } from '@/config/brands';
import { isPricedBrandSlug } from '@/config/pricedBrands';

export interface BrandMinPrice {
  slug: string;
  pricePerL: number;
}

/**
 * Prix minimum au litre par marque, sur le dernier relevé.
 *
 * Requête étroite (2 colonnes seulement) sur prices_history plutôt que getPrices
 * (select *) : charge réseau plus faible et marge de volume suffisante pour que
 * plus aucune marque relevée ne puisse tomber hors de la fenêtre lue.
 * Chargé APRÈS le premier rendu ; la colonne « Prix/L dès » réserve sa largeur,
 * donc l'hydratation ne provoque aucun décalage de mise en page (CLS).
 */
export function useBrandMinPrices() {
  const [minBySlug, setMinBySlug] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: latestRow } = await supabase
          .from('prices_history')
          .select('run_id')
          .not('run_id', 'is', null)
          .order('scraped_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        let query = supabase
          .from('prices_history')
          .select('brand, price_per_l_eur')
          .not('brand', 'is', null)
          .not('price_per_l_eur', 'is', null)
          .order('price_per_l_eur', { ascending: true })
          .limit(5000);

        if (latestRow?.run_id) {
          query = query.eq('run_id', latestRow.run_id);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (cancelled) return;

        const map: Record<string, number> = {};
        for (const row of (data ?? []) as Array<{ brand: string | null; price_per_l_eur: number | null }>) {
          const brand = row.brand;
          const price = row.price_per_l_eur;
          if (!brand || typeof price !== 'number' || !(price > 0)) continue;
          const slug = brandToSlug(brand);
          if (!isPricedBrandSlug(slug)) continue;
          if (map[slug] === undefined || price < map[slug]) map[slug] = price;
        }
        setMinBySlug(map);
      } catch {
        if (!cancelled) setMinBySlug({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { minBySlug, loading };
}
