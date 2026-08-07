import { Link } from '@/components/LocalizedLink';
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import BottleVsFilterCalculator from "@/components/BottleVsFilterCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Calculator, Info, Sparkles, Wallet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CANONICAL = "/bouteille-ou-filtration";
const TODAY = new Date().toISOString().slice(0, 10);

export default function BouteilleOuFiltration() {
  const { t, language } = useLanguage();

  const FAQ = [1, 2, 3, 4, 5].map((i) => ({
    q: t(`bof.faq.q${i}.q`),
    a: t(`bof.faq.q${i}.a`),
  }));

  const links = [
    { to: "/traiter-eau-robinet", title: t("bof.links.pillar"), desc: t("bof.links.pillar.desc") },
    { to: "/prix-eaux", title: t("bof.links.prices"), desc: t("bof.links.prices.desc") },
    { to: "/classement", title: t("bof.links.ranking"), desc: t("bof.links.ranking.desc") },
    { to: "/qualite-eau", title: t("bof.links.quality"), desc: t("bof.links.quality.desc") },
  ];

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: t("bof.h1"),
      description: t("bof.seo.desc"),
      author: { "@type": "Organization", name: "InfoEau.fr" },
      publisher: {
        "@type": "Organization",
        name: "InfoEau.fr",
        logo: { "@type": "ImageObject", url: "https://infoeau.fr/favicon.svg" },
      },
      datePublished: TODAY,
      dateModified: TODAY,
      mainEntityOfPage: `https://infoeau.fr${CANONICAL}`,
      inLanguage: language === "en" ? "en-US" : "fr-FR",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t("common.breadcrumb.home"), item: "https://infoeau.fr/" },
        { "@type": "ListItem", position: 2, name: t("bof.breadcrumb.guides"), item: "https://infoeau.fr/traiter-eau-robinet" },
        { "@type": "ListItem", position: 3, name: t("bof.breadcrumb.current"), item: `https://infoeau.fr${CANONICAL}` },
      ],
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={t("bof.seo.title")}
        description={t("bof.seo.desc")}
        canonical={CANONICAL}
        keywords="eau en bouteille ou robinet, coût eau bouteille, économie carafe filtrante, prix eau du robinet, filtration eau coût"
        schemaData={schemas}
      />

      <div className="min-h-screen bg-background">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-blue-50 via-sky-50 to-emerald-50">
          <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16 lg:py-20">
            <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-foreground">
                {t("common.breadcrumb.home")}
              </Link>
              <span className="mx-2">›</span>
              <Link to="/traiter-eau-robinet" className="hover:text-foreground">
                {t("bof.breadcrumb.guides")}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-foreground">{t("bof.breadcrumb.current")}</span>
            </nav>

            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              <Wallet className="w-4 h-4" />
              <span>{t("bof.tag")}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
              {t("bof.h1")}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {t("bof.intro.p1")}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {t("bof.intro.p2")}
            </p>

            <div className="mt-8 flex items-start gap-3 rounded-xl bg-white/70 backdrop-blur px-4 py-3 text-sm text-muted-foreground ring-1 ring-black/5 max-w-3xl">
              <Info className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
              <p className="m-0">{t("bof.intro.note")}</p>
            </div>
          </div>
        </section>

        {/* CALCULATEUR */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight flex items-center gap-3">
              <Calculator className="w-8 h-8 text-blue-600 shrink-0" />
              {t("bof.calc.title")}
            </h2>
            <BottleVsFilterCalculator />
          </div>
        </section>

        {/* CE QUE LA FILTRATION FAIT */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
              {t("bof.does.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("bof.does.p1")}</p>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("bof.does.p2")}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{t("bof.does.p3")}</p>

            <div className="flex flex-wrap gap-4 text-sm">
              <Link to="/comparatif-carafes" className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline">
                {t("bof.does.link1")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/guide/quel-filtre-eau" className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline">
                {t("bof.does.link2")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* QUAND LA BOUTEILLE RESTE PERTINENTE */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
              {t("bof.bottle.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("bof.bottle.p1")}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{t("bof.bottle.p2")}</p>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/qualite-eau">
                  {t("bof.bottle.cta.commune")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/diagnostic">{t("bof.bottle.cta.diagnostic")}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-blue-600" />
              {t("bof.faq.title")}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQ.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* MAILLAGE */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight">
              {t("bof.links.title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {links.map((l) => (
                <Card key={l.to} className="border-border">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{l.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{l.desc}</p>
                    <Link to={l.to} className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
                      {l.title}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
