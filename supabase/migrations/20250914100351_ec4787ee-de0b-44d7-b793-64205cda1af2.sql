-- Ensure RLS is enabled
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

-- Public read policies
DROP POLICY IF EXISTS retailers_read_public ON public.retailers;
CREATE POLICY retailers_read_public ON public.retailers
FOR SELECT USING (true);

DROP POLICY IF EXISTS prices_read_public ON public.prices;
CREATE POLICY prices_read_public ON public.prices
FOR SELECT USING (true);

DROP POLICY IF EXISTS prices_history_read_public ON public.prices_history;
CREATE POLICY prices_history_read_public ON public.prices_history
FOR SELECT USING (scraped_at > (now() - interval '90 days'));

DROP POLICY IF EXISTS runs_read_public ON public.runs;
CREATE POLICY runs_read_public ON public.runs
FOR SELECT USING (started_at > (now() - interval '30 days'));

-- Service role write policies
DROP POLICY IF EXISTS prices_write_service ON public.prices;
CREATE POLICY prices_write_service ON public.prices
FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS prices_history_write_service ON public.prices_history;
CREATE POLICY prices_history_write_service ON public.prices_history
FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS runs_write_service ON public.runs;
CREATE POLICY runs_write_service ON public.runs
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed core retailers (idempotent upsert by slug)
INSERT INTO public.retailers (slug, name, domain, status)
VALUES
  ('carrefour', 'Carrefour', 'carrefour.fr', 'active'),
  ('auchan', 'Auchan', 'auchan.fr', 'active'),
  ('leclerc', 'E.Leclerc', 'e.leclerc', 'active'),
  ('intermarche', 'Intermarché', 'intermarche.com', 'active'),
  ('coursesu', 'U Drive', 'coursesu.com', 'active'),
  ('u_drive', 'U Drive', 'coursesu.com', 'active'),
  ('monoprix', 'Monoprix', 'monoprix.fr', 'active')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  status = 'active';