ALTER TABLE public.water_points ADD COLUMN IF NOT EXISTS source_ref TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS water_points_source_ref_unique
  ON public.water_points (source_ref)
  WHERE source_ref IS NOT NULL;