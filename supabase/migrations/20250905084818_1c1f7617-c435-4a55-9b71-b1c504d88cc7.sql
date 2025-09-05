-- Create retailers table
CREATE TABLE public.retailers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  search_url_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create runs table
CREATE TABLE public.runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retailer_id UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'partial', 'failed')),
  notes TEXT,
  items_found INTEGER DEFAULT 0,
  items_saved INTEGER DEFAULT 0,
  error_rate FLOAT DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create raw_products table
CREATE TABLE public.raw_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retailer_id UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
  run_id UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  payload_json JSONB NOT NULL DEFAULT '{}',
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prices table
CREATE TABLE public.prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retailer_id UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
  run_id UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  product_name TEXT NOT NULL,
  pack_count INTEGER,
  unit_volume_l NUMERIC(6,3),
  total_volume_l NUMERIC(7,3),
  price_total_eur NUMERIC(8,2),
  price_per_l_eur NUMERIC(8,4),
  is_promo BOOLEAN DEFAULT false,
  promo_label TEXT,
  availability TEXT DEFAULT 'unknown' CHECK (availability IN ('in_stock', 'out_of_stock', 'unknown')),
  sku TEXT,
  url TEXT,
  image_url TEXT,
  unique_hash CHAR(64) NOT NULL,
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (retailer_id, unique_hash)
);

-- Create indexes for performance
CREATE INDEX idx_runs_retailer_started ON public.runs(retailer_id, started_at DESC);
CREATE INDEX idx_raw_products_retailer_scraped ON public.raw_products(retailer_id, scraped_at DESC);
CREATE INDEX idx_raw_products_run ON public.raw_products(run_id);
CREATE INDEX idx_prices_retailer_brand ON public.prices(retailer_id, brand);
CREATE INDEX idx_prices_brand_scraped ON public.prices(brand, scraped_at DESC);
CREATE INDEX idx_prices_retailer_price_per_l ON public.prices(retailer_id, price_per_l_eur);
CREATE INDEX idx_prices_scraped_at ON public.prices(scraped_at DESC);

-- Create GIN index for full-text search on product names (if extension available)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_prices_product_name_gin ON public.prices USING GIN (product_name gin_trgm_ops);

-- Enable RLS
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for retailers (public read, admin write)
CREATE POLICY "Public can view active retailers" ON public.retailers FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can manage retailers" ON public.retailers FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for runs (public read recent, admin write)
CREATE POLICY "Public can view recent runs" ON public.runs FOR SELECT USING (started_at > now() - interval '30 days');
CREATE POLICY "Authenticated users can manage runs" ON public.runs FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for raw_products (admin only)
CREATE POLICY "Authenticated users can manage raw products" ON public.raw_products FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for prices (public read recent, admin write)
CREATE POLICY "Public can view recent prices" ON public.prices FOR SELECT USING (scraped_at > now() - interval '30 days');
CREATE POLICY "Authenticated users can manage prices" ON public.prices FOR ALL USING (auth.role() = 'authenticated');

-- Create triggers for updated_at
CREATE TRIGGER update_retailers_updated_at BEFORE UPDATE ON public.retailers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed retailers data
INSERT INTO public.retailers (name, slug, domain, status, search_url_template) VALUES
('Carrefour', 'carrefour', 'carrefour.fr', 'active', 'https://www.carrefour.fr/s?q={query}'),
('Auchan', 'auchan', 'auchan.fr', 'active', 'https://www.auchan.fr/recherche?text={query}'),
('E.Leclerc', 'leclerc', 'leclerc.com', 'active', 'https://www.e.leclerc/recherche?keywords={query}'),
('Intermarché', 'intermarche', 'intermarche.com', 'active', 'https://www.intermarche.com/recherche?q={query}'),
('Système U', 'coursesu', 'coursesu.com', 'active', 'https://www.coursesu.com/recherche?q={query}'),
('Casino', 'casino', 'casino.fr', 'active', 'https://www.casino.fr/recherche?q={query}'),
('Monoprix', 'monoprix', 'monoprix.fr', 'active', 'https://www.monoprix.fr/recherche?q={query}'),
('Franprix', 'franprix', 'franprix.fr', 'active', 'https://www.franprix.fr/recherche?q={query}'),
('Cora', 'cora', 'cora.fr', 'active', 'https://www.cora.fr/recherche?q={query}'),
('Match', 'match', 'supermarchesmatch.fr', 'active', 'https://www.supermarchesmatch.fr/recherche?q={query}'),
('Chronodrive', 'chronodrive', 'chronodrive.fr', 'active', 'https://www.chronodrive.fr/recherche?q={query}'),
('Houra', 'houra', 'houra.fr', 'active', 'https://www.houra.fr/recherche?q={query}');