import { Link } from "react-router-dom";
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
import { ArrowRight, Droplets, Info, ShieldAlert, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CANONICAL = "/guide/quel-filtre-eau";
const PREFIX = "sat.quelfiltre";
const TODAY = new Date().toISOString().slice(0, 10);

type Verdict = "ok" | "partial" | "no";

/** rows = problems, columns = solutions (carafe, tap, ro, softener, resin) */
const DECISION: { row: string; cells: Verdict[] }[] = [
  { row: "taste", cells: ["ok", "ok", "ok", "no", "no"] },
  { row: "lime", cells: ["no", "no", "partial", "ok", "partial"] },
  { row: "nitrate", cells: ["no", "no", "ok", "no", "ok"] },
  { row: "lead", cells: ["no", "partial", "ok", "no", "no"] },
  { row: "ok", cells: ["no", "no", "no", "no", "no"] },
];

const COLS = ["carafe", "tap", "ro", "softener", "resin"] as const;

const verdictClass: Record<Verdict, string> = {
  ok: "text-emerald-700 font-semibold",
  partial: "text-amber-700 font-medium",
  no: "text-muted-foreground",
};

export default function GuideQuelFiltreEau() {
  const { t, language } = useLanguage();

  const FAQ = [1, 2, 3, 4, 5].map((i) => ({
    q: t(`${PREFIX}.faq.q${i}.q`),
    a: t(`${PREFIX}.faq.q${i}.a`),
  }));

  const solutions = [1, 2, 3, 4, 5].map((i) => ({
    title: t(`${PREFIX}.sol.${i}.t`),
    desc: t(`${PREFIX}.sol.${i}.d`),
  }));

  const steps = [1, 2, 3].map((i) => ({
    title: t(`${PREFIX}.steps.${i}.t`),
    desc: t(`${PREFIX}.steps.${i}.d`),
  }));

  const links = [
    { to: "/traiter-eau-robinet", key: "pillar" },
    { to: "/comparatif-carafes", key: "carafes" },
    { to: "/guide/eau-calcaire", key: "calcaire" },
    { to: "/guide/gout-chlore", key: "chlore" },
    { to: "/guide/nitrates-eau", key: "nitrates" },
    { to: "/guide/plomb-eau", key: "plomb" },
    { to: "/bouteille-ou-filtration", key: "bof" },
    { to: "/diagnostic", key: "diagnostic" },
    { to: "/qualite-eau", key: "quality" },
  ].map((l) => ({
    to: l.to,
    title: t(`${PREFIX}.links.${l.key}`),
    desc: t(`${PREFIX}.links.${l.key}.desc`),
  }));

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: t(`${PREFIX}.h1`),
      description: t(`${PREFIX}.seoDesc`),
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
        { "@type": "ListItem", position: 2, name: t("tr.breadcrumb.current"), item: "https://infoeau.fr/traiter-eau-robinet" },
        { "@type": "ListItem", position: 3, name: t(`${PREFIX}.breadcrumb.current`), item: `https://infoeau.fr${CANONICAL}` },
      ],
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={t(`${PREFIX}.seoTitle`)}
        description={t(`${PREFIX}.seoDesc`)}
        canonical={CANONICAL}
        keywords="quel filtre à eau choisir, carafe filtrante ou osmoseur, filtre sur robinet, osmose inverse maison, adoucisseur eau boisson"
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
                {t("tr.breadcrumb.current")}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-foreground">{t(`${PREFIX}.breadcrumb.current`)}</span>
            </nav>

            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              <Droplets className="w-4 h-4" />
              <span>{t(`${PREFIX}.tag`)}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
              {t(`${PREFIX}.h1`)}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {t(`${PREFIX}.intro.p1`)}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {t(`${PREFIX}.intro.p2`)}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {t(`${PREFIX}.intro.p3`)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/diagnostic">
                  {t(`${PREFIX}.intro.cta.diag`)}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/qualite-eau">{t(`${PREFIX}.intro.cta.quality`)}</Link>
              </Button>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-xl bg-white/70 backdrop-blur px-4 py-3 text-sm text-muted-foreground ring-1 ring-black/5 max-w-3xl">
              <Info className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
              <p className="m-0">{t(`${PREFIX}.intro.note`)}</p>
            </div>
          </div>
        </section>

        {/* TABLEAU DE DÉCISION */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              {t(`${PREFIX}.table.title`)}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl">
              {t(`${PREFIX}.table.intro`)}
            </p>

            <div className="overflow-x-auto rounded-xl ring-1 ring-border">
              <Table className="min-w-[760px]">
                <TableCaption className="px-4 pb-4 text-left">
                  {t(`${PREFIX}.table.caption`)}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">{t(`${PREFIX}.table.col.problem`)}</TableHead>
                    {COLS.map((c) => (
                      <TableHead key={c}>{t(`${PREFIX}.table.col.${c}`)}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DECISION.map((d) => (
                    <TableRow key={d.row}>
                      <TableCell className="font-medium text-foreground">
                        {t(`${PREFIX}.table.row.${d.row}`)}
                      </TableCell>
                      {d.cells.map((v, i) => (
                        <TableCell key={COLS[i]} className={verdictClass[v]}>
                          {t(`${PREFIX}.table.v.${v}`)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground ring-1 ring-border max-w-3xl">
              <ShieldAlert className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
              <p className="m-0">{t(`${PREFIX}.table.note`)}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link to="/guide/nitrates-eau" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
                {t(`${PREFIX}.links.nitrates`)}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/guide/plomb-eau" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
                {t(`${PREFIX}.links.plomb`)}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/guide/eau-calcaire" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
                {t(`${PREFIX}.links.calcaire`)}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SOLUTIONS DÉTAILLÉES */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              {t(`${PREFIX}.sol.title`)}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{t(`${PREFIX}.sol.intro`)}</p>
            <div className="space-y-5">
              {solutions.map((s, i) => (
                <Card key={s.title} className="border-border bg-background">
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
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              {t(`${PREFIX}.sol.note`)}
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link to="/comparatif-carafes" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
                {t(`${PREFIX}.links.carafes`)}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/bouteille-ou-filtration" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
                {t(`${PREFIX}.links.bof`)}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/guide/gout-chlore" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
                {t(`${PREFIX}.links.chlore`)}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 3 ÉTAPES */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight">
              {t(`${PREFIX}.steps.title`)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {steps.map((s) => (
                <Card key={s.title} className="border-border">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                    <p className="text-muted-foreground leading-relaxed m-0">{s.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/diagnostic" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
                {t(`${PREFIX}.links.diagnostic`)}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/qualite-eau" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
                {t(`${PREFIX}.links.quality`)}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/traiter-eau-robinet" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
                {t(`${PREFIX}.links.pillar`)}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-blue-600" />
              {t(`${PREFIX}.faq.title`)}
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
        <section className="px-4 py-12 md:py-16 border-t border-border">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight">
              {t(`${PREFIX}.links.title`)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {links.map((l) => (
                <Card key={l.to} className="border-border bg-background">
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
