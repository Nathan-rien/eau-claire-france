-- Create view for latest prices per unique product
CREATE OR REPLACE VIEW public.prices_history_last AS
SELECT DISTINCT ON (retailer_id, COALESCE(brand,'Inconnu'), product_name, total_volume_l, pack_count)
  *
FROM public.prices_history
ORDER BY retailer_id, COALESCE(brand,'Inconnu'), product_name, total_volume_l, pack_count, scraped_at DESC;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prices_history_scraped_at ON public.prices_history (scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_prices_history_retailer_brand ON public.prices_history (retailer_id, brand);
CREATE INDEX IF NOT EXISTS idx_prices_history_brand_scraped ON public.prices_history (brand, scraped_at DESC);