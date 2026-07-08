
CREATE TABLE public.taste_reports_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT,
  location_label TEXT,
  quote TEXT NOT NULL,
  tag TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  moderated_at TIMESTAMPTZ,
  moderated_by UUID,
  moderator_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT taste_reports_submissions_quote_len CHECK (char_length(quote) BETWEEN 5 AND 1000),
  CONSTRAINT taste_reports_submissions_tag_check CHECK (tag IN ('chlore','mineral','metallique','neutre','variable','national')),
  CONSTRAINT taste_reports_submissions_status_check CHECK (status IN ('pending','approved','rejected'))
);

GRANT INSERT ON public.taste_reports_submissions TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.taste_reports_submissions TO authenticated;
GRANT ALL ON public.taste_reports_submissions TO service_role;

ALTER TABLE public.taste_reports_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a taste report"
  ON public.taste_reports_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

CREATE POLICY "Admins can read taste submissions"
  ON public.taste_reports_submissions
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update taste submissions"
  ON public.taste_reports_submissions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete taste submissions"
  ON public.taste_reports_submissions
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE TRIGGER update_taste_reports_submissions_updated_at
  BEFORE UPDATE ON public.taste_reports_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX taste_reports_submissions_status_idx
  ON public.taste_reports_submissions (status, created_at DESC);
