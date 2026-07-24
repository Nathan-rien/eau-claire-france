import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import InternalLinkHub from "@/components/InternalLinkHub";
import { Button } from "@/components/ui/button";
import { Droplets, Zap, Heart, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MagnesiumWater {
  brand: string;
  magnesium: number;
  calcium: number;
  sodium: number;
  type: "plate" | "gazeuse";
  source: string;
  highlightKey?: string;
  marqueSlug?: string;
}

const WATERS: MagnesiumWater[] = [
  { brand: "Rozana", magnesium: 160, calcium: 301, sodium: 493, type: "gazeuse", source: "Rozana (Marne)", highlightKey: "mg.highlight.rozana" },
  { brand: "Hépar", magnesium: 119, calcium: 555, sodium: 14, type: "plate", source: "Vittel (Vosges)", highlightKey: "mg.highlight.hepar", marqueSlug: "hepar" },
  { brand: "Badoit", magnesium: 85, calcium: 190, sodium: 150, type: "gazeuse", source: "Saint-Galmier (Loire)", marqueSlug: "badoit" },
  { brand: "Quézac", magnesium: 95, calcium: 241, sodium: 255, type: "gazeuse", source: "Quézac (Lozère)" },
  { brand: "Saint-Yorre", magnesium: 80, calcium: 160, sodium: 1708, type: "gazeuse", source: "Saint-Yorre (Allier)", highlightKey: "mg.highlight.styorre" },
  { brand: "Contrex", magnesium: 74.5, calcium: 468, sodium: 9.1, type: "plate", source: "Contrexéville (Vosges)", marqueSlug: "contrex" },
  { brand: "Courmayeur", magnesium: 52, calcium: 517, sodium: 1.2, type: "plate", source: "Courmayeur (Italie)" },
  { brand: "Vichy Célestins", magnesium: 11, calcium: 103, sodium: 1172, type: "gazeuse", source: "Vichy (Allier)" },
  { brand: "Evian", magnesium: 26, calcium: 80, sodium: 6.5, type: "plate", source: "Évian-les-Bains (Haute-Savoie)" },
  { brand: "Vittel", magnesium: 20, calcium: 240, sodium: 4.7, type: "plate", source: "Vittel (Vosges)" },
];

// Fallback highlights (untranslated brand context)
const HIGHLIGHT_FALLBACK: Record<string, { fr: string; en: string }> = {
  "mg.highlight.rozana": { fr: "La plus riche en magnésium disponible en France", en: "The most magnesium-rich water available in France" },
  "mg.highlight.hepar": { fr: "Recommandée pour lutter contre la constipation", en: "Recommended to fight constipation" },
  "mg.highlight.styorre": { fr: "Attention : très riche en sodium", en: "Warning: very rich in sodium" },
};

export default function GuideEauxMagnesium() {
  const { t, language } = useLanguage();
  const sorted = [...WATERS].sort((a, b) => b.magnesium - a.magnesium);
  const canonical = "/guide/eaux-riches-magnesium";

  const FAQ = [
    { q: t('mg.faq.q1.q'), a: t('mg.faq.q1.a') },
    { q: t('mg.faq.q2.q'), a: t('mg.faq.q2.a') },
    { q: t('mg.faq.q3.q'), a: t('mg.faq.q3.a') },
    { q: t('mg.faq.q4.q'), a: t('mg.faq.q4.a') },
    { q: t('mg.faq.q5.q'), a: t('mg.faq.q5.a') },
  ];

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: t('mg.seo.title'),
      description: t('mg.seo.description'),
      author: { "@type": "Organization", name: "InfoEau.fr" },
      publisher: {
        "@type": "Organization",
        name: "InfoEau.fr",
        logo: { "@type": "ImageObject", url: "https://infoeau.fr/favicon.svg" },
      },
      datePublished: "2026-07-09",
      dateModified: "2026-07-09",
      mainEntityOfPage: `https://infoeau.fr${canonical}`,
      inLanguage: language === 'en' ? 'en-US' : 'fr-FR',
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
        { "@type": "ListItem", position: 1, name: t('common.breadcrumb.home'), item: "https://infoeau.fr/" },
        { "@type": "ListItem", position: 2, name: t('mg.breadcrumb.guides'), item: "https://infoeau.fr/guide/eaux-riches-magnesium" },
        { "@type": "ListItem", position: 3, name: t('mg.breadcrumb.current'), item: `https://infoeau.fr${canonical}` },
      ],
    },
  ];

  const getHighlight = (key?: string) => {
    if (!key) return null;
    return HIGHLIGHT_FALLBACK[key]?.[language] ?? null;
  };

  return (
    <Layout>
      <SEOHead
        title={t('mg.seo.title')}
        description={t('mg.seo.description')}
        canonical={canonical}
        keywords="eau riche en magnésium, hépar magnésium, rozana, contrex, meilleure eau magnésium, eau minérale magnésium, fatigue eau"
        schemaData={schemas}
      />

      <div className="min-h-screen bg-background">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
          <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16 lg:py-20">
            <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-foreground">{t('common.breadcrumb.home')}</Link>
              <span className="mx-2">›</span>
              <span>{t('mg.breadcrumb.guides')}</span>
              <span className="mx-2">›</span>
              <span className="text-foreground">{t('mg.breadcrumb.current')}</span>
            </nav>

            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-4">
              <Zap className="w-4 h-4" />
              <span>{t('mg.tag')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight leading-[1.1]">
              {t('mg.h1.pre')}{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {t('mg.h1.highlight')}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
              {t('mg.intro')}
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-2 text-sm text-foreground shadow-sm ring-1 ring-black/5">
                <Droplets className="w-4 h-4 text-emerald-600" />
                {WATERS.length} {t('mg.stat.count')}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-2 text-sm text-foreground shadow-sm ring-1 ring-black/5">
                <Heart className="w-4 h-4 text-rose-500" />
                {t('mg.stat.anses')}
              </div>
            </div>
          </div>
        </section>

        {/* Pourquoi le magnésium */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl prose prose-slate max-w-none">
            <h2>{t('mg.why.title')}</h2>
            <p>
              {t('mg.why.p1.a')}<strong>{t('mg.why.p1.b')}</strong>{t('mg.why.p1.c')}<strong>{t('mg.why.p1.d')}</strong>{t('mg.why.p1.e')}
            </p>
            <p>
              {t('mg.why.p2.a')}<strong>{t('mg.why.p2.b')}</strong>{t('mg.why.p2.c')}
            </p>

            <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
              {[
                { icon: Zap, title: t('mg.benefit.fatigue.title'), text: t('mg.benefit.fatigue.text') },
                { icon: Heart, title: t('mg.benefit.heart.title'), text: t('mg.benefit.heart.text') },
                { icon: CheckCircle2, title: t('mg.benefit.stress.title'), text: t('mg.benefit.stress.text') },
              ].map((b) => (
                <div key={b.title} className="rounded-xl border border-border p-5 bg-card">
                  <b.icon className="w-6 h-6 text-emerald-600 mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground m-0">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tableau comparatif */}
        <section className="px-4 pb-12 md:pb-16">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">
              {t('mg.table.title')}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t('mg.table.subtitle')}
            </p>

            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">#</th>
                    <th className="text-left px-4 py-3 font-semibold">{t('mg.table.water')}</th>
                    <th className="text-right px-4 py-3 font-semibold text-emerald-700">{t('mg.table.magnesium')}</th>
                    <th className="text-right px-4 py-3 font-semibold hidden sm:table-cell">{t('mg.table.calcium')}</th>
                    <th className="text-right px-4 py-3 font-semibold hidden md:table-cell">{t('mg.table.sodium')}</th>
                    <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">{t('mg.table.type')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((w, i) => {
                    const highlight = getHighlight(w.highlightKey);
                    return (
                      <tr key={w.brand} className="border-t border-border hover:bg-muted/30">
                        <td className="px-4 py-3 font-semibold text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3">
                          {w.marqueSlug ? (
                            <Link to={`/marque/${w.marqueSlug}`} className="font-semibold text-foreground hover:text-emerald-700">
                              {w.brand}
                            </Link>
                          ) : (
                            <span className="font-semibold text-foreground">{w.brand}</span>
                          )}
                          <div className="text-xs text-muted-foreground">{w.source}</div>
                          {highlight && (
                            <div className="text-xs text-emerald-700 mt-1 flex items-start gap-1">
                              <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                              {highlight}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-baseline gap-1">
                            <strong className="text-lg text-emerald-700">{w.magnesium}</strong>
                            <span className="text-xs text-muted-foreground">mg/L</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">{w.calcium} mg/L</td>
                        <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">{w.sodium} mg/L</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${w.type === "gazeuse" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                            {w.type === "gazeuse" ? t('mg.type.sparkling') : t('mg.type.still')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="m-0">
                {t('mg.disclaimer.a')}<strong>{t('mg.disclaimer.b')}</strong>{t('mg.disclaimer.c')}
              </p>
            </div>
          </div>
        </section>

        {/* Conseils */}
        <section className="px-4 pb-12 md:pb-16">
          <div className="container mx-auto max-w-4xl prose prose-slate max-w-none">
            <h2>{t('mg.tips.title')}</h2>
            <h3>{t('mg.tips.1.h')}</h3>
            <p>{t('mg.tips.1.p')}</p>
            <h3>{t('mg.tips.2.h')}</h3>
            <p>
              {t('mg.tips.2.p.a')}<strong>{t('mg.tips.2.p.b')}</strong>{t('mg.tips.2.p.c')}<strong>{t('mg.tips.2.p.d')}</strong>{t('mg.tips.2.p.e')}<strong>{t('mg.tips.2.p.f')}</strong>{t('mg.tips.2.p.g')}
            </p>
            <h3>{t('mg.tips.3.h')}</h3>
            <p>
              {t('mg.tips.3.p.a')}<Link to="/qualite-eau">{t('mg.tips.3.p.link')}</Link>{t('mg.tips.3.p.b')}
            </p>

            <h2>{t('mg.faq.title')}</h2>
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-16">
          <div className="container mx-auto max-w-4xl">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-8 md:p-12 text-white shadow-xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                {t('mg.cta.title')}
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl">
                {t('mg.cta.body')}
              </p>
              <Link to="/quelle-eau-boire">
                <Button size="lg" variant="secondary" className="bg-white text-emerald-700 hover:bg-white/90 font-semibold">
                  {t('mg.cta.button')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <InternalLinkHub
          heading={t('mg.hub.heading')}
          description={t('mg.hub.description')}
          groups={["decide", "explore"]}
          variant="muted"
        />
      </div>
    </Layout>
  );
}
