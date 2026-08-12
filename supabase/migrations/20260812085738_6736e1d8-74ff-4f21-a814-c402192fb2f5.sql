CREATE TABLE public.indexation_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL UNIQUE,
  coverage_state text,
  is_indexed boolean NOT NULL DEFAULT false,
  last_crawled_at date,
  first_seen_unindexed timestamptz,
  import_source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.indexation_status TO authenticated;
GRANT ALL ON public.indexation_status TO service_role;

ALTER TABLE public.indexation_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read indexation status"
ON public.indexation_status FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can insert indexation status"
ON public.indexation_status FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update indexation status"
ON public.indexation_status FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete indexation status"
ON public.indexation_status FOR DELETE TO authenticated
USING (public.is_admin());

CREATE TRIGGER update_indexation_status_updated_at
BEFORE UPDATE ON public.indexation_status
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_indexation_status_state ON public.indexation_status (is_indexed, first_seen_unindexed);