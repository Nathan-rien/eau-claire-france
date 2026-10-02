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

const CANONICAL = "/eau-sans-chlore";
const PUBLISHED = "2026-10-02";

export default function EauSansChlore() {
  const { t, language } = useLanguage();

  const stats = [1, 2, 3, 4, 5].map((i) => ({
    value: t(`nochlore.stats.${i}.value`),
    label: t(`nochlore.stats.${i}.label`),
  }));

  const rows = [1, 2, 3, 4].map((i) => ({
    name: t(`nochlore.where.row${i}.name`),
    ttp: t(`nochlore.where.row${i}.ttp`),
    udi: t(`nochlore.where.row${i}.udi`),
    pop: t(`nochlore.where.row${i}.pop`),
  }));

  const FAQ = [1, 2, 3, 4].map((i) => ({
    q: t(`nochlore.faq.q${i}.q`),
    a: t(`nochlore.faq.q${i}.a`),
  }));

  const links = [
    { to: "/traiter-eau-robinet", title: t("nochlore.links.pillar"), desc: t("nochlore.links.pillar.desc") },
    { to: "/guide/gout-chlore", title: t("nochlore.links.chlore"), desc: t("nochlore.links.chlore.desc") },
    { to: "/qualite-eau", title: t("nochlore.links.quality"), desc: t("nochlore.links.quality.desc") },
    { to: "/durete-eau-france", title: t("nochlore.links.durete"), desc: t("nochlore.links.durete.desc") },
  ];

  const sources = [1, 2, 3, 4].map((i) => t(`nochlore.sources.${i}`));

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: t("nochlore.h1"),
      description: t("nochlore.seo.desc"),
      author: { "@type": "Organization", name: "InfoEau.fr" },
      publisher: {
        "@type": "Organization",
        name: "InfoEau.fr",
        logo: { "@type": "ImageObject", url: "https://infoeau.fr/favicon.svg" },
      },
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
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
        { "@type": "ListItem", position: 2, name: t("nochlore.breadcrumb.guides"), item: "https://infoeau.fr/traiter-eau-robinet" },
        { "@type": "ListItem", position: 3, name: t("nochlore.breadcrumb.current"), item: `https://infoeau.fr${CANONICAL}` },
      ],
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={t("nochlore.seo.title")}
        description={t("nochlore.seo.desc")}
        canonical={CANONICAL}
        keywords="eau sans chlore, eau du robinet sans chlore, Anses eau sans chlore, réseau non chloré, Grenoble eau sans chlore, EpiGEH"
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
                {t("nochlore.breadcrumb.guides")}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-foreground">{t("nochlore.breadcrumb.current")}</span>
            </nav>

            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              <Droplets className="w-4 h-4" />
              <span>{t("nochlore.tag")}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
              {t("nochlore.h1")}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {t("nochlore.intro.p1")}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {t("nochlore.intro.p2")}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/qualite-eau">
                  {t("nochlore.intro.cta.quality")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/traiter-eau-robinet">{t("nochlore.intro.cta.pillar")}</Link>
              </Button>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-xl bg-white/70 backdrop-blur px-4 py-3 text-sm text-muted-foreground ring-1 ring-black/5 max-w-3xl">
              <Info className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
              <p className="m-0">{t("nochlore.intro.p3")}</p>
            </div>
          </div>
        </section>

        {/* CHIFFRES CLES */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              {t("nochlore.stats.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl">{t("nochlore.stats.intro")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {stats.map((s) => (
                <Card key={s.value} className="border-border">
                  <CardContent className="p-6">
                    <p className="text-3xl font-bold text-blue-700 mb-2 tracking-tight">{s.value}</p>
                    <p className="text-muted-foreground leading-relaxed m-0">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* OU EN FRANCE */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              {t("nochlore.where.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("nochlore.where.intro")}</p>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("nochlore.where.p1")}</p>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("nochlore.where.p2")}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{t("nochlore.where.p3")}</p>

            <details className="group rounded-xl border border-border bg-background">
              <summary className="cursor-pointer select-none px-4 py-3 font-semibold text-foreground">
                {t("nochlore.where.table.title")}
              </summary>
              <div className="overflow-x-auto px-2 pb-2">
                <Table className="min-w-[560px]">
                  <TableCaption className="px-2 pb-2 text-left">{t("nochlore.where.table.caption")}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("nochlore.where.col.dept")}</TableHead>
                      <TableHead>{t("nochlore.where.col.ttp")}</TableHead>
                      <TableHead>{t("nochlore.where.col.udi")}</TableHead>
                      <TableHead>{t("nochlore.where.col.pop")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.name}>
                        <TableCell className="font-semibold text-foreground">{r.name}</TableCell>
                        <TableCell className="text-muted-foreground">{r.ttp}</TableCell>
                        <TableCell className="text-muted-foreground">{r.udi}</TableCell>
                        <TableCell className="text-muted-foreground">{r.pop}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="px-2 pt-2 pb-2 text-sm text-muted-foreground m-0">{t("nochlore.where.occitanie")}</p>
              </div>
            </details>
          </div>
        </section>

        {/* EST-CE DANGEREUX */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-blue-600 shrink-0" />
              {t("nochlore.risk.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("nochlore.risk.p1")}</p>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("nochlore.risk.p2")}</p>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("nochlore.risk.p3")}</p>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("nochlore.risk.p4")}</p>
            <p className="text-muted-foreground leading-relaxed mb-6">{t("nochlore.risk.p5")}</p>
            <div className="flex items-start gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-foreground ring-1 ring-blue-100">
              <Info className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
              <p className="m-0 leading-relaxed">{t("nochlore.risk.p6")}</p>
            </div>
          </div>
        </section>

        {/* POURQUOI */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
              {t("nochlore.why.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("nochlore.why.p1")}</p>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("nochlore.why.p2")}</p>
            <p className="text-muted-foreground leading-relaxed">{t("nochlore.why.p3")}</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-blue-600" />
              {t("nochlore.faq.title")}
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
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight">
              {t("nochlore.links.title")}
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

        {/* SOURCES */}
        <section className="px-4 py-10">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-xl font-bold text-foreground mb-3 tracking-tight">{t("nochlore.sources.title")}</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {sources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </Layout>
  );
}
