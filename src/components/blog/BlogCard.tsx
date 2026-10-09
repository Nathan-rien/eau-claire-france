import { Link } from '@/components/LocalizedLink';
import { Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type BlogArticle } from "@/services/blogApi";

interface Props {
  article: BlogArticle;
  variant?: "default" | "compact" | "featured";
}

export default function BlogCard({ article, variant = "default" }: Props) {
  const dateLabel = new Date(article.published_at).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
  const isFeatured = variant === "featured";
  return (
    <article className="h-full">
      <Link
        to={`/lettre-de-leau/${article.slug}`}
        className={`group flex flex-col bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full${!article.cover_image_url ? " border-t-4 border-t-sky-400" : ""}`}
        aria-label={article.title}
      >
        {article.cover_image_url && (
          <div className={`${isFeatured ? "aspect-[16/10]" : "aspect-[16/9]"} overflow-hidden bg-muted relative`}>
            <img
              src={article.cover_image_url}
              alt={article.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className={`flex flex-col flex-1 ${isFeatured ? "p-6" : "p-5"}`}>
          <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {CATEGORY_LABELS[article.category] ?? article.category}
            </Badge>
            <time dateTime={article.published_at}>{dateLabel}</time>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span>{article.reading_time_min} min</span>
            </span>
          </div>
          <h3 className={`font-bold text-foreground group-hover:text-primary transition-colors mb-2 tracking-tight ${
            variant === "compact" ? "text-base" : isFeatured ? "text-xl md:text-2xl" : "text-lg md:text-xl"
          }`}>
            {article.title}
          </h3>
          <p className={`text-sm text-muted-foreground mb-3 ${isFeatured ? "line-clamp-4" : "line-clamp-3"}`}>{article.excerpt}</p>
          <span className="inline-flex items-center text-sm font-medium text-primary mt-auto">
            Lire l'article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}
