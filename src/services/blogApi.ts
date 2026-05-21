import { supabase } from "@/integrations/supabase/client";

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  cover_image_url: string | null;
  category: string;
  sources: { url: string; title: string }[];
  infographic: {
    type: "bar" | "line";
    title: string;
    data: { label: string; value: number }[];
    unit?: string;
  } | null;
  reading_time_min: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string;
  status: string;
}

export async function fetchArticles(limit = 30): Promise<BlogArticle[]> {
  const { data, error } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as BlogArticle[];
}

export async function fetchArticleBySlug(slug: string): Promise<BlogArticle | null> {
  const { data, error } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as BlogArticle) ?? null;
}

export const CATEGORY_LABELS: Record<string, string> = {
  scandale: "Scandale",
  reglementation: "Réglementation",
  qualite: "Qualité",
  sante: "Santé",
  environnement: "Environnement",
  economie: "Économie",
  actualite: "Actualité",
};
