-- Enums
CREATE TYPE public.water_point_type AS ENUM ('fontaine_publique','source','point_recharge','autre');
CREATE TYPE public.water_point_potabilite AS ENUM ('non_verifie','declare_potable','declare_non_potable');
CREATE TYPE public.water_point_source_donnee AS ENUM ('citoyen','import_osm','officiel');
CREATE TYPE public.water_point_moderation AS ENUM ('en_attente','valide','rejete');
CREATE TYPE public.water_point_report_type AS ENUM ('hors_service','information_incorrecte','autre');

-- Table principale
CREATE TABLE public.water_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type public.water_point_type NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  description TEXT,
  photo_url TEXT,
  accessibilite TEXT,
  statut_potabilite public.water_point_potabilite NOT NULL DEFAULT 'non_verifie',
  source_donnee public.water_point_source_donnee NOT NULL DEFAULT 'citoyen',
  statut_moderation public.water_point_moderation NOT NULL DEFAULT 'en_attente',
  soumis_par UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  derniere_verification_at TIMESTAMPTZ,
  CONSTRAINT water_points_lat_range CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT water_points_lng_range CHECK (longitude BETWEEN -180 AND 180),
  CONSTRAINT water_points_desc_len CHECK (description IS NULL OR char_length(description) <= 1000),
  CONSTRAINT water_points_access_len CHECK (accessibilite IS NULL OR char_length(accessibilite) <= 500)
);

GRANT SELECT, INSERT ON public.water_points TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.water_points TO authenticated;
GRANT ALL ON public.water_points TO service_role;

ALTER TABLE public.water_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read validated water points"
  ON public.water_points
  FOR SELECT
  USING (statut_moderation = 'valide');

CREATE POLICY "Admins can read all water points"
  ON public.water_points
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Anyone can submit a pending water point"
  ON public.water_points
  FOR INSERT
  WITH CHECK (
    statut_moderation = 'en_attente'
    AND source_donnee = 'citoyen'
    AND (soumis_par IS NULL OR soumis_par = auth.uid())
  );

CREATE POLICY "Admins can moderate water points"
  ON public.water_points
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete water points"
  ON public.water_points
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Signalements
CREATE TABLE public.water_points_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  water_point_id UUID NOT NULL REFERENCES public.water_points(id) ON DELETE CASCADE,
  type_signalement public.water_point_report_type NOT NULL,
  commentaire TEXT,
  statut_moderation public.water_point_moderation NOT NULL DEFAULT 'en_attente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT water_points_reports_comment_len CHECK (commentaire IS NULL OR char_length(commentaire) <= 1000)
);

GRANT SELECT, INSERT ON public.water_points_reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.water_points_reports TO authenticated;
GRANT ALL ON public.water_points_reports TO service_role;

ALTER TABLE public.water_points_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read validated reports"
  ON public.water_points_reports
  FOR SELECT
  USING (statut_moderation = 'valide');

CREATE POLICY "Admins can read all reports"
  ON public.water_points_reports
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Anyone can submit a pending report"
  ON public.water_points_reports
  FOR INSERT
  WITH CHECK (statut_moderation = 'en_attente');

CREATE POLICY "Admins can moderate reports"
  ON public.water_points_reports
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete reports"
  ON public.water_points_reports
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Triggers / index
CREATE TRIGGER update_water_points_updated_at
  BEFORE UPDATE ON public.water_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX water_points_moderation_idx ON public.water_points (statut_moderation, created_at DESC);
CREATE INDEX water_points_type_idx ON public.water_points (type);
CREATE INDEX water_points_reports_point_idx ON public.water_points_reports (water_point_id, created_at DESC);