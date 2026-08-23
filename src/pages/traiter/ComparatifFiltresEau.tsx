import { Link } from '@/components/LocalizedLink';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowRight, Droplets, Info, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AffiliateComparisonTable from '@/components/affiliate/AffiliateComparisonTable';

const CANONICAL = '/comparatif-filtres-eau';
const TODAY = new Date().toISOString().slice(0, 10);

const CONTENT = {
  fr: {
    seoTitle: 'Comparatif filtres à eau 2026 : carafe, filtre robinet ou osmoseur ?',
    seoDesc:
      "Comparatif des solutions de filtration de l'eau du robinet : prix, coût annuel, contaminants réellement traités et limites de chaque système.",
    tag: 'Comparatif',
    breadcrumbGuides: 'Traiter son eau',
    breadcrumbCurrent: 'Comparatif filtres à eau',
    h1: "Comparatif des filtres à eau : quelle solution pour quel besoin ?",
    p1: "Il n'existe pas un meilleur filtre à eau, mais un produit adapté à un problème et à un budget. Une carafe filtrante et un osmoseur ne traitent ni les mêmes contaminants, ni au même coût.",
    p2: "Ce comparatif liste, pour chaque solution, le prix d'achat, le coût annuel des consommables, ce qui est réellement traité et ce qui ne l'est pas. Les allégations sans preuve sont signalées comme telles.",
    p3: "Première étape recommandée : vérifier la qualité de l'eau distribuée dans votre commune. Sans ce diagnostic, un achat de filtration reste une dépense à l'aveugle.",
    ctaDiag: 'Diagnostiquer mon eau',
    ctaQuality: "Qualité de l'eau de ma commune",
    note: "InfoEau ne vend aucun produit et ne réalise pas de tests en laboratoire. Les efficacités indiquées reprennent les données constructeurs et les tests publiés (60 Millions de Consommateurs, certifications ACS).",
    tableTitle: 'Comparatif complet : filtration et amélioration du goût',
    tableIntro:
      "Filtrez par catégorie et triez par prix. Les colonnes « Traite » et « Ne traite pas » sont le critère de choix principal, avant le prix.",
    chooseTitle: 'Comment choisir selon votre problème',
    chooseIntro:
      'Grille de décision simplifiée. Un seul problème identifié suffit à orienter le choix.',
    rows: [
      {
        problem: 'Goût ou odeur de chlore',
        answer:
          'Carafe filtrante, bâton de charbon actif ou simple carafe laissée 30 minutes au réfrigérateur. Aucun besoin d’un système coûteux.',
        to: '/guide/gout-chlore',
        link: 'Guide goût de chlore',
      },
      {
        problem: 'Eau calcaire',
        answer:
          'Carafe filtrante pour la boisson et le thé. Le calcaire n’est pas un risque sanitaire : la filtration relève du confort, pas de la santé.',
        to: '/guide/eau-calcaire',
        link: 'Guide eau calcaire',
      },
      {
        problem: 'Nitrates',
        answer:
          "Seule l'osmose inverse réduit significativement les nitrates. Les carafes filtrantes n'ont pas d'effet notable.",
        to: '/guide/nitrates-eau',
        link: 'Guide nitrates',
      },
      {
        problem: 'Plomb (canalisations anciennes)',
        answer:
          "Filtre sur robinet certifié pour le plomb, ou remplacement des canalisations intérieures. Laisser couler l'eau après stagnation reste un geste utile.",
        to: '/guide/plomb-eau',
        link: 'Guide plomb',
      },
      {
        problem: 'PFAS, pesticides, résidus médicamenteux',
        answer:
          'Filtre robinet à charbon actif performant ou osmose inverse. Vérifier les certifications plutôt que les allégations marketing.',
        to: '/traiter-eau-robinet',
        link: "Traiter l'eau du robinet",
      },
    ],
    faqTitle: 'Questions fréquentes',
    faq: [
      {
        q: 'Quelle différence entre carafe filtrante, filtre robinet et osmoseur ?',
        a: "La carafe filtre par gravité un petit volume : elle agit surtout sur le chlore, le goût et une partie du calcaire. Le filtre robinet traite l'eau en continu et, selon les modèles certifiés, retient plomb, pesticides et PFAS. L'osmoseur pousse l'eau à travers une membrane sous pression : c'est la solution la plus complète, y compris sur les nitrates, mais aussi la plus chère et la plus contraignante en entretien.",
      },
      {
        q: 'Une carafe filtrante enlève-t-elle les nitrates ?',
        a: "Non, pas de manière significative. Les cartouches à charbon actif et résine échangeuse d'ions des carafes grand public ne sont pas conçues pour retenir les nitrates. Si votre eau dépasse régulièrement 50 mg/L, seule l'osmose inverse apporte une réduction réelle.",
      },
      {
        q: 'Faut-il craindre la déminéralisation avec un osmoseur ?',
        a: "L'osmose inverse retire une grande partie des minéraux dissous. 60 Millions de Consommateurs déconseille une consommation exclusive d'eau osmosée sans reminéralisation. Une alimentation équilibrée couvre l'essentiel des apports, mais l'eau y contribue, notamment en calcium et magnésium.",
      },
      {
        q: 'Les perles de céramique améliorent-elles vraiment l’eau ?',
        a: "Aucune preuve scientifique ne documente leur efficacité et elles n'apparaissent dans aucun référentiel normatif de traitement de l'eau. Elles ne remplacent aucune protection sanitaire. Un bâton de charbon actif a, lui, un effet mesuré sur le chlore.",
      },
      {
        q: 'Le coût annuel des cartouches change-t-il le classement ?',
        a: "Oui, souvent plus que le prix d'achat. Une carafe à 12€ avec 35€/an de cartouches coûte plus cher sur trois ans qu'un filtre robinet à 35€ dont la recharge tient six mois. Comparez toujours le coût sur trois ans.",
      },
    ],
    linksTitle: 'À lire aussi',
    links: [
      { to: '/traiter-eau-robinet', title: "Traiter l'eau du robinet", desc: "Page pilier : tous les moyens d'améliorer l'eau du robinet." },
      { to: '/comparatif-carafes', title: 'Comparatif des carafes filtrantes', desc: 'Focus sur les carafes : modèles, cartouches et coûts.' },
      { to: '/guide/quel-filtre-eau', title: 'Quel filtre à eau choisir ?', desc: 'Méthode de décision détaillée selon les contaminants.' },
      { to: '/bouteille-ou-filtration', title: 'Bouteille ou filtration ?', desc: 'Comparaison des coûts et de l’empreinte des deux options.' },
      { to: '/diagnostic', title: 'Diagnostic de mon eau', desc: 'Analyse de la qualité de l’eau distribuée dans votre commune.' },
      { to: '/classement', title: 'Classement des eaux en bouteille', desc: 'Si vous préférez comparer les eaux embouteillées.' },
    ],
  },
  en: {
    seoTitle: 'Water filter comparison 2026: pitcher, tap filter or reverse osmosis?',
    seoDesc:
      'Comparison of tap water filtration solutions: price, annual cost, contaminants actually removed and the limits of each system.',
    tag: 'Comparison',
    breadcrumbGuides: 'Treating your water',
    breadcrumbCurrent: 'Water filter comparison',
    h1: 'Water filter comparison: which solution for which need?',
    p1: 'There is no single best water filter, only a product matched to a problem and a budget. A filter pitcher and a reverse osmosis system remove different contaminants at very different costs.',
    p2: 'This comparison lists, for each solution, the purchase price, the annual cost of consumables, what is actually treated and what is not. Unproven claims are flagged as such.',
    p3: 'Recommended first step: check the quality of the water supplied in your municipality. Without that diagnosis, buying a filter is spending blind.',
    ctaDiag: 'Check my water',
    ctaQuality: 'Water quality in my town',
    note: 'InfoEau sells no products and runs no laboratory tests. The stated performance comes from manufacturer data and published tests (60 Millions de Consommateurs, French ACS certification).',
    tableTitle: 'Full comparison: filtration and taste improvement',
    tableIntro:
      'Filter by category and sort by price. The "Treats" and "Does not treat" columns matter more than price.',
    chooseTitle: 'How to choose based on your problem',
    chooseIntro: 'A simplified decision grid. One identified problem is enough to guide the choice.',
    rows: [
      {
        problem: 'Chlorine taste or smell',
        answer:
          'Filter pitcher, activated charcoal stick, or simply leaving water 30 minutes in the fridge. No expensive system needed.',
        to: '/guide/gout-chlore',
        link: 'Chlorine taste guide',
      },
      {
        problem: 'Hard water',
        answer:
          'Filter pitcher for drinking water and tea. Hardness is not a health risk: filtering is comfort, not safety.',
        to: '/guide/eau-calcaire',
        link: 'Hard water guide',
      },
      {
        problem: 'Nitrates',
        answer:
          'Only reverse osmosis significantly reduces nitrates. Filter pitchers have no meaningful effect.',
        to: '/guide/nitrates-eau',
        link: 'Nitrates guide',
      },
      {
        problem: 'Lead (old plumbing)',
        answer:
          'Tap filter certified for lead, or replacing indoor pipes. Running the tap after stagnation remains useful.',
        to: '/guide/plomb-eau',
        link: 'Lead guide',
      },
      {
        problem: 'PFAS, pesticides, drug residues',
        answer:
          'High-performance activated carbon tap filter or reverse osmosis. Check certifications rather than marketing claims.',
        to: '/traiter-eau-robinet',
        link: 'Treating tap water',
      },
    ],
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'What is the difference between a filter pitcher, a tap filter and reverse osmosis?',
        a: 'A pitcher filters a small volume by gravity: it mainly acts on chlorine, taste and part of the hardness. A tap filter treats water continuously and, on certified models, retains lead, pesticides and PFAS. Reverse osmosis pushes water through a membrane under pressure: the most complete option, including for nitrates, but also the most expensive and the most demanding in maintenance.',
      },
      {
        q: 'Does a filter pitcher remove nitrates?',
        a: 'Not significantly. The activated carbon and ion-exchange cartridges used in consumer pitchers are not designed to retain nitrates. If your water regularly exceeds 50 mg/L, only reverse osmosis delivers a real reduction.',
      },
      {
        q: 'Is demineralisation a concern with reverse osmosis?',
        a: 'Reverse osmosis removes most dissolved minerals. 60 Millions de Consommateurs advises against drinking osmosed water exclusively without remineralisation. A balanced diet covers most intake, but water contributes, notably calcium and magnesium.',
      },
      {
        q: 'Do ceramic beads really improve water?',
        a: 'No scientific evidence documents their effectiveness and they appear in no water treatment standard. They replace no health protection. An activated charcoal stick, by contrast, has a measured effect on chlorine.',
      },
      {
        q: 'Does the annual cartridge cost change the ranking?',
        a: 'Often more than the purchase price does. A €12 pitcher with €35/year of cartridges costs more over three years than a €35 tap filter whose refill lasts six months. Always compare the three-year cost.',
      },
    ],
    linksTitle: 'Read also',
    links: [
      { to: '/traiter-eau-robinet', title: 'Treating tap water', desc: 'Pillar page: every way to improve tap water.' },
      { to: '/comparatif-carafes', title: 'Filter pitcher comparison', desc: 'Focus on pitchers: models, cartridges and costs.' },
      { to: '/guide/quel-filtre-eau', title: 'Which water filter to choose?', desc: 'Detailed decision method by contaminant.' },
      { to: '/bouteille-ou-filtration', title: 'Bottled water or filtration?', desc: 'Cost and footprint comparison of both options.' },
      { to: '/diagnostic', title: 'Check my water', desc: 'Quality analysis of the water supplied in your town.' },
      { to: '/classement', title: 'Bottled water ranking', desc: 'If you would rather compare bottled waters.' },
    ],
  },
};

export default function ComparatifFiltresEau() {
  const { t, language } = useLanguage();
  const C = language === 'en' ? CONTENT.en : CONTENT.fr;

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: C.h1,
      description: C.seoDesc,
      author: { '@type': 'Organization', name: 'InfoEau.fr' },
      publisher: {
        '@type': 'Organization',
        name: 'InfoEau.fr',
        logo: { '@type': 'ImageObject', url: 'https://infoeau.fr/favicon.svg' },
      },
      datePublished: TODAY,
      dateModified: TODAY,
      mainEntityOfPage: `https://infoeau.fr${CANONICAL}`,
      inLanguage: language === 'en' ? 'en-US' : 'fr-FR',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: C.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t('common.breadcrumb.home'), item: 'https://infoeau.fr/' },
        { '@type': 'ListItem', position: 2, name: C.breadcrumbGuides, item: 'https://infoeau.fr/traiter-eau-robinet' },
        { '@type': 'ListItem', position: 3, name: C.breadcrumbCurrent, item: `https://infoeau.fr${CANONICAL}` },
      ],
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={C.seoTitle}
        description={C.seoDesc}
        canonical={CANONICAL}
        keywords="comparatif filtres à eau, carafe filtrante, filtre robinet, osmoseur, filtration eau robinet, coût cartouches"
        schemaData={schemas}
      />

      <div className="min-h-screen bg-background">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-blue-50 via-sky-50 to-emerald-50">
          <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16 lg:py-20">
            <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-foreground">
                {t('common.breadcrumb.home')}
              </Link>
              <span className="mx-2">›</span>
              <Link to="/traiter-eau-robinet" className="hover:text-foreground">
                {C.breadcrumbGuides}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-foreground">{C.breadcrumbCurrent}</span>
            </nav>

            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              <Droplets className="w-4 h-4" />
              <span>{C.tag}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
              {C.h1}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {C.p1}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {C.p2}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {C.p3}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/diagnostic">
                  {C.ctaDiag}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/qualite-eau">{C.ctaQuality}</Link>
              </Button>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-xl bg-white/70 backdrop-blur px-4 py-3 text-sm text-muted-foreground ring-1 ring-black/5 max-w-3xl">
              <Info className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
              <p className="m-0">{C.note}</p>
            </div>
          </div>
        </section>

        {/* TABLEAU COMPARATIF */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-6xl">
            <AffiliateComparisonTable title={C.tableTitle} intro={C.tableIntro} />
          </div>
        </section>

        {/* COMMENT CHOISIR */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              {C.chooseTitle}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{C.chooseIntro}</p>

            <div className="space-y-5">
              {C.rows.map((r) => (
                <Card key={r.problem} className="border-border">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{r.problem}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">{r.answer}</p>
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

        {/* FAQ */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-blue-600" />
              {C.faqTitle}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {C.faq.map((f, i) => (
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
              {C.linksTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {C.links.map((l) => (
                <Card key={l.to} className="border-border">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{l.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{l.desc}</p>
                    <Link
                      to={l.to}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
                    >
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
