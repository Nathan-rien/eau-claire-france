-- Enable RLS (idempotent)
ALTER TABLE IF EXISTS public.retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prices_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.runs ENABLE ROW LEVEL SECURITY;

-- Relax public read policies
DROP POLICY IF EXISTS "Public can view active retailers" ON public.retailers;
DROP POLICY IF EXISTS retailers_read_public ON public.retailers;
CREATE POLICY retailers_read_public ON public.retailers
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view recent prices" ON public.prices;
DROP POLICY IF EXISTS prices_read_public ON public.prices;
CREATE POLICY prices_read_public ON public.prices
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view prices history" ON public.prices_history;
DROP POLICY IF EXISTS prices_history_read_public ON public.prices_history;
CREATE POLICY prices_history_read_public ON public.prices_history
FOR SELECT USING (scraped_at > (now() - interval '90 days'));

-- Restrict writes to service role only
DROP POLICY IF EXISTS "Authenticated users can manage retailers" ON public.retailers;
DROP POLICY IF EXISTS "Authenticated users can manage prices" ON public.prices;
DROP POLICY IF EXISTS "Authenticated users can manage prices history" ON public.prices_history;
DROP POLICY IF EXISTS "Authenticated users can manage runs" ON public.runs;
DROP POLICY IF EXISTS prices_write_service ON public.prices;
DROP POLICY IF EXISTS prices_history_write_service ON public.prices_history;
DROP POLICY IF EXISTS runs_write_service ON public.runs;

CREATE POLICY prices_write_service ON public.prices
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY prices_history_write_service ON public.prices_history
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY runs_write_service ON public.runs
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Ensure anon cannot write by not granting any write policies to anon

-- Retailers slug uniqueness and seed active retailers
CREATE UNIQUE INDEX IF NOT EXISTS retailers_slug_key ON public.retailers (slug);

INSERT INTO public.retailers (slug, name, domain, status)
VALUES 
  ('carrefour', 'Carrefour', 'carrefour.fr', 'active'),
  ('auchan', 'Auchan', 'auchan.fr', 'active'),
  ('leclerc', 'E.Leclerc', 'e.leclerc', 'active'),
  ('intermarche', 'Intermarché', 'intermarche.com', 'active'),
  ('u_drive', 'U Drive', 'magasins-u.com', 'active'),
  ('monoprix', 'Monoprix', 'monoprix.fr', 'active')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  status = 'active';