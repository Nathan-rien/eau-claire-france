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
import {
  Droplets,
  Filter,
  FlaskConical,
  Gauge,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CANONICAL = "/traiter-eau-robinet";

export default function TraiterEauRobinet() {
  const { t, language } = useLanguage();

  const reasons = [
    {
      icon: Droplets,
      title: t("tr.why.chlore.title"),
      text: t("tr.why.chlore.text"),
      to: "/guide/gout-chlore",
      link: t("tr.why.chlore.link"),
    },
    {
      icon: Gauge,
      title: t("tr.why.calcaire.title"),
      text: t("tr.why.calcaire.text"),
      to: "/guide/eau-calcaire",
      link: t("tr.why.calcaire.link"),
    },
    {
      icon: FlaskConical,
      title: t("tr.why.nitrates.title"),
      text: t("tr.why.nitrates.text"),
      to: "/guide/nitrates-eau",
      link: t("tr.why.nitrates.link"),
    },
    {
      icon: ShieldCheck,
      title: t("tr.why.plomb.title"),
      text: t("tr.why.plomb.text"),
      to: "/guide/plomb-eau",
      link: t("tr.why.plomb.link"),
    },
  ];

  const solutions = [
    {
      key: "carafe",
      title: t("tr.sol.carafe.title"),
      treats: t("tr.sol.carafe.treats"),
      who: t("tr.sol.carafe.who"),
      limits: t("tr.sol.carafe.limits"),
    },
    {
      key: "robinet",
      title: t("tr.sol.robinet.title"),
      treats: t("tr.sol.robinet.treats"),
      who: t("tr.sol.robinet.who"),
      limits: t("tr.sol.robinet.limits"),
    },
    {
      key: "osmoseur",
      title: t("tr.sol.osmoseur.title"),
      treats: t("tr.sol.osmoseur.treats"),
      who: t("tr.sol.osmoseur.who"),
      limits: t("tr.sol.osmoseur.limits"),
    },
    {
      key: "adoucisseur",
      title: t("tr.sol.adoucisseur.title"),
      treats: t("tr.sol.adoucisseur.treats"),
      who: t("tr.sol.adoucisseur.who"),
      limits: t("tr.sol.adoucisseur.limits"),
    },
  ];

  const FAQ = [1, 2, 3, 4, 5, 6].map((i) => ({
    q: t(`tr.faq.q${i}.q`),
    a: t(`tr.faq.q${i}.a`),
  }));

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: t("tr.h1"),
      description: t("tr.seo.description"),
      author: { "@type": "Organization", name: "InfoEau.fr" },
      publisher: {
        "@type": "Organization",
        name: "InfoEau.fr",
        logo: { "@type": "ImageObject", url: "https://infoeau.fr/favicon.svg" },
      },
      datePublished: "2026-07-30",
      dateModified: "2026-07-30",
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
        { "@type": "ListItem", position: 2, name: t("tr.breadcrumb.guides"), item: "https://infoeau.fr/qualite-eau" },
        { "@type": "ListItem", position: 3, name: t("tr.breadcrumb.current"), item: `https://infoeau.fr${CANONICAL}` },
      ],
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={t("tr.seo.title")}
        description={t("tr.seo.description")}
        canonical={CANONICAL}
        keywords="traiter eau du robinet, améliorer eau du robinet, filtrer eau robinet, carafe filtrante, osmoseur, adoucisseur, goût de chlore, eau calcaire"
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
              <span>{t("tr.breadcrumb.guides")}</span>
              <span className="mx-2">›</span>
              <span className="text-foreground">{t("tr.breadcrumb.current")}</span>
            </nav>

            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              <Filter className="w-4 h-4" />
              <span>{t("tr.tag")}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
              {t("tr.h1")}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {t("tr.intro.p1")}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {t("tr.intro.p2")}
            </p>

            <div className="mt-8 flex items-start gap-3 rounded-xl bg-white/70 backdrop-blur px-4 py-3 text-sm text-muted-foreground ring-1 ring-black/5 max-w-3xl">
              <Info className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
              <p className="m-0">{t("tr.intro.note")}</p>
            </div>
          </div>
        </section>

        {/* POURQUOI */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight">
              {t("tr.why.title")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reasons.map((r) => (
                <Card key={r.to} className="border-border">
                  <CardContent className="p-6">
                    <r.icon className="w-6 h-6 text-blue-600 mb-3" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">{r.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{r.text}</p>
                    <Link
                      to={r.to}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
                    >
                      {r.link}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTIONS */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
              {t("tr.sol.title")}
            </h2>
            <p className="text-muted-foreground max-w-3xl mb-8">{t("tr.sol.intro")}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {solutions.map((s) => (
                <Card key={s.key} className="border-border bg-card">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-4">{s.title}</h3>
                    <dl className="space-y-3 text-sm">
                      <div>
                        <dt className="font-semibold text-foreground">{t("tr.sol.label.treats")}</dt>
                        <dd className="text-muted-foreground m-0">{s.treats}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-foreground">{t("tr.sol.label.who")}</dt>
                        <dd className="text-muted-foreground m-0">{s.who}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-foreground">{t("tr.sol.label.limits")}</dt>
                        <dd className="text-muted-foreground m-0">{s.limits}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{t("tr.sol.none.title")}</h3>
                  <p className="text-muted-foreground m-0">{t("tr.sol.none.text")}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <Link to="/guide/quel-filtre-eau" className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline">
                {t("tr.sol.compare.link")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/comparatif-carafes" className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline">
                {t("tr.sol.carafes.link")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* BESOIN */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
              {t("tr.need.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("tr.need.p1")}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{t("tr.need.p2")}</p>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/qualite-eau">
                  {t("tr.need.cta.commune")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/diagnostic">{t("tr.need.cta.diagnostic")}</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/polluants">{t("tr.need.cta.pollutants")}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* COUT */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              {t("tr.cost.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{t("tr.cost.p1")}</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 text-sm">
              <Link to="/bouteille-ou-filtration" className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline">
                {t("tr.cost.link")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/prix-eaux" className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline">
                {t("tr.cost.link2")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/classement" className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline">
                {t("tr.cost.link3")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-blue-600" />
              {t("tr.faq.title")}
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
      </div>
    </Layout>
  );
}
