
CREATE TABLE public.eu_water_composition (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code text NOT NULL,
  country_name text NOT NULL DEFAULT '',
  parameter text NOT NULL,
  avg_value numeric,
  unit text NOT NULL DEFAULT 'mg/L',
  min_value numeric,
  max_value numeric,
  samples_count integer DEFAULT 0,
  data_year integer DEFAULT 2024,
  source text NOT NULL DEFAULT 'csv',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (country_code, parameter)
);

CREATE INDEX idx_eu_water_composition_country ON public.eu_water_composition (country_code);

ALTER TABLE public.eu_water_composition ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eu_water_composition_public_read"
  ON public.eu_water_composition
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "eu_water_composition_service_write"
  ON public.eu_water_composition
  FOR ALL
  TO public
  USING (auth.role() = 'service_role'::text);
