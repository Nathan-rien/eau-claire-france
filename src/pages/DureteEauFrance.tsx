import { Link } from '@/components/LocalizedLink';
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Droplets, Info, Mountain, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CANONICAL = "/durete-eau-france";
const TODAY = new Date().toISOString().slice(0, 10);

export default function DureteEauFrance() {
  const { t, language } = useLanguage();

  const FAQ = [1, 2, 3, 4, 5].map((i) => ({
    q: t(`durete.faq.q${i}.q`),
    a: t(`durete.faq.q${i}.a`),
  }));

  const rows = [1, 2, 3, 4, 5, 6].map((i) => ({
    region: t(`durete.row${i}.region`),
    geo: t(`durete.row${i}.geo`),
    trend: t(`durete.row${i}.trend`),
  }));

  const links = [
    { to: "/traiter-eau-robinet", title: t("durete.links.pillar"), desc: t("durete.links.pillar.desc") },
    { to: "/guide/eau-calcaire", title: t("durete.links.calcaire"), desc: t("durete.links.calcaire.desc") },
    { to: "/comparatif-carafes", title: t("durete.links.carafes"), desc: t("durete.links.carafes.desc") },
    { to: "/qualite-eau", title: t("durete.links.quality"), desc: t("durete.links.quality.desc") },
    { to: "/diagnostic", title: t("durete.links.diagnostic"), desc: t("durete.links.diagnostic.desc") },
  ];

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: t("durete.h1"),
      description: t("durete.seo.desc"),
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
        { "@type": "ListItem", position: 2, name: t("durete.breadcrumb.guides"), item: "https://infoeau.fr/traiter-eau-robinet" },
        { "@type": "ListItem", position: 3, name: t("durete.breadcrumb.current"), item: `https://infoeau.fr${CANONICAL}` },
      ],
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={t("durete.seo.title")}
        description={t("durete.seo.desc")}
        canonical={CANONICAL}
        keywords="dureté eau France, carte dureté eau, régions eau calcaire, régions eau douce, TH eau du robinet"
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
                {t("durete.breadcrumb.guides")}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-foreground">{t("durete.breadcrumb.current")}</span>
            </nav>

            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              <Droplets className="w-4 h-4" />
              <span>{t("durete.tag")}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
              {t("durete.h1")}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {t("durete.intro.p1")}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {t("durete.intro.p2")}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {t("durete.intro.p3")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/qualite-eau">
                  {t("durete.intro.cta.quality")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/diagnostic">{t("durete.intro.cta.diag")}</Link>
              </Button>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-xl bg-white/70 backdrop-blur px-4 py-3 text-sm text-muted-foreground ring-1 ring-black/5 max-w-3xl">
              <Info className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
              <p className="m-0">{t("durete.intro.note")}</p>
            </div>
          </div>
        </section>

        {/* POURQUOI LA DURETE VARIE */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight flex items-center gap-3">
              <Mountain className="w-8 h-8 text-blue-600 shrink-0" />
              {t("durete.why.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("durete.why.p1")}</p>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("durete.why.p2")}</p>
            <p className="text-muted-foreground leading-relaxed">{t("durete.why.p3")}</p>
          </div>
        </section>

        {/* TENDANCES PAR REGION */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              {t("durete.table.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl">
              {t("durete.table.intro")}
            </p>

            <div className="overflow-x-auto rounded-xl border border-border bg-background">
              <Table className="min-w-[760px]">
                <TableCaption className="px-4 pb-4 text-left">{t("durete.table.caption")}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[260px]">{t("durete.table.col.region")}</TableHead>
                    <TableHead>{t("durete.table.col.geo")}</TableHead>
                    <TableHead>{t("durete.table.col.trend")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.region}>
                      <TableCell className="font-semibold text-foreground align-top">{r.region}</TableCell>
                      <TableCell className="text-muted-foreground align-top">{r.geo}</TableCell>
                      <TableCell className="text-muted-foreground align-top">{r.trend}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        {/* SANTE / CONFORT */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
              {t("durete.health.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("durete.health.p1")}</p>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("durete.health.p2")}</p>
            <p className="text-muted-foreground leading-relaxed mb-6">{t("durete.health.p3")}</p>
            <Link
              to="/guide/eau-calcaire"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
            >
              {t("durete.health.cta")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* VERIFIER SA COMMUNE */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
              {t("durete.check.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("durete.check.p1")}</p>
            <p className="text-muted-foreground leading-relaxed mb-6">{t("durete.check.p2")}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/qualite-eau">
                  {t("durete.intro.cta.quality")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/diagnostic">{t("durete.intro.cta.diag")}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-blue-600" />
              {t("durete.faq.title")}
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
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-t border-border">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight">
              {t("durete.links.title")}
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
