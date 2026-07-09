import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import InternalLinkHub from "@/components/InternalLinkHub";
import { Button } from "@/components/ui/button";
import { Droplets, Zap, Heart, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";

interface MagnesiumWater {
  brand: string;
  magnesium: number;
  calcium: number;
  sodium: number;
  type: "plate" | "gazeuse";
  source: string;
  highlight?: string;
  marqueSlug?: string;
}

// Teneurs en magnésium (mg/L) — sources : étiquettes officielles des embouteilleurs
const WATERS: MagnesiumWater[] = [
  { brand: "Rozana", magnesium: 160, calcium: 301, sodium: 493, type: "gazeuse", source: "Rozana (Marne)", highlight: "La plus riche en magnésium disponible en France" },
  { brand: "Hépar", magnesium: 119, calcium: 555, sodium: 14, type: "plate", source: "Vittel (Vosges)", highlight: "Recommandée pour lutter contre la constipation", marqueSlug: "hepar" },
  { brand: "Badoit", magnesium: 85, calcium: 190, sodium: 150, type: "gazeuse", source: "Saint-Galmier (Loire)", marqueSlug: "badoit" },
  { brand: "Quézac", magnesium: 95, calcium: 241, sodium: 255, type: "gazeuse", source: "Quézac (Lozère)" },
  { brand: "Saint-Yorre", magnesium: 80, calcium: 160, sodium: 1708, type: "gazeuse", source: "Saint-Yorre (Allier)", highlight: "Attention : très riche en sodium" },
  { brand: "Contrex", magnesium: 74.5, calcium: 468, sodium: 9.1, type: "plate", source: "Contrexéville (Vosges)", marqueSlug: "contrex" },
  { brand: "Courmayeur", magnesium: 52, calcium: 517, sodium: 1.2, type: "plate", source: "Courmayeur (Italie)" },
  { brand: "Vichy Célestins", magnesium: 11, calcium: 103, sodium: 1172, type: "gazeuse", source: "Vichy (Allier)" },
  { brand: "Evian", magnesium: 26, calcium: 80, sodium: 6.5, type: "plate", source: "Évian-les-Bains (Haute-Savoie)" },
  { brand: "Vittel", magnesium: 20, calcium: 240, sodium: 4.7, type: "plate", source: "Vittel (Vosges)" },
];

const FAQ = [
  {
    q: "Quelle est l'eau la plus riche en magnésium ?",
    a: "En France, Rozana est l'eau minérale naturelle qui contient le plus de magnésium (environ 160 mg/L), suivie de très près par Hépar (119 mg/L). Ces deux eaux couvrent à elles seules près de 30 % des apports journaliers recommandés (AJR) en magnésium avec un seul litre.",
  },
  {
    q: "Combien de magnésium par jour un adulte doit-il consommer ?",
    a: "L'ANSES recommande 380 mg/jour pour un homme adulte et 300 mg/jour pour une femme adulte. Un litre d'Hépar apporte à lui seul environ 40 % de ces besoins.",
  },
  {
    q: "Quels sont les bienfaits d'une eau riche en magnésium ?",
    a: "Le magnésium contribue à réduire la fatigue, au bon fonctionnement du système nerveux et musculaire, à l'équilibre électrolytique et à la synthèse protéique. Boire une eau minéralisée peut compléter les apports alimentaires en cas de stress, de sport intense ou de crampes.",
  },
  {
    q: "Peut-on boire tous les jours une eau riche en magnésium ?",
    a: "Oui, mais avec discernement. Les eaux très minéralisées type Hépar ou Contrex ne sont pas conseillées comme unique boisson : elles sont efficaces en cure ponctuelle (1 à 2 semaines) ou en alternance avec une eau faiblement minéralisée. Les personnes souffrant d'insuffisance rénale ou d'hypertension doivent consulter leur médecin.",
  },
  {
    q: "Une eau du robinet peut-elle être riche en magnésium ?",
    a: "La plupart des eaux du robinet contiennent entre 3 et 30 mg/L de magnésium — bien en dessous des eaux minérales. Consultez notre carte pour connaître la teneur exacte dans votre commune.",
  },
];

export default function GuideEauxMagnesium() {
  const sorted = [...WATERS].sort((a, b) => b.magnesium - a.magnesium);
  const canonical = "/guide/eaux-riches-magnesium";

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Les meilleures eaux riches en magnésium — Guide 2026",
      description:
        "Comparatif des eaux minérales les plus riches en magnésium (Hépar, Rozana, Contrex, Badoit...) pour lutter contre la fatigue et couvrir vos apports journaliers.",
      author: { "@type": "Organization", name: "InfoEau.fr" },
      publisher: {
        "@type": "Organization",
        name: "InfoEau.fr",
        logo: { "@type": "ImageObject", url: "https://infoeau.fr/favicon.svg" },
      },
      datePublished: "2026-07-09",
      dateModified: "2026-07-09",
      mainEntityOfPage: `https://infoeau.fr${canonical}`,
      inLanguage: "fr-FR",
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
        { "@type": "ListItem", position: 1, name: "Accueil", item: "https://infoeau.fr/" },
        { "@type": "ListItem", position: 2, name: "Guides", item: "https://infoeau.fr/guide/eaux-riches-magnesium" },
        { "@type": "ListItem", position: 3, name: "Eaux riches en magnésium", item: `https://infoeau.fr${canonical}` },
      ],
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Les meilleures eaux riches en magnésium — Comparatif 2026"
        description="Hépar, Rozana, Contrex, Badoit… Comparez les eaux les plus riches en magnésium (mg/L), leurs bienfaits contre la fatigue et comment les consommer sans risque."
        canonical={canonical}
        keywords="eau riche en magnésium, hépar magnésium, rozana, contrex, meilleure eau magnésium, eau minérale magnésium, fatigue eau"
        schemaData={schemas}
      />

      <div className="min-h-screen bg-background">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
          <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16 lg:py-20">
            <nav className="text-sm text-muted-foreground mb-6" aria-label="Fil d'ariane">
              <Link to="/" className="hover:text-foreground">Accueil</Link>
              <span className="mx-2">›</span>
              <span>Guides</span>
              <span className="mx-2">›</span>
              <span className="text-foreground">Eaux riches en magnésium</span>
            </nav>

            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-4">
              <Zap className="w-4 h-4" />
              <span>Guide santé · Minéraux</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight leading-[1.1]">
              Les meilleures{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                eaux riches en magnésium
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
              Fatigue, crampes, stress ? Le magnésium est un allié précieux. Nous avons comparé les principales eaux
              minérales françaises pour identifier celles qui en apportent le plus, avec les précautions à connaître.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-2 text-sm text-foreground shadow-sm ring-1 ring-black/5">
                <Droplets className="w-4 h-4 text-emerald-600" />
                {WATERS.length} eaux comparées
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-2 text-sm text-foreground shadow-sm ring-1 ring-black/5">
                <Heart className="w-4 h-4 text-rose-500" />
                Apports journaliers ANSES
              </div>
            </div>
          </div>
        </section>

        {/* Pourquoi le magnésium */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl prose prose-slate max-w-none">
            <h2>Pourquoi boire une eau riche en magnésium ?</h2>
            <p>
              Le magnésium est un minéral <strong>essentiel</strong> impliqué dans plus de 300 réactions
              enzymatiques : production d'énergie, contraction musculaire, transmission nerveuse, régulation
              du rythme cardiaque. Selon l'étude SU.VI.MAX, près de <strong>75 % des Français</strong>{" "}
              ont des apports inférieurs aux recommandations de l'ANSES (380 mg/jour pour un homme,
              300 mg/jour pour une femme).
            </p>
            <p>
              Les eaux minérales sont une source de magnésium <strong>hautement biodisponible</strong> :
              le corps l'assimile mieux que celui contenu dans certains aliments. Un litre d'Hépar
              couvre à lui seul près de 40 % des besoins quotidiens.
            </p>

            <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
              {[
                { icon: Zap, title: "Anti-fatigue", text: "Réduit la fatigue physique et mentale" },
                { icon: Heart, title: "Cœur & muscles", text: "Prévient crampes et palpitations" },
                { icon: CheckCircle2, title: "Stress & sommeil", text: "Favorise la détente nerveuse" },
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
              Comparatif des eaux les plus riches en magnésium
            </h2>
            <p className="text-muted-foreground mb-8">
              Classement du plus riche au moins riche. Les valeurs sont issues des étiquettes officielles des embouteilleurs (mg/L).
            </p>

            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">#</th>
                    <th className="text-left px-4 py-3 font-semibold">Eau</th>
                    <th className="text-right px-4 py-3 font-semibold text-emerald-700">Magnésium</th>
                    <th className="text-right px-4 py-3 font-semibold hidden sm:table-cell">Calcium</th>
                    <th className="text-right px-4 py-3 font-semibold hidden md:table-cell">Sodium</th>
                    <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((w, i) => (
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
                        {w.highlight && (
                          <div className="text-xs text-emerald-700 mt-1 flex items-start gap-1">
                            <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                            {w.highlight}
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
                          {w.type === "gazeuse" ? "Gazeuse" : "Plate"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="m-0">
                Une eau est considérée comme <strong>riche en magnésium</strong> dès 50 mg/L
                (règlement européen n° 1924/2006 sur les allégations nutritionnelles).
              </p>
            </div>
          </div>
        </section>

        {/* Conseils */}
        <section className="px-4 pb-12 md:pb-16">
          <div className="container mx-auto max-w-4xl prose prose-slate max-w-none">
            <h2>Comment bien choisir son eau riche en magnésium ?</h2>
            <h3>1. Regardez aussi le sodium</h3>
            <p>
              Certaines eaux très minéralisées (Saint-Yorre, Vichy Célestins) contiennent plus de 1000 mg/L
              de sodium — soit près d'un demi-gramme de sel par litre. À éviter en cas d'hypertension.
            </p>
            <h3>2. Alternez avec une eau faiblement minéralisée</h3>
            <p>
              Les eaux type <strong>Hépar</strong> ou <strong>Contrex</strong> sont efficaces en{" "}
              <strong>cure de 1 à 2 semaines</strong>, en alternance avec une eau plus légère
              (Volvic, Mont Roucous, Evian) pour un usage quotidien.
            </p>
            <h3>3. Consultez la qualité de votre eau du robinet</h3>
            <p>
              Avant d'investir dans une eau en bouteille, vérifiez la teneur en minéraux de{" "}
              <Link to="/qualite-eau">l'eau du robinet dans votre commune</Link> — elle peut déjà
              couvrir une partie de vos besoins.
            </p>

            <h2>FAQ — Eaux riches en magnésium</h2>
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
                Vous ne savez pas quelle eau choisir ?
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl">
                Notre outil de recommandation personnalisée vous conseille en fonction de vos besoins
                (fatigue, sport, grossesse, hypertension...).
              </p>
              <Link to="/quelle-eau-boire">
                <Button size="lg" variant="secondary" className="bg-white text-emerald-700 hover:bg-white/90 font-semibold">
                  Trouver mon eau idéale
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <InternalLinkHub
          heading="Aller plus loin"
          description="Ressources complémentaires pour bien choisir votre eau."
          groups={["decide", "explore"]}
          variant="muted"
        />
      </div>
    </Layout>
  );
}
