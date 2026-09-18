DROP INDEX IF EXISTS public.water_points_source_ref_unique;
CREATE UNIQUE INDEX IF NOT EXISTS water_points_source_ref_unique ON public.water_points (source_ref);