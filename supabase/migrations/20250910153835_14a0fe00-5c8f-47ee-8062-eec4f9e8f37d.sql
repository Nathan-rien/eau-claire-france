-- Phase 2: Extension retailers panel and prices history

-- First, update the status check constraint to allow 'beta' status
ALTER TABLE public.retailers DROP CONSTRAINT IF EXISTS retailers_status_check;
ALTER TABLE public.retailers ADD CONSTRAINT retailers_status_check 
  CHECK (status = ANY (ARRAY['active'::text, 'paused'::text, 'beta'::text]));

-- Insert additional retailers for Phase 2
INSERT INTO public.retailers (name, slug, domain, status, search_url_template) VALUES
  ('Carrefour Market', 'carrefour_market', 'carrefour.fr', 'active', 'https://www.carrefour.fr/s?q={query}'),
  ('Carrefour Drive', 'carrefour_drive', 'carrefour.fr', 'active', 'https://www.carrefour.fr/s?q={query}'),
  ('Auchan Supermarché', 'auchan_super', 'auchan.fr', 'active', 'https://www.auchan.fr/recherche?text={query}'),
  ('Intermarché', 'intermarche', 'intermarche.com', 'active', 'https://www.intermarche.com/recherche?q={query}'),
  ('U Express', 'u_drive', 'magasins-u.com', 'active', 'https://www.magasins-u.com/recherche?q={query}'),
  ('Monoprix', 'monoprix', 'monoprix.fr', 'active', 'https://www.monoprix.fr/recherche?q={query}'),
  ('Monoprix+', 'monoprix_plus', 'monoprix.fr', 'active', 'https://www.monoprix.fr/recherche?q={query}'),
  ('Casino', 'casino', 'casino.fr', 'active', 'https://www.casino.fr/recherche?q={query}'),
  ('Géant Casino', 'geant_casino', 'geantcasino.fr', 'active', 'https://www.geantcasino.fr/recherche?q={query}'),
  ('Franprix', 'franprix', 'franprix.fr', 'active', 'https://www.franprix.fr/recherche?q={query}'),
  ('Cora', 'cora', 'cora.fr', 'active', 'https://www.cora.fr/recherche?q={query}'),
  ('Match', 'match', 'supermarchesmatch.fr', 'active', 'https://www.supermarchesmatch.fr/recherche?q={query}'),
  ('Chronodrive', 'chronodrive', 'chronodrive.com', 'active', 'https://www.chronodrive.com/recherche?q={query}'),
  ('Houra', 'houra', 'houra.fr', 'active', 'https://www.houra.fr/recherche?q={query}'),
  -- Beta retailers (not in cron)
  ('Lidl', 'lidl', 'lidl.fr', 'beta', 'https://www.lidl.fr/recherche?q={query}'),
  ('Aldi', 'aldi', 'aldi.fr', 'beta', 'https://www.aldi.fr/recherche?q={query}'),
  ('Greenweez', 'greenweez', 'greenweez.com', 'beta', 'https://www.greenweez.com/recherche?q={query}'),
  ('La Fourche', 'lafourche', 'lafourche.fr', 'beta', 'https://www.lafourche.fr/recherche?q={query}'),
  ('Amazon Fresh FR', 'amazon_fresh_fr', 'amazon.fr', 'beta', 'https://www.amazon.fr/s?k={query}'),
  ('Deliveroo Grocery', 'deliveroo_grocery', 'deliveroo.fr', 'beta', 'https://deliveroo.fr/recherche?q={query}')
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  status = EXCLUDED.status,
  search_url_template = EXCLUDED.search_url_template;

-- Create prices_history table for historical data tracking
CREATE TABLE IF NOT EXISTS public.prices_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retailer_id UUID NOT NULL,
  run_id UUID NOT NULL,
  brand TEXT NOT NULL,
  product_name TEXT NOT NULL,
  pack_count INTEGER,
  unit_volume_l NUMERIC(8,3),
  total_volume_l NUMERIC(8,3),
  price_total_eur NUMERIC(8,2),
  price_per_l_eur NUMERIC(8,3),
  is_promo BOOLEAN DEFAULT FALSE,
  promo_label TEXT,
  availability TEXT DEFAULT 'unknown'::text,
  sku TEXT,
  url TEXT,
  image_url TEXT,
  unique_hash CHAR(64) NOT NULL,
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for prices_history
CREATE INDEX IF NOT EXISTS idx_prices_history_retailer_brand_scraped 
  ON public.prices_history(retailer_id, brand, scraped_at);
CREATE INDEX IF NOT EXISTS idx_prices_history_brand_scraped 
  ON public.prices_history(brand, scraped_at);
CREATE INDEX IF NOT EXISTS idx_prices_history_retailer_price 
  ON public.prices_history(retailer_id, price_per_l_eur);
CREATE INDEX IF NOT EXISTS idx_prices_history_scraped_at 
  ON public.prices_history(scraped_at);

-- Enable RLS on prices_history
ALTER TABLE public.prices_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for prices_history
CREATE POLICY "Public can view prices history" 
ON public.prices_history 
FOR SELECT 
USING (scraped_at > (now() - interval '90 days'));

CREATE POLICY "Authenticated users can manage prices history" 
ON public.prices_history 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

-- Add columns to runs table for quality metrics
ALTER TABLE public.runs ADD COLUMN IF NOT EXISTS outliers_count INTEGER DEFAULT 0;
ALTER TABLE public.runs ADD COLUMN IF NOT EXISTS unknown_brands_count INTEGER DEFAULT 0;
ALTER TABLE public.runs ADD COLUMN IF NOT EXISTS quality_score NUMERIC(3,2) DEFAULT 1.0;