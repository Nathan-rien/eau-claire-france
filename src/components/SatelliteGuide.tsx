import { Link } from '@/components/LocalizedLink';
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SatelliteGuideProps {
  /** translation key prefix, e.g. "sat.calcaire" */
  prefix: string;
  /** route of the page, e.g. "/guide/eau-calcaire" */
  canonical: string;
}

/**
 * Amorce de page satellite du cluster « traiter l'eau du robinet ».
 * Contenu éditorial réel, en noindex,follow le temps d'être étoffé.
 */
export default function SatelliteGuide({ prefix, canonical }: SatelliteGuideProps) {
  const { t, language } = useLanguage();

  const title = t(`${prefix}.h1`);

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: t(`${prefix}.seoDesc`),
      author: { "@type": "Organization", name: "InfoEau.fr" },
      publisher: {
        "@type": "Organization",
        name: "InfoEau.fr",
        logo: { "@type": "ImageObject", url: "https://infoeau.fr/favicon.svg" },
      },
      datePublished: "2026-07-30",
      dateModified: "2026-07-30",
      mainEntityOfPage: `https://infoeau.fr${canonical}`,
      inLanguage: language === "en" ? "en-US" : "fr-FR",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t("common.breadcrumb.home"), item: "https://infoeau.fr/" },
        {
          "@type": "ListItem",
          position: 2,
          name: t("tr.breadcrumb.current"),
          item: "https://infoeau.fr/traiter-eau-robinet",
        },
        { "@type": "ListItem", position: 3, name: title, item: `https://infoeau.fr${canonical}` },
      ],
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={t(`${prefix}.seoTitle`)}
        description={t(`${prefix}.seoDesc`)}
        canonical={canonical}
        schemaData={schemas}
        noindex
      />

      <div className="min-h-screen bg-background">
        <section className="border-b border-border bg-gradient-to-br from-blue-50 via-sky-50 to-emerald-50">
          <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
            <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-foreground">
                {t("common.breadcrumb.home")}
              </Link>
              <span className="mx-2">›</span>
              <Link to="/traiter-eau-robinet" className="hover:text-foreground">
                {t("tr.breadcrumb.current")}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-foreground">{title}</span>
            </nav>

            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.15]">
              {title}
            </h1>
          </div>
        </section>

        <section className="px-4 py-10 md:py-14">
          <div className="container mx-auto max-w-3xl space-y-5">
            <p className="text-lg text-muted-foreground leading-relaxed">{t(`${prefix}.p1`)}</p>
            <p className="text-muted-foreground leading-relaxed">{t(`${prefix}.p2`)}</p>
            <p className="text-muted-foreground leading-relaxed">{t(`${prefix}.p3`)}</p>

            <div className="flex items-start gap-3 rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground ring-1 ring-border">
              <Info className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
              <p className="m-0">{t("sat.wip")}</p>
            </div>

            <div className="pt-4 flex flex-col gap-3 border-t border-border">
              <Link
                to="/traiter-eau-robinet"
                className="inline-flex items-center gap-2 font-medium text-blue-700 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("sat.backToPillar")}
              </Link>
              <Link
                to="/diagnostic"
                className="inline-flex items-center gap-2 font-medium text-blue-700 hover:underline"
              >
                {t("sat.diagnostic")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
