
-- Blog articles table
CREATE TABLE public.blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content_md TEXT NOT NULL,
  cover_image_url TEXT,
  category TEXT NOT NULL DEFAULT 'actualite',
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  infographic JSONB,
  reading_time_min INTEGER NOT NULL DEFAULT 6,
  seo_title TEXT,
  seo_description TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_articles_published ON public.blog_articles (status, published_at DESC);
CREATE INDEX idx_blog_articles_slug ON public.blog_articles (slug);

ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_articles_public_read"
ON public.blog_articles FOR SELECT
USING (status = 'published');

CREATE POLICY "blog_articles_admin_all"
ON public.blog_articles FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "blog_articles_service_all"
ON public.blog_articles FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER blog_articles_updated_at
BEFORE UPDATE ON public.blog_articles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generation log
CREATE TABLE public.blog_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL,
  topic TEXT,
  article_id UUID REFERENCES public.blog_articles(id) ON DELETE SET NULL,
  error TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_generation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_log_admin_read"
ON public.blog_generation_log FOR SELECT
USING (public.is_admin());

CREATE POLICY "blog_log_service_all"
ON public.blog_generation_log FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Storage bucket for cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "blog_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "blog_images_service_write"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'service_role');

CREATE POLICY "blog_images_service_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog-images' AND auth.role() = 'service_role');
