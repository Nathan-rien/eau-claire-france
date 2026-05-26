import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import BlogCard from "@/components/blog/BlogCard";
import BlogHeroCard from "@/components/blog/BlogHeroCard";
import { Button } from "@/components/ui/button";
import { Newspaper, Calendar, FileText, Bell, ArrowRight } from "lucide-react";
import { fetchArticles, CATEGORY_LABELS, type BlogArticle } from "@/services/blogApi";
import lettreEauCover from "@/assets/lettre-eau-cover.jpg";

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

  // When no filter is applied, split into hero / bento / rest
  const isUnfiltered = filter === "all";
  const heroArticle = isUnfiltered ? filtered[0] : null;
  const bentoArticles = isUnfiltered ? filtered.slice(1, 5) : [];
  const restArticles = isUnfiltered ? filtered.slice(5) : filtered;

  return (
    <Layout>
      <SEOHead
        title="Lettre de l'eau — actualités sur la qualité de l'eau"
        description="Actualités, scandales, réglementation et enquêtes sur la qualité de l'eau en France. Un nouvel article toutes les semaines par InfoEau."
        canonical="/lettre-de-leau"
        ogImage={lettreEauCover}
        schemaData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Lettre de l'eau",
          url: "https://infoeau.fr/lettre-de-leau",
          description: "Blog d'actualités sur la qualité de l'eau en France",
          image: `https://infoeau.fr${lettreEauCover}`,
          publisher: { "@type": "Organization", name: "InfoEau.fr" },
        }}
      />
      <div className="min-h-screen bg-background">
        {/* HERO éditorial */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-blue-50 via-sky-50 to-green-50">
          {/* Motif vague décoratif */}
          <svg
            className="absolute bottom-0 left-0 w-full text-background/60"
            viewBox="0 0 1440 120"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L0,120Z" />
          </svg>
          <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16 lg:py-20 relative">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-3">
                <div className="inline-flex flex-wrap items-center gap-2 text-xs md:text-sm font-semibold uppercase tracking-widest text-blue-600 mb-4">
                  <Newspaper className="w-4 h-4" />
                  <span>Lettre de l'eau</span>
                  <span className="text-muted-foreground/60">·</span>
                  <span className="text-muted-foreground font-medium normal-case tracking-normal">
                    Le magazine d'InfoEau
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight leading-[1.1]">
                  Tout ce qu'il faut savoir sur{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    la qualité de l'eau
                  </span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Enquêtes, scandales, décisions réglementaires, alertes sanitaires : chaque article décrypte
                  une actualité récente sur l'eau en France.
                </p>

                {/* Stats inline */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>
                      <strong className="text-foreground">{articles.length}</strong> article{articles.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span>
                      Nouvel article <strong className="text-foreground">tous les 3 jours</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bell className="w-4 h-4 text-orange-500" />
                    <span>{Math.max(categories.length - 1, 0)} thématiques couvertes</span>
                  </div>
                </div>
              </div>

              {/* Image de couverture */}
              <div className="lg:col-span-2 order-first lg:order-last">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 aspect-[4/3] lg:aspect-[4/5]">
                  <img
                    src={lettreEauCover}
                    alt="Goutte d'eau créant des ondulations — Lettre de l'eau"
                    width={1536}
                    height={864}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-green-500/10 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HERO ARTICLE - article à la une */}
        {!loading && heroArticle && (
          <section className="px-4 -mt-6 md:-mt-10 relative z-10">
            <div className="container mx-auto max-w-6xl">
              <BlogHeroCard article={heroArticle} />
            </div>
          </section>
        )}

        {/* Filtres */}
        <section className="px-4 pt-10 md:pt-14">
          <div className="container mx-auto max-w-6xl">
            {!loading && articles.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Button
                      key={c}
                      size="sm"
                      variant={filter === c ? "default" : "outline"}
                      onClick={() => setFilter(c)}
                      className="rounded-full"
                    >
                      {c === "all" ? "Tous les articles" : CATEGORY_LABELS[c] ?? c}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  {filtered.length} article{filtered.length > 1 ? "s" : ""}
                </p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border overflow-hidden bg-card">
                    <div className="aspect-[16/9] bg-muted animate-pulse" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-5 w-full bg-muted rounded animate-pulse" />
                      <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
                <Newspaper className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">
                  Aucun article pour le moment. Les premières publications arrivent très bientôt.
                </p>
              </div>
            ) : (
              <>
                {/* BENTO grid (articles 2-5 quand pas filtré) */}
                {bentoArticles.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {bentoArticles.map((a, idx) => (
                      <div
                        key={a.id}
                        className={idx === 0 ? "lg:col-span-2 lg:row-span-1" : ""}
                      >
                        <BlogCard article={a} variant={idx === 0 ? "featured" : "default"} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Grille standard */}
                {restArticles.length > 0 && (
                  <>
                    {isUnfiltered && bentoArticles.length > 0 && (
                      <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight">
                        Tous les articles
                      </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {restArticles.map((a) => (
                        <BlogCard key={a.id} article={a} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA bandeau alertes */}
        <section className="px-4 py-16 md:py-20 mt-12">
          <div className="container mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 p-8 md:p-12 lg:p-14 text-white shadow-xl">
              <div className="absolute inset-0 opacity-10" aria-hidden="true">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                  <circle cx="80" cy="20" r="30" fill="white" />
                  <circle cx="20" cy="80" r="40" fill="white" />
                </svg>
              </div>
              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3 opacity-90">
                    <Bell className="w-4 h-4" /> Restez informé
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 tracking-tight">
                    Recevez les alertes qualité de votre eau
                  </h2>
                  <p className="text-white/90 text-base md:text-lg max-w-2xl">
                    Soyez prévenu dès qu'un polluant dépasse les seuils dans votre commune ou
                    dès qu'un nouvel article est publié.
                  </p>
                </div>
                <div className="md:text-right">
                  <Link to="/alertes">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="bg-white text-blue-600 hover:bg-white/90 font-semibold shadow-md"
                    >
                      Activer les alertes
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
