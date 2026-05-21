import { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import BlogCard from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/button";
import { Newspaper } from "lucide-react";
import { fetchArticles, CATEGORY_LABELS, type BlogArticle } from "@/services/blogApi";

export default function LettreEau() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchArticles(50)
      .then(setArticles)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(articles.map((a) => a.category));
    return ["all", ...Array.from(set)];
  }, [articles]);

  const filtered = filter === "all" ? articles : articles.filter((a) => a.category === filter);

  return (
    <Layout>
      <SEOHead
        title="Lettre de l'eau — actualités sur la qualité de l'eau"
        description="Actualités, scandales, réglementation et enquêtes sur la qualité de l'eau en France. Un nouvel article tous les 3 jours par InfoEau."
        canonical="/lettre-de-leau"
        schemaData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Lettre de l'eau",
          url: "https://infoeau.fr/lettre-de-leau",
          description: "Blog d'actualités sur la qualité de l'eau en France",
          publisher: { "@type": "Organization", name: "InfoEau.fr" },
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-background">
        <section className="pt-8 pb-6 md:pt-12 md:pb-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-3">
              <Newspaper className="w-4 h-4" /> Lettre de l'eau
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
              Actualités sur la qualité de l'eau
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
              Enquêtes, scandales, décisions réglementaires, alertes sanitaires : chaque article décrypte
              une actualité récente sur l'eau en France. Mis à jour tous les 3 jours.
            </p>
          </div>
        </section>

        <section className="pb-12 px-4">
          <div className="container mx-auto max-w-6xl">
            {!loading && articles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((c) => (
                  <Button
                    key={c}
                    size="sm"
                    variant={filter === c ? "default" : "outline"}
                    onClick={() => setFilter(c)}
                  >
                    {c === "all" ? "Tous" : CATEGORY_LABELS[c] ?? c}
                  </Button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 bg-muted/40 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Newspaper className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">
                  Aucun article pour le moment. Les premières publications arrivent très bientôt.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((a) => (
                  <BlogCard key={a.id} article={a} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
