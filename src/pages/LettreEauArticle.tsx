import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BlogInfographic from "@/components/blog/BlogInfographic";
import BlogCard from "@/components/blog/BlogCard";
import InternalLinkHub from "@/components/InternalLinkHub";
import {
  fetchArticleBySlug, fetchArticles, CATEGORY_LABELS, type BlogArticle,
} from "@/services/blogApi";

export default function LettreEauArticle() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [related, setRelated] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetchArticleBySlug(slug)
      .then((a) => {
        if (!a) { setNotFound(true); return; }
        setArticle(a);
        return fetchArticles(4).then((all) =>
          setRelated(all.filter((x) => x.id !== a.id).slice(0, 3))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-3xl py-16 px-4">
          <div className="h-8 w-2/3 bg-muted/50 rounded animate-pulse mb-4" />
          <div className="h-64 bg-muted/40 rounded-xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (notFound || !article) {
    return (
      <Layout>
        <div className="container mx-auto max-w-2xl py-20 px-4 text-center">
          <h1 className="text-2xl font-bold mb-3">Article introuvable</h1>
          <p className="text-muted-foreground mb-6">Cet article n'existe pas ou a été retiré.</p>
          <Link to="/lettre-de-leau">
            <Button>Voir tous les articles</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const date = new Date(article.published_at).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
  const canonical = `/lettre-de-leau/${article.slug}`;
  const categoryLabel = CATEGORY_LABELS[article.category] ?? article.category;
  const wordCount = (article.content_md || "").trim().split(/\s+/).length;
  const keywordList = [categoryLabel, "eau potable", "qualité de l'eau", "InfoEau"];

  return (
    <Layout>
      <SEOHead
        title={article.seo_title || article.title}
        description={article.seo_description || article.excerpt}
        canonical={canonical}
        ogType="article"
        ogImage={article.cover_image_url || "/images/og-default.jpg"}
        articlePublishedTime={article.published_at}
        articleModifiedTime={article.published_at}
        articleSection={categoryLabel}
        articleTags={keywordList}
        articleAuthor="Rédaction InfoEau"
        keywords={keywordList.join(", ")}
        schemaData={[
          {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.title,
            description: article.seo_description || article.excerpt,
            image: article.cover_image_url ? [article.cover_image_url] : undefined,
            datePublished: article.published_at,
            dateModified: article.published_at,
            articleSection: categoryLabel,
            keywords: keywordList.join(", "),
            wordCount,
            inLanguage: "fr-FR",
            author: {
              "@type": "Organization",
              name: "Rédaction InfoEau",
              url: "https://infoeau.fr",
            },
            publisher: {
              "@type": "Organization",
              name: "InfoEau.fr",
              logo: { "@type": "ImageObject", url: "https://infoeau.fr/favicon.svg" },
            },
            mainEntityOfPage: `https://infoeau.fr${canonical}`,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://infoeau.fr/" },
              { "@type": "ListItem", position: 2, name: "Lettre de l'eau", item: "https://infoeau.fr/lettre-de-leau" },
              { "@type": "ListItem", position: 3, name: article.title, item: `https://infoeau.fr${canonical}` },
            ],
          },
        ]}
      />
      <article className="min-h-screen">
        <div className="container mx-auto max-w-3xl px-4 pt-6 pb-12">
          <Link
            to="/lettre-de-leau"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Lettre de l'eau
          </Link>

          <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
            <Badge variant="secondary">{CATEGORY_LABELS[article.category] ?? article.category}</Badge>
            <time dateTime={article.published_at}>{date}</time>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {article.reading_time_min} min de lecture
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            {article.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
            {article.excerpt}
          </p>

          {article.cover_image_url && (
            <div className="aspect-[16/9] overflow-hidden rounded-xl mb-8 bg-muted">
              <img
                src={article.cover_image_url}
                alt={article.title}
                loading="eager"
                decoding="async"
                // @ts-expect-error fetchpriority is a valid HTML attribute
                fetchpriority="high"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-lg prose-slate max-w-none prose-headings:text-foreground prose-headings:font-bold prose-h2:mt-12 prose-h2:mb-5 prose-h3:mt-10 prose-h3:mb-4 prose-p:my-5 prose-p:leading-[1.85] prose-p:text-foreground/90 prose-li:my-2 prose-blockquote:my-7 prose-strong:text-foreground prose-a:text-primary prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content_md
                .replace(/\s*\(\s*sources?\s*\d+(?:\s*(?:,|et)\s*(?:sources?\s*)?\d+)*\s*\)/gi, "")
                .replace(/\s*\[\s*sources?\s*\d+(?:\s*(?:,|et)\s*(?:sources?\s*)?\d+)*\s*\]/gi, "")
                .replace(/[ \t]{2,}/g, " ")
                .replace(/\s+([,.;:!?])/g, "$1")}
            </ReactMarkdown>
          </div>

          {article.infographic && <BlogInfographic infographic={article.infographic} />}

          {article.sources?.length > 0 && (
            <section className="mt-10 pt-6 border-t border-border">
              <h2 className="text-base font-semibold mb-3">Sources</h2>
              <ul className="space-y-2">
                {article.sources.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-start gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>{s.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="mt-6 text-xs text-muted-foreground italic">
            Article rédigé avec l'aide de l'intelligence artificielle à partir de sources publiques, et publié par la rédaction d'InfoEau.fr.
          </p>
        </div>

        {related.length > 0 && (
          <section className="bg-muted/20 py-12 px-4 border-t border-border">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-xl md:text-2xl font-bold mb-6">À lire aussi</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((a) => (
                  <BlogCard key={a.id} article={a} variant="compact" />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </Layout>
  );
}
