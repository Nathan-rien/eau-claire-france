
CREATE TABLE public.taste_partner_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  product_category TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.taste_partner_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.taste_partner_submissions TO authenticated;
GRANT ALL ON public.taste_partner_submissions TO service_role;

ALTER TABLE public.taste_partner_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit partner request"
  ON public.taste_partner_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(company_name) BETWEEN 1 AND 150
    AND length(contact_name) BETWEEN 1 AND 150
    AND length(email) BETWEEN 3 AND 255
    AND length(message) BETWEEN 1 AND 2000
    AND (website IS NULL OR length(website) <= 500)
    AND (product_category IS NULL OR length(product_category) <= 100)
  );

CREATE POLICY "Admins can read partner submissions"
  ON public.taste_partner_submissions FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update partner submissions"
  ON public.taste_partner_submissions FOR UPDATE
  TO authenticated
  USING (public.is_admin());
