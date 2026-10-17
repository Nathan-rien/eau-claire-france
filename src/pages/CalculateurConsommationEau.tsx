import { Link } from '@/components/LocalizedLink';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import CrisisWaterCalculator from '@/components/CrisisWaterCalculator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { NATIONAL_AVG } from '@/lib/crisisWaterModel';

const CANONICAL = '/calculateur-consommation-eau';
const PUBLISHED = '2026-10-16';
const SOURCE_URL = 'https://www.ofb.gouv.fr/sites/default/files/Fichiers/Presse/CP_SISPEA_2025_VF.pdf';

const COPY = {
  fr: {
    seoTitle: 'Calculateur de consommation d’eau du foyer (litres par jour)',
    seoDesc: 'Estimez la consommation d’eau de votre foyer : douches, chasses d’eau, lessives, vaisselle. Gestes pour la réduire et mesure avec votre compteur.',
    home: 'Accueil', crumb: 'Calculateur de consommation d’eau',
    h1: 'Calculer la consommation d’eau de son foyer',
    intro: [
      'Ce calculateur estime, en litres par personne et par jour, l’eau utilisée chez vous pour la douche, le bain, les toilettes, le linge et la vaisselle.',
      'Il sert à mieux comprendre sa facture, à se préparer à des restrictions d’eau en période de sécheresse et à repérer les gestes qui économisent le plus.',
      'Vous pouvez aussi mesurer votre consommation réelle avec deux relevés de compteur ou le volume indiqué sur votre facture. Rien n’est enregistré.',
    ],
    note: 'Estimation indicative : ne couvre ni jardin, ni voiture, ni piscine, ni fuites.',
    calcTitle: 'Estimez votre consommation',
    source: `Moyenne nationale de référence : ${NATIONAL_AVG} L par jour et par personne (53 m³ par an), selon le rapport SISPEA 2025 de l’Office français de la biodiversité (données 2023, communiqué du 7 juillet 2025).`,
    faqTitle: 'Questions fréquentes',
    faq: [
      { q: 'Comment lire mon compteur d’eau ?', a: 'Relevez les chiffres en m³ affichés par le compteur à deux dates, puis indiquez-les dans l’onglet « Mesurer avec mon compteur » avec le nombre de jours écoulés.' },
      { q: 'Pourquoi l’estimation diffère-t-elle de ma facture ?', a: 'L’estimation repose sur des valeurs moyennes par usage et ne compte ni le jardin, ni la voiture, ni la piscine, ni les fuites. La facture mesure tous les usages réels.' },
      { q: 'Quels gestes économisent le plus d’eau ?', a: 'Cela dépend de vos habitudes : la section « Gestes possibles » du calculateur classe les gestes selon le gain estimé pour votre foyer.' },
      { q: 'Mes réponses sont-elles enregistrées ?', a: 'Non. Les calculs se font dans votre navigateur et aucune saisie n’est conservée.' },
    ],
    moreTitle: 'Aller plus loin',
    links: [
      { to: '/traiter-eau-robinet', title: 'Traiter l’eau du robinet', desc: 'Calcaire, chlore, nitrates : les solutions selon votre eau.' },
      { to: '/qualite-eau', title: 'Qualité de l’eau dans ma commune', desc: 'Résultats des analyses officielles près de chez vous.' },
      { to: '/calculateur-hydratation', title: 'Combien d’eau boire par jour ?', desc: 'Un autre calculateur, pour vos besoins en eau à boire.' },
    ],
  },
  en: {
    seoTitle: 'Household water usage calculator (litres per day)',
    seoDesc: 'Estimate your household water use: showers, toilet flushes, laundry, dishes. Actions to reduce it and measurement with your water meter.',
    home: 'Home', crumb: 'Household water usage calculator',
    h1: 'Calculate your household water consumption',
    intro: [
      'This calculator estimates, in litres per person per day, the water used at home for showers, baths, toilets, laundry and dishes.',
      'It helps you understand your bill, prepare for water restrictions during droughts and identify the actions that save the most.',
      'You can also measure your actual consumption with two meter readings or the volume shown on your bill. Nothing is stored.',
    ],
    note: 'Indicative estimate: does not cover garden, car, pool or leaks.',
    calcTitle: 'Estimate your consumption',
    source: `National reference average for France: ${NATIONAL_AVG} L per person per day (53 m³ per year), according to the SISPEA 2025 report by the French Biodiversity Agency (OFB) (2023 data, press release of 7 July 2025).`,
    faqTitle: 'Frequently asked questions',
    faq: [
      { q: 'How do I read my water meter?', a: 'Note the m³ figures shown on the meter on two dates, then enter them in the “Measure with my water meter” tab along with the number of days between them.' },
      { q: 'Why does the estimate differ from my bill?', a: 'The estimate relies on average values per use and excludes garden, car, pool and leaks. Your bill measures all actual uses.' },
      { q: 'Which actions save the most water?', a: 'It depends on your habits: the “Possible actions” section of the calculator ranks actions by the estimated saving for your household.' },
      { q: 'Are my answers stored?', a: 'No. Calculations run in your browser and no input is kept.' },
    ],
    moreTitle: 'Go further',
    links: [
      { to: '/traiter-eau-robinet', title: 'Treating tap water', desc: 'Limescale, chlorine, nitrates: solutions for your water.' },
      { to: '/qualite-eau', title: 'Water quality in my town', desc: 'Official test results near you.' },
      { to: '/calculateur-hydratation', title: 'How much water should I drink?', desc: 'Another calculator, for your drinking needs.' },
    ],
  },
};

export default function CalculateurConsommationEau() {
  const { language } = useLanguage();
  const lang = language === 'en' ? 'en' : 'fr';
  const c = COPY[lang];
  const url = `https://infoeau.fr${lang === 'en' ? '/en' : ''}${CANONICAL}`;
  const home = lang === 'en' ? 'https://infoeau.fr/en' : 'https://infoeau.fr/';
  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'Article', headline: c.h1, description: c.seoDesc,
      datePublished: PUBLISHED, dateModified: PUBLISHED, inLanguage: lang === 'en' ? 'en-GB' : 'fr-FR',
      author: { '@type': 'Organization', name: 'InfoEau.fr' },
      publisher: { '@type': 'Organization', name: 'InfoEau.fr', logo: { '@type': 'ImageObject', url: 'https://infoeau.fr/favicon.svg' } },
      mainEntityOfPage: url,
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: c.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: c.home, item: home },
        { '@type': 'ListItem', position: 2, name: c.crumb, item: url },
      ],
    },
  ];

  return (
    <Layout>
      <SEOHead title={c.seoTitle} description={c.seoDesc} canonical={CANONICAL} schemaData={schemas} />
      <article className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground">{c.home}</Link>
          <span className="mx-2" aria-hidden="true">›</span>
          <span className="text-foreground">{c.crumb}</span>
        </nav>
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{c.h1}</h1>
          {c.intro.map(p => <p key={p} className="text-muted-foreground mb-3 leading-relaxed">{p}</p>)}
          <aside className="mt-4 border border-border rounded-lg bg-muted/40 p-4 flex gap-3">
            <Info className="h-5 w-5 shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm">{c.note}</p>
          </aside>
        </header>

        <section className="mb-10" aria-labelledby="calc-title">
          <h2 id="calc-title" className="text-2xl font-semibold mb-5">{c.calcTitle}</h2>
          <CrisisWaterCalculator context="generic" />
          <p className="text-sm text-muted-foreground mt-4">
            {c.source}{' '}
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline" title="SISPEA 2025 — Office français de la biodiversité">OFB</a>
          </p>
        </section>

        <section className="mb-10" aria-labelledby="faq-title">
          <h2 id="faq-title" className="text-2xl font-semibold mb-4">{c.faqTitle}</h2>
          <Accordion type="single" collapsible className="w-full">
            {c.faq.map((f, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger className="text-left font-semibold min-h-11">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="border-t border-border pt-6" aria-labelledby="more-title">
          <h2 id="more-title" className="text-2xl font-semibold mb-4">{c.moreTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {c.links.map(l => (
              <Link key={l.to} to={l.to} className="group">
                <Card className="h-full border-border transition-colors group-hover:border-primary">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">{l.title}<ArrowRight className="w-4 h-4 text-primary" aria-hidden="true" /></h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{l.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </Layout>
  );
}
