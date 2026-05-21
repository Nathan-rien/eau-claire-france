import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogCard from "./BlogCard";
import { fetchArticles, type BlogArticle } from "@/services/blogApi";

export default function HomeBlogTeaser() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles(3)
      .then(setArticles)
      .catch((e) => console.error("Blog teaser load:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!articles.length) return null;

  return (
    <section className="py-12 md:py-16 px-4 bg-background" aria-labelledby="blog-teaser-title">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-2">
              <Newspaper className="w-4 h-4" /> Lettre de l'eau
            </div>
            <h2 id="blog-teaser-title" className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Dernières actualités sur l'eau
            </h2>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Scandales, réglementation, qualité, santé : un nouvel article tous les 3 jours.
            </p>
          </div>
          <Link to="/lettre-de-leau">
            <Button variant="outline">
              Voir toutes les actualités <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((a) => (
            <BlogCard key={a.id} article={a} />
          ))}
        </div>
      </div>
    </section>
  );
}
