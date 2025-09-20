-- Script de backfill pour corriger les lignes incomplètes (derniers 3 jours)
DO $$ 
BEGIN
    -- Mettre à jour unit_volume_l et pack_count depuis product_name
    UPDATE public.prices_history
    SET unit_volume_l = 
        COALESCE(unit_volume_l,
                 CASE 
                   -- Pattern pour format pack: "6 x 1,5 L"
                   WHEN product_name ~* '(\d+)\s*[x×]\s*(\d+[.,]?\d*)\s*l\b' THEN
                      (regexp_replace(product_name, '.*?(\d+)\s*[x×]\s*(\d+[.,]?\d*)\s*l\b.*', '\2', 'gi'))::text
                      ||
                      CASE WHEN regexp_replace(product_name, '.*?(\d+)\s*[x×]\s*(\d+[.,]?\d*)\s*l\b.*', '\2', 'gi') ~ ','
                           THEN replace(regexp_replace(product_name, '.*?(\d+)\s*[x×]\s*(\d+[.,]?\d*)\s*l\b.*', '\2', 'gi'), ',', '.')::numeric
                           ELSE regexp_replace(product_name, '.*?(\d+)\s*[x×]\s*(\d+[.,]?\d*)\s*l\b.*', '\2', 'gi')::numeric
                      END
                   -- Pattern pour format pack avec cl: "6 x 50 cl"  
                   WHEN product_name ~* '(\d+)\s*[x×]\s*(\d+)\s*cl\b' THEN
                      (regexp_replace(product_name, '.*?(\d+)\s*[x×]\s*(\d+)\s*cl\b.*', '\2', 'gi')::numeric)/100
                   -- Pattern pour volume simple: "1,5 L"
                   WHEN product_name ~* '(\d+[.,]?\d*)\s*l\b' THEN
                      CASE WHEN regexp_replace(product_name, '.*?(\d+[.,]?\d*)\s*l\b.*', '\1', 'gi') ~ ','
                           THEN replace(regexp_replace(product_name, '.*?(\d+[.,]?\d*)\s*l\b.*', '\1', 'gi'), ',', '.')::numeric
                           ELSE regexp_replace(product_name, '.*?(\d+[.,]?\d*)\s*l\b.*', '\1', 'gi')::numeric
                      END
                   -- Pattern pour volume en cl: "50 cl"
                   WHEN product_name ~* '(\d+)\s*cl\b' THEN
                      (regexp_replace(product_name, '.*?(\d+)\s*cl\b.*', '\1', 'gi')::numeric)/100
                   ELSE NULL 
                 END),
        pack_count =
        COALESCE(pack_count,
                 CASE WHEN product_name ~* '(\d+)\s*[x×]\s*\d'
                      THEN regexp_replace(product_name, '.*?(\d+)\s*[x×]\s*\d.*', '\1', 'gi')::int
                      ELSE 1 
                 END)
    WHERE scraped_at > now() - interval '3 days'
      AND (unit_volume_l IS NULL OR pack_count IS NULL);

    -- Mettre à jour total_volume_l
    UPDATE public.prices_history
    SET total_volume_l = 
        COALESCE(total_volume_l,
                 CASE WHEN unit_volume_l IS NOT NULL AND pack_count IS NOT NULL
                      THEN unit_volume_l * pack_count
                      ELSE unit_volume_l -- si pas de pack_count, total = unit
                 END)
    WHERE scraped_at > now() - interval '3 days'
      AND total_volume_l IS NULL;

    -- Mettre à jour price_per_l_eur
    UPDATE public.prices_history
    SET price_per_l_eur = 
        CASE WHEN total_volume_l > 0 AND price_total_eur IS NOT NULL
             THEN round((price_total_eur / total_volume_l)::numeric, 3)
             ELSE price_per_l_eur 
        END
    WHERE scraped_at > now() - interval '3 days'
      AND price_per_l_eur IS NULL;

    RAISE NOTICE 'Backfill terminé pour les 3 derniers jours';
END $$;