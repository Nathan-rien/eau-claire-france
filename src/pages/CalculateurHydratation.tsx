import { Link } from "@/components/LocalizedLink";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import HydrationCalculator from "@/components/HydrationCalculator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Calculator, Droplets, Info, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CANONICAL = "/calculateur-hydratation";
const TODAY = new Date().toISOString().slice(0, 10);

export default function CalculateurHydratation() {
  const { t, language } = useLanguage();

  const FAQ = [1, 2, 3, 4, 5].map((i) => ({
    q: t(`hydration.faq.q${i}.q`),
    a: t(`hydration.faq.q${i}.a`),
  }));

  const varies = [1, 2, 3, 4].map((i) => ({
    title: t(`hydration.varies.i${i}.title`),
    desc: t(`hydration.varies.i${i}.desc`),
  }));

  const links = [
    { to: "/quelle-eau-boire", title: t("hydration.links.which"), desc: t("hydration.links.which.desc") },
    { to: "/traiter-eau-robinet", title: t("hydration.links.treat"), desc: t("hydration.links.treat.desc") },
    { to: "/comparatif-carafes", title: t("hydration.links.carafes"), desc: t("hydration.links.carafes.desc") },
    { to: "/qualite-eau", title: t("hydration.links.quality"), desc: t("hydration.links.quality.desc") },
  ];

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: t("hydration.h1"),
      description: t("hydration.seo.desc"),
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
        {
          "@type": "ListItem",
          position: 2,
          name: t("hydration.breadcrumb.current"),
          item: `https://infoeau.fr${CANONICAL}`,
        },
      ],
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={t("hydration.seo.title")}
        description={t("hydration.seo.desc")}
        canonical={CANONICAL}
        keywords="combien d'eau boire par jour, besoins en eau quotidiens, hydratation, apport hydrique, litres eau par jour"
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
              <span className="text-foreground">{t("hydration.breadcrumb.current")}</span>
            </nav>

            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              <Droplets className="w-4 h-4" />
              <span>{t("hydration.tag")}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
              {t("hydration.h1")}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {t("hydration.intro.p1")}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {t("hydration.intro.p2")}
            </p>

            <div className="mt-8 flex items-start gap-3 rounded-xl bg-white/70 backdrop-blur px-4 py-3 text-sm text-muted-foreground ring-1 ring-black/5 max-w-3xl">
              <Info className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
              <p className="m-0">{t("hydration.intro.note")}</p>
            </div>
          </div>
        </section>

        {/* CALCULATEUR */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight flex items-center gap-3">
              <Calculator className="w-8 h-8 text-blue-600 shrink-0" />
              {t("hydration.calc.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{t("hydration.calc.subtitle")}</p>
            <HydrationCalculator />
          </div>
        </section>

        {/* CE QUI FAIT VARIER */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
              {t("hydration.varies.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{t("hydration.varies.intro")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {varies.map((v) => (
                <Card key={v.title} className="border-border">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CAVEATS SANTÉ */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-amber-600 shrink-0" />
              {t("hydration.caveats.title")}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t("hydration.caveats.p1")}</p>
              <p>{t("hydration.caveats.p2")}</p>
              <p>{t("hydration.caveats.p3")}</p>
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="m-0">{t("hydration.caveats.note")}</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight">
              {t("hydration.faq.title")}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQ.map((f, i) => (
                <AccordionItem key={i} value={`q${i}`}>
                  <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* MAILLAGE */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
              {t("hydration.more.title")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {links.map((l) => (
                <Link key={l.to} to={l.to} className="group">
                  <Card className="h-full border-border transition-colors group-hover:border-blue-400">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        {l.title}
                        <ArrowRight className="w-4 h-4 text-blue-600 transition-transform group-hover:translate-x-1" />
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{l.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
