import { Link } from "react-router-dom";
import { Clock, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type BlogArticle } from "@/services/blogApi";

interface Props {
  article: BlogArticle;
}

export default function BlogHeroCard({ article }: Props) {
  const date = new Date(article.published_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Link
      to={`/lettre-de-leau/${article.slug}`}
      className="group block rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5">
        {article.cover_image_url && (
          <div className="lg:col-span-3 aspect-[16/10] lg:aspect-auto overflow-hidden bg-muted relative">
            <img
              src={article.cover_image_url}
              alt={article.title}
              loading="eager"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-gradient-to-r from-blue-500 to-green-500 text-white border-0 shadow-md gap-1">
                <Sparkles className="w-3 h-3" /> À la une
              </Badge>
            </div>
          </div>
        )}
        <div className="lg:col-span-2 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {CATEGORY_LABELS[article.category] ?? article.category}
            </Badge>
            <span>{date}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.reading_time_min} min
            </span>
          </div>
          <h2 className="font-bold text-foreground group-hover:text-primary transition-colors mb-3 text-2xl md:text-3xl lg:text-4xl leading-tight tracking-tight">
            {article.title}
          </h2>
          <p className="text-muted-foreground line-clamp-4 mb-5 text-base">
            {article.excerpt}
          </p>
          <span className="inline-flex items-center text-sm font-semibold text-primary">
            Lire l'article complet
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
