import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import InternalLinkHub from '@/components/InternalLinkHub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Search,
  MapPin,
  Droplets,
  ShieldCheck,
  AlertTriangle,
  FlaskConical,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { allCommunes, communeToSlug } from '@/utils/communeSlug';

const KEY_QUESTIONS = [
  {
    id: 'potable',
    icon: ShieldCheck,
    q: "L'eau du robinet est-elle potable dans ma commune ?",
    a: "Oui, dans la quasi-totalité des communes françaises. L'ARS effectue plusieurs prélèvements par an et publie les résultats sur Hub'Eau. La page de votre commune affiche le taux de conformité, le score global et l'écart aux limites réglementaires du Code de la santé publique.",
  },
  {
    id: 'polluants',
    icon: AlertTriangle,
    q: 'Quels polluants sont surveillés (PFAS, nitrates, pesticides, plomb) ?',
    a: "Les analyses officielles couvrent nitrates, pesticides (dont métabolites), PFAS (depuis 2023), métaux lourds (plomb, cuivre, nickel), chlore résiduel, THM et paramètres microbiologiques (E. coli, entérocoques). Chaque paramètre est comparé à sa limite réglementaire — la fiche commune affiche les dépassements éventuels.",
  },
  {
    id: 'durete',
    icon: FlaskConical,
    q: "Quelle est la dureté (calcaire) de l'eau chez moi ?",
    a: "La dureté est exprimée en °f (degré français) : <15 °f eau douce, 15-30 °f moyennement dure, >30 °f dure. Elle dépend de la source (nappe calcaire ou eau de surface). La fiche de votre commune affiche la dernière valeur mesurée et son classement.",
  },
  {
    id: 'gout-odeur',
    icon: Droplets,
    q: "Pourquoi mon eau a un goût ou une odeur de chlore ?",
    a: "Le chlore résiduel (0,1 à 0,3 mg/L en sortie de traitement) est obligatoire pour garantir l'absence de bactéries dans le réseau. L'odeur disparaît en laissant l'eau reposer 30 min au réfrigérateur. Consultez aussi la page /gout-eau pour les retours par région.",
  },
  {
    id: 'filtrer',
    icon: Filter,
    q: 'Faut-il filtrer son eau ou passer à la bouteille ?',
    a: "Pour la plupart des communes conformes, ni l'un ni l'autre n'est nécessaire. Un filtre à charbon peut améliorer le goût si le chlore vous dérange. En cas de plomb (canalisation ancienne), laissez couler l'eau 30 s avant usage alimentaire. Un adoucisseur ne se justifie qu'au-delà de 30 °f.",
  },
];

const GuideMaCommune: React.FC = () => {
  const [query, setQuery] = useState('');
  const communes = useMemo(() => allCommunes(), []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return communes.slice(0, 24);
    return communes
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.postcode.startsWith(q),
      )
      .slice(0, 24);
  }, [communes, query]);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: KEY_QUESTIONS.map((k) => ({
      '@type': 'Question',
      name: k.q,
      acceptedAnswer: { '@type': 'Answer', text: k.a },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://infoeau.fr/' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://infoeau.fr/guide/ma-commune' },
      { '@type': 'ListItem', position: 3, name: 'Ma commune', item: 'https://infoeau.fr/guide/ma-commune' },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Guide « Ma commune » — Qualité de l'eau du robinet, questions clés"
        description="Le guide complet pour comprendre l'eau du robinet dans votre commune : potabilité, polluants (PFAS, nitrates, plomb), dureté, goût, filtration. Données officielles Hub'Eau / ARS."
        keywords="qualité eau ma commune, eau du robinet commune, guide eau potable, PFAS commune, dureté eau commune, analyse eau ARS"
        canonical="/guide/ma-commune"
        schemaData={[faqSchema, breadcrumbSchema]}
      />

      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-sky-50 via-white to-green-50 py-12 md:py-16 px-4 border-b border-border">
          <div className="container mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              Guide pratique
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Ma commune : tout savoir sur l'eau du robinet
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Les 5 questions clés que se posent les Français sur l'eau du
              robinet — et les réponses avec les données officielles Hub'Eau /
              ARS pour votre commune.
            </p>

            {/* Commune search */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm max-w-xl mx-auto">
              <label
                htmlFor="commune-search"
                className="text-sm font-semibold text-foreground block mb-2 text-left"
              >
                Rechercher ma commune
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="commune-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nom de ville ou code postal…"
                  className="pl-9"
                />
              </div>
              {filtered.length > 0 && (
                <ul className="mt-3 max-h-64 overflow-y-auto text-left divide-y divide-border">
                  {filtered.map((c) => (
                    <li key={c.citycode}>
                      <Link
                        to={`/qualite-eau/${communeToSlug(c)}`}
                        className="flex items-center justify-between py-2 px-2 rounded hover:bg-muted transition-colors"
                      >
                        <span className="inline-flex items-center gap-2 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          {c.name}
                          <span className="text-xs text-muted-foreground">
                            ({c.postcode})
                          </span>
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {query && filtered.length === 0 && (
                <p className="text-sm text-muted-foreground mt-3">
                  Aucune commune ne correspond. Consultez la{' '}
                  <Link to="/qualite-eau" className="text-primary underline">
                    liste complète
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Key questions */}
        <section className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Les 5 questions clés
          </h2>

          <div className="grid gap-4">
            {KEY_QUESTIONS.map((k, i) => {
              const Icon = k.icon;
              return (
                <Card key={k.id} className="border-border">
                  <CardHeader className="flex-row items-start gap-4 space-y-0 pb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                        Question {i + 1}
                      </div>
                      <CardTitle className="text-lg leading-snug">
                        {k.q}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-[4.5rem]">
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {k.a}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How to read your commune page */}
        <section className="bg-muted/40 py-12 md:py-16 px-4 border-y border-border">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Comment lire la fiche de ma commune
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="score">
                <AccordionTrigger>Le score global (0-100)</AccordionTrigger>
                <AccordionContent>
                  Calculé sur les 24 derniers mois de prélèvements : conformité,
                  écart aux limites, diversité des polluants détectés. Un score
                  ≥ 80 correspond à une eau d'excellente qualité, 60-80 bonne,
                  40-60 correcte avec vigilance, &lt; 40 alerte.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="conformite">
                <AccordionTrigger>
                  La conformité (limite vs référence)
                </AccordionTrigger>
                <AccordionContent>
                  Deux seuils existent : <strong>limite de qualité</strong>{' '}
                  (contraignante, risque sanitaire) et{' '}
                  <strong>référence de qualité</strong> (indicative, confort). Un
                  dépassement de référence n'est pas dangereux mais signale un
                  suivi renforcé.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="preleve">
                <AccordionTrigger>La date de prélèvement</AccordionTrigger>
                <AccordionContent>
                  Nous affichons la date réelle du prélèvement terrain
                  (« Prélevé le »), pas la date de publication. L'ARS met en
                  ligne les résultats 4 à 8 semaines après l'analyse laboratoire.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="parametres">
                <AccordionTrigger>Les paramètres surveillés</AccordionTrigger>
                <AccordionContent>
                  Plus de 60 paramètres au total selon la commune : nitrates,
                  pesticides, PFAS, plomb, cuivre, THM, chlore, pH, turbidité,
                  microbiologie. La fiche affiche ceux effectivement mesurés lors
                  du dernier passage.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto max-w-4xl px-4 py-12 md:py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Prêt·e à consulter les données de votre commune ?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Accédez à la liste complète des communes couvertes ou explorez la
            carte interactive.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/qualite-eau">Voir toutes les communes</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/carte">Ouvrir la carte de France</Link>
            </Button>
          </div>
        </section>

        <InternalLinkHub
          heading="Aller plus loin"
          description="Cartes, polluants et guides complémentaires."
        />
      </main>
      <Footer />
    </div>
  );
};

export default GuideMaCommune;
