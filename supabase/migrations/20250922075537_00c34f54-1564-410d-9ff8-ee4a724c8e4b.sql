-- Convert prices_history_last to materialized view for better performance
DROP VIEW IF EXISTS prices_history_last;

CREATE MATERIALIZED VIEW prices_history_last AS
SELECT DISTINCT ON (retailer_id, COALESCE(brand, 'Inconnu'::text), product_name, total_volume_l, pack_count) 
    id,
    retailer_id,
    run_id,
    brand,
    product_name,
    pack_count,
    unit_volume_l,
    total_volume_l,
    price_total_eur,
    price_per_l_eur,
    is_promo,
    promo_label,
    availability,
    sku,
    url,
    image_url,
    unique_hash,
    scraped_at,
    created_at
FROM prices_history
ORDER BY retailer_id, COALESCE(brand, 'Inconnu'::text), product_name, total_volume_l, pack_count, scraped_at DESC;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_prices_history_last_retailer_brand ON prices_history_last(retailer_id, brand);
CREATE INDEX IF NOT EXISTS idx_prices_history_last_scraped_at ON prices_history_last(scraped_at);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_prices_view()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW prices_history_last;
END;
$$;