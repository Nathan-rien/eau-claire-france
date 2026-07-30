import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Droplets, Info, ShieldAlert, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CANONICAL = "/guide/eau-calcaire";
const TODAY = new Date().toISOString().slice(0, 10);

export default function GuideEauCalcaire() {
  const { t, language } = useLanguage();

  const FAQ = [1, 2, 3, 4].map((i) => ({
    q: t(`sat.calcaire.faq.q${i}.q`),
    a: t(`sat.calcaire.faq.q${i}.a`),
  }));

  const solutions = [1, 2, 3, 4].map((i) => ({
    title: t(`sat.calcaire.sol.${i}.t`),
    desc: t(`sat.calcaire.sol.${i}.d`),
  }));

  const links = [
    { to: "/traiter-eau-robinet", title: t("sat.calcaire.links.pillar"), desc: t("sat.calcaire.links.pillar.desc") },
    { to: "/comparatif-carafes", title: t("sat.calcaire.links.carafes"), desc: t("sat.calcaire.links.carafes.desc") },
    { to: "/guide/quel-filtre-eau", title: t("sat.calcaire.links.filter"), desc: t("sat.calcaire.links.filter.desc") },
    { to: "/guide/gout-chlore", title: t("sat.calcaire.links.chlore"), desc: t("sat.calcaire.links.chlore.desc") },
    { to: "/diagnostic", title: t("sat.calcaire.links.diagnostic"), desc: t("sat.calcaire.links.diagnostic.desc") },
    { to: "/qualite-eau", title: t("sat.calcaire.links.quality"), desc: t("sat.calcaire.links.quality.desc") },
  ];

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: t("sat.calcaire.h1"),
      description: t("sat.calcaire.seoDesc"),
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
        { "@type": "ListItem", position: 2, name: t("sat.calcaire.breadcrumb.guides"), item: "https://infoeau.fr/traiter-eau-robinet" },
        { "@type": "ListItem", position: 3, name: t("sat.calcaire.breadcrumb.current"), item: `https://infoeau.fr${CANONICAL}` },
      ],
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={t("sat.calcaire.seoTitle")}
        description={t("sat.calcaire.seoDesc")}
        canonical={CANONICAL}
        keywords="eau calcaire, eau dure que faire, dureté de l'eau, adoucisseur eau boisson, détartrage, calcaire santé"
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
                {t("sat.calcaire.breadcrumb.guides")}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-foreground">{t("sat.calcaire.breadcrumb.current")}</span>
            </nav>

            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              <Droplets className="w-4 h-4" />
              <span>{t("sat.calcaire.tag")}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
              {t("sat.calcaire.h1")}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {t("sat.calcaire.p1")}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {t("sat.calcaire.p2")}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {t("sat.calcaire.p3")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/diagnostic">
                  {t("sat.calcaire.cta.diag")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/qualite-eau">{t("sat.calcaire.cta.quality")}</Link>
              </Button>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-xl bg-white/70 backdrop-blur px-4 py-3 text-sm text-muted-foreground ring-1 ring-black/5 max-w-3xl">
              <Info className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
              <p className="m-0">{t("sat.calcaire.note")}</p>
            </div>
          </div>
        </section>

        {/* SUIS-JE CONCERNÉ */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
              {t("sat.calcaire.concerned.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("sat.calcaire.concerned.p1")}</p>
            <p className="text-muted-foreground leading-relaxed">
              {t("sat.calcaire.concerned.p2")}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium">
              <Link to="/qualite-eau" className="inline-flex items-center gap-1 text-blue-700 hover:underline">
                {t("sat.calcaire.links.quality")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/diagnostic" className="inline-flex items-center gap-1 text-blue-700 hover:underline">
                {t("sat.calcaire.links.diagnostic")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SOLUTIONS */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              {t("sat.calcaire.sol.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{t("sat.calcaire.sol.intro")}</p>

            <div className="space-y-5">
              {solutions.map((s, i) => (
                <Card key={s.title} className="border-border">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      <span className="text-blue-700 mr-2">{i + 1}.</span>
                      {s.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed m-0">{s.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6">
              <Link to="/comparatif-carafes" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
                {t("sat.calcaire.links.carafes")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* LIMITES */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-blue-600 shrink-0" />
              {t("sat.calcaire.limits.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("sat.calcaire.limits.p1")}</p>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("sat.calcaire.limits.p2")}</p>
            <p className="text-muted-foreground leading-relaxed">{t("sat.calcaire.limits.p3")}</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-blue-600" />
              {t("sat.calcaire.faq.title")}
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
              {t("sat.calcaire.links.title")}
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
