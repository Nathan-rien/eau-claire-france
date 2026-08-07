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
import { ArrowRight, Droplets, Info, ShieldAlert, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CANONICAL = "/comparatif-carafes";
const TODAY = new Date().toISOString().slice(0, 10);

export default function ComparatifCarafes() {
  const { t, language } = useLanguage();

  const FAQ = [1, 2, 3, 4, 5].map((i) => ({
    q: t(`cc.faq.q${i}.q`),
    a: t(`cc.faq.q${i}.a`),
  }));

  const rows = [1, 2, 3].map((i) => ({
    type: t(`cc.row${i}.type`),
    treats: t(`cc.row${i}.treats`),
    cost: t(`cc.row${i}.cost`),
    maint: t(`cc.row${i}.maint`),
    limits: t(`cc.row${i}.limits`),
  }));

  const criteria = [1, 2, 3, 4, 5].map((i) => ({
    title: t(`cc.choose.${i}.t`),
    desc: t(`cc.choose.${i}.d`),
  }));

  const links = [
    { to: "/traiter-eau-robinet", title: t("cc.links.pillar"), desc: t("cc.links.pillar.desc") },
    { to: "/guide/quel-filtre-eau", title: t("cc.links.filter"), desc: t("cc.links.filter.desc") },
    { to: "/bouteille-ou-filtration", title: t("cc.links.bof"), desc: t("cc.links.bof.desc") },
    { to: "/diagnostic", title: t("cc.links.diagnostic"), desc: t("cc.links.diagnostic.desc") },
    { to: "/qualite-eau", title: t("cc.links.quality"), desc: t("cc.links.quality.desc") },
    { to: "/classement", title: t("cc.links.ranking"), desc: t("cc.links.ranking.desc") },
    { to: "/prix-eaux", title: t("cc.links.prices"), desc: t("cc.links.prices.desc") },
  ];

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: t("cc.h1"),
      description: t("cc.seo.desc"),
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
        { "@type": "ListItem", position: 2, name: t("cc.breadcrumb.guides"), item: "https://infoeau.fr/traiter-eau-robinet" },
        { "@type": "ListItem", position: 3, name: t("cc.breadcrumb.current"), item: `https://infoeau.fr${CANONICAL}` },
      ],
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={t("cc.seo.title")}
        description={t("cc.seo.desc")}
        canonical={CANONICAL}
        keywords="comparatif carafe filtrante, bien choisir carafe filtrante, cartouche filtrante coût, filtre sur robinet, entretien carafe filtrante"
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
                {t("cc.breadcrumb.guides")}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-foreground">{t("cc.breadcrumb.current")}</span>
            </nav>

            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              <Droplets className="w-4 h-4" />
              <span>{t("cc.tag")}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
              {t("cc.h1")}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {t("cc.intro.p1")}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {t("cc.intro.p2")}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {t("cc.intro.p3")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/diagnostic">
                  {t("cc.intro.cta.diag")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/qualite-eau">{t("cc.intro.cta.quality")}</Link>
              </Button>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-xl bg-white/70 backdrop-blur px-4 py-3 text-sm text-muted-foreground ring-1 ring-black/5 max-w-3xl">
              <Info className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
              <p className="m-0">{t("cc.intro.note")}</p>
            </div>
          </div>
        </section>

        {/* TABLEAU COMPARATIF */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              {t("cc.table.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl">
              {t("cc.table.intro")}
            </p>

            <div className="overflow-x-auto rounded-xl border border-border">
              <Table className="min-w-[860px]">
                <TableCaption className="px-4 pb-4 text-left">{t("cc.table.caption")}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">{t("cc.table.col.type")}</TableHead>
                    <TableHead>{t("cc.table.col.treats")}</TableHead>
                    <TableHead>{t("cc.table.col.cost")}</TableHead>
                    <TableHead>{t("cc.table.col.maint")}</TableHead>
                    <TableHead>{t("cc.table.col.limits")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.type}>
                      <TableCell className="font-semibold text-foreground align-top">{r.type}</TableCell>
                      <TableCell className="text-muted-foreground align-top">{r.treats}</TableCell>
                      <TableCell className="text-muted-foreground align-top">{r.cost}</TableCell>
                      <TableCell className="text-muted-foreground align-top">{r.maint}</TableCell>
                      <TableCell className="text-muted-foreground align-top">{r.limits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        {/* COMMENT CHOISIR */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              {t("cc.choose.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{t("cc.choose.intro")}</p>

            <div className="space-y-5">
              {criteria.map((c, i) => (
                <Card key={c.title} className="border-border">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      <span className="text-blue-700 mr-2">{i + 1}.</span>
                      {c.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed m-0">{c.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ENTRETIEN */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-blue-600 shrink-0" />
              {t("cc.maint.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("cc.maint.p1")}</p>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("cc.maint.p2")}</p>
            <p className="text-muted-foreground leading-relaxed">{t("cc.maint.p3")}</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-blue-600" />
              {t("cc.faq.title")}
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
              {t("cc.links.title")}
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
