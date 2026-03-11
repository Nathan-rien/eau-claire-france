
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Droplets,
  Mountain,
  Waves,
  ArrowDown,
  Factory,
  Pipette,
  Shield,
  Gauge,
  Home,
  FlaskConical,
  Cylinder,
  Network,
  CheckCircle2,
  Layers,
  CircleDot,
  Filter,
  Zap,
  Sun,
} from 'lucide-react';

const SECTIONS = [
  { id: 'captage', label: 'Captage', icon: Droplets },
  { id: 'pompage', label: 'Pompage', icon: ArrowDown },
  { id: 'traitement', label: 'Traitement', icon: FlaskConical },
  { id: 'stockage', label: 'Stockage', icon: Cylinder },
  { id: 'distribution', label: 'Distribution', icon: Network },
  { id: 'robinet', label: 'Robinet', icon: Home },
] as const;

const sourceTypes = [
  {
    title: 'Nappes phréatiques',
    icon: Layers,
    percentage: '60%',
    depth: '10 à 100 m',
    quality: 'Naturellement filtrée',
    risk: 'Pesticides, nitrates',
    description: 'Principale source d\'eau potable en France. L\'eau s\'infiltre lentement à travers les couches de sol et de roche, se purifiant naturellement.',
    color: 'bg-blue-500/10 text-blue-700 border-blue-200',
  },
  {
    title: 'Nappes de craie',
    icon: CircleDot,
    percentage: '15%',
    depth: '50 à 300 m',
    quality: 'Très pure, riche en minéraux',
    risk: 'Pollution historique lente',
    description: 'Les aquifères de craie du Bassin parisien et du Nord fournissent une eau très minéralisée, filtrée naturellement par la roche crayeuse.',
    color: 'bg-slate-500/10 text-slate-700 border-slate-200',
  },
  {
    title: 'Sources de montagne',
    icon: Mountain,
    percentage: '10%',
    depth: 'Émergence naturelle',
    quality: 'Faible minéralisation',
    risk: 'Turbidité saisonnière',
    description: 'Eaux de fonte et de ruissellement émergeant naturellement. Captage gravitaire sans pompage, utilisé surtout dans les Alpes, Pyrénées et Massif Central.',
    color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  },
  {
    title: 'Eaux de surface',
    icon: Waves,
    percentage: '15%',
    depth: 'Rivières, lacs, barrages',
    quality: 'Variable, traitement poussé',
    risk: 'Micropolluants, turbidité',
    description: 'Rivières, fleuves et retenues. Nécessitent un traitement plus complet mais offrent des volumes importants pour les grandes agglomérations.',
    color: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
  },
];

const treatmentSteps = {
  surface: [
    { name: 'Dégrillage', desc: 'Élimination des gros débris (branches, déchets) par des grilles', icon: Filter },
    { name: 'Tamisage', desc: 'Filtration des particules moyennes par des tamis fins', icon: Filter },
    { name: 'Coagulation-Floculation', desc: 'Ajout de réactifs pour agglomérer les particules fines en "flocons"', icon: FlaskConical },
    { name: 'Décantation', desc: 'Les flocons se déposent par gravité au fond des bassins', icon: ArrowDown },
    { name: 'Filtration sur sable', desc: 'L\'eau traverse des couches de sable qui retiennent les dernières particules', icon: Layers },
    { name: 'Ozonation', desc: 'L\'ozone détruit bactéries, virus et micropolluants organiques', icon: Zap },
    { name: 'Filtration charbon actif', desc: 'Élimine pesticides, goûts et odeurs résiduels', icon: Filter },
    { name: 'Désinfection finale', desc: 'Chloration légère pour maintenir la qualité dans le réseau', icon: Shield },
  ],
  souterraine: [
    { name: 'Aération', desc: 'Oxygénation pour éliminer le fer et le manganèse dissous', icon: Sun },
    { name: 'Filtration sur sable', desc: 'Rétention des particules de fer et manganèse oxydés', icon: Layers },
    { name: 'Désinfection', desc: 'Chloration ou UV pour garantir la sécurité sanitaire', icon: Shield },
  ],
};

const ParcoursEau = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('data-section');
      if (!id) return;
      setVisibleSections(prev => {
        const next = new Set(prev);
        if (entry.isIntersecting) next.add(id);
        return next;
      });
      if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
        const idx = SECTIONS.findIndex(s => s.id === id);
        if (idx !== -1) setActiveSection(idx);
      }
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      threshold: [0.1, 0.3, 0.5],
      rootMargin: '-10% 0px -10% 0px',
    });
    sectionRefs.current.forEach(ref => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, [observerCallback]);

  const scrollToSection = (idx: number) => {
    sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const seo = seoData.parcoursEau;
  const progressValue = ((activeSection + 1) / SECTIONS.length) * 100;

  return (
    <Layout>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-blue-50 to-background py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4">Infographie interactive</Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Le parcours de l'eau en France
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            De la source naturelle à votre robinet : découvrez les 6 étapes du voyage de l'eau potable, ses traitements et les contrôles qualité.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span>5,4 milliards de m³ d'eau potable produits chaque année en France</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="flex gap-8">
          {/* Sticky progress bar - desktop */}
          <aside className="hidden lg:flex flex-col items-center sticky top-20 h-fit gap-0 self-start">
            <div className="text-xs font-medium text-muted-foreground mb-3">Progression</div>
            {SECTIONS.map((section, idx) => {
              const Icon = section.icon;
              const isActive = idx === activeSection;
              const isPast = idx < activeSection;
              return (
                <React.Fragment key={section.id}>
                  <button
                    onClick={() => scrollToSection(idx)}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2',
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-md'
                        : isPast
                        ? 'bg-primary/20 text-primary border-primary/40'
                        : 'bg-muted text-muted-foreground border-border'
                    )}
                    title={section.label}
                    aria-label={`Aller à ${section.label}`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                  {idx < SECTIONS.length - 1 && (
                    <div className={cn(
                      'w-0.5 h-12 transition-colors duration-300',
                      idx < activeSection ? 'bg-primary/40' : 'bg-border'
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </aside>

          {/* Mobile progress bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                {SECTIONS[activeSection].label}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                {activeSection + 1}/{SECTIONS.length}
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-16 pb-20 lg:pb-0">

            {/* Section 1: Captage */}
            <section
              ref={el => { sectionRefs.current[0] = el; }}
              data-section="captage"
              className={cn(
                'transition-all duration-700',
                visibleSections.has('captage') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">1. Captage des sources</h2>
                  <p className="text-muted-foreground">D'où vient l'eau potable en France ?</p>
                </div>
              </div>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">
                    La France exploite environ <strong>33 000 points de captage</strong> répartis sur tout le territoire.
                    Les eaux souterraines représentent <strong>2/3 de l'eau potable</strong> grâce à leur qualité naturelle supérieure.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="text-2xl font-bold text-foreground">33 000</div>
                      <div className="text-xs text-muted-foreground">Points de captage</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="text-2xl font-bold text-foreground">66%</div>
                      <div className="text-xs text-muted-foreground">Eaux souterraines</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="text-2xl font-bold text-foreground">34%</div>
                      <div className="text-xs text-muted-foreground">Eaux de surface</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="text-2xl font-bold text-foreground">1 000</div>
                      <div className="text-xs text-muted-foreground">Captages prioritaires</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sourceTypes.map((source) => {
                  const Icon = source.icon;
                  return (
                    <SourceCard key={source.title} source={source} Icon={Icon} />
                  );
                })}
              </div>
            </section>

            {/* Section 2: Pompage */}
            <section
              ref={el => { sectionRefs.current[1] = el; }}
              data-section="pompage"
              className={cn(
                'transition-all duration-700',
                visibleSections.has('pompage') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <ArrowDown className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">2. Pompage & Prélèvement</h2>
                  <p className="text-muted-foreground">Extraire l'eau de son milieu naturel</p>
                </div>
              </div>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 text-center">
                    <div className="p-4 rounded-lg bg-muted">
                      <div className="text-2xl font-bold text-foreground">5,4 Mds</div>
                      <div className="text-xs text-muted-foreground">m³ prélevés/an</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <div className="text-2xl font-bold text-foreground">148 L</div>
                      <div className="text-xs text-muted-foreground">consommation/jour/habitant</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <div className="text-2xl font-bold text-foreground">20%</div>
                      <div className="text-xs text-muted-foreground">pertes dans le réseau</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="forage">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Pipette className="h-4 w-4 text-indigo-500" />
                      Forages profonds (nappes)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Des pompes immergées à 50-300 m de profondeur remontent l'eau des aquifères.
                      Le débit varie de 10 à 500 m³/h selon la nappe. Les forages sont protégés par
                      des périmètres de protection (immédiat, rapproché, éloigné) définis par arrêté préfectoral.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="gravitaire">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Mountain className="h-4 w-4 text-emerald-500" />
                      Captage gravitaire (sources)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      L'eau émerge naturellement en surface et est captée sans pompage.
                      Système économe en énergie utilisé principalement en zones montagneuses.
                      Le débit dépend des précipitations et peut varier fortement selon les saisons.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="riviere">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Waves className="h-4 w-4 text-cyan-500" />
                      Prises d'eau en rivière
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">
                      Des stations de pompage prélèvent l'eau directement dans les cours d'eau ou retenues.
                      Utilisées par les grandes agglomérations (Paris, Lyon, Bordeaux).
                      L'eau nécessite un traitement complet avant distribution.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Section 3: Traitement */}
            <section
              ref={el => { sectionRefs.current[2] = el; }}
              data-section="traitement"
              className={cn(
                'transition-all duration-700',
                visibleSections.has('traitement') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <FlaskConical className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">3. Traitement</h2>
                  <p className="text-muted-foreground">Rendre l'eau conforme aux normes sanitaires</p>
                </div>
              </div>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-2">
                    Le traitement dépend de l'origine de l'eau. Une eau souterraine de bonne qualité
                    ne nécessite qu'une simple désinfection, tandis qu'une eau de surface requiert
                    une filière complète de potabilisation.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground"><strong>63 paramètres</strong> contrôlés selon le Code de la santé publique</span>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="surface" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="surface">Eau de surface (complète)</TabsTrigger>
                  <TabsTrigger value="souterraine">Eau souterraine (légère)</TabsTrigger>
                </TabsList>
                <TabsContent value="surface">
                  <div className="space-y-3">
                    {treatmentSteps.surface.map((step, i) => {
                      const StepIcon = step.icon;
                      return (
                        <div key={step.name} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 text-sm font-bold shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              <StepIcon className="h-4 w-4" />
                              {step.name}
                            </div>
                            <p className="text-sm text-muted-foreground">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
                <TabsContent value="souterraine">
                  <div className="space-y-3">
                    {treatmentSteps.souterraine.map((step, i) => {
                      const StepIcon = step.icon;
                      return (
                        <div key={step.name} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-bold shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              <StepIcon className="h-4 w-4" />
                              {step.name}
                            </div>
                            <p className="text-sm text-muted-foreground">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Card className="mt-4 border-emerald-200 bg-emerald-50/50">
                    <CardContent className="pt-4">
                      <p className="text-sm text-emerald-800">
                        💡 Les eaux souterraines profondes de bonne qualité peuvent parfois être distribuées
                        avec une simple chloration, sans traitement complexe.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>

            {/* Section 4: Stockage */}
            <section
              ref={el => { sectionRefs.current[3] = el; }}
              data-section="stockage"
              className={cn(
                'transition-all duration-700',
                visibleSections.has('stockage') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Cylinder className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">4. Stockage</h2>
                  <p className="text-muted-foreground">Assurer la disponibilité et la pression</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      🏗️ Châteaux d'eau
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Plus de <strong>15 000</strong> en France. Situés en hauteur, ils assurent la pression
                      par gravité. Capacité : 200 à 5 000 m³.
                    </p>
                    <Badge variant="outline">Pression gravitaire</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      🏔️ Réservoirs enterrés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Semi-enterrés ou souterrains, ils stockent l'eau à l'abri de la chaleur et de la lumière.
                      Utilisés en zones urbaines et collinaires.
                    </p>
                    <Badge variant="outline">Protection thermique</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      🔄 Bâches de reprise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Bassins intermédiaires entre les étapes de traitement ou de pompage. Permettent
                      de réguler le débit et d'absorber les variations de consommation.
                    </p>
                    <Badge variant="outline">Régulation débit</Badge>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 border-amber-200 bg-amber-50/50">
                <CardContent className="pt-4 flex items-start gap-3">
                  <Gauge className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800">
                    Le temps de séjour dans les réservoirs est surveillé pour maintenir le taux de chlore
                    résiduel. L'eau ne doit pas stagner plus de <strong>48 heures</strong> en moyenne.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Section 5: Distribution */}
            <section
              ref={el => { sectionRefs.current[4] = el; }}
              data-section="distribution"
              className={cn(
                'transition-all duration-700',
                visibleSections.has('distribution') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Network className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">5. Distribution</h2>
                  <p className="text-muted-foreground">Le plus grand réseau souterrain de France</p>
                </div>
              </div>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-6">
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="text-2xl font-bold text-foreground">906 000</div>
                      <div className="text-xs text-muted-foreground">km de canalisations</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="text-2xl font-bold text-foreground">13 500</div>
                      <div className="text-xs text-muted-foreground">services d'eau</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="text-2xl font-bold text-foreground">3-5</div>
                      <div className="text-xs text-muted-foreground">bars de pression</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="text-2xl font-bold text-foreground">320 000</div>
                      <div className="text-xs text-muted-foreground">analyses/an (ARS)</div>
                    </div>
                  </div>

                  <p className="text-muted-foreground">
                    Le réseau français est géré par <strong>13 500 services d'eau</strong> (régies ou délégataires).
                    Chaque jour, des capteurs mesurent la pression, le débit, le chlore et la turbidité
                    en temps réel pour détecter les fuites ou contaminations.
                  </p>
                </CardContent>
              </Card>

              <Accordion type="single" collapsible>
                <AccordionItem value="controles">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Contrôles qualité dans le réseau
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• <strong>Chlore résiduel</strong> : maintenu entre 0,1 et 0,3 mg/L pour empêcher toute recontamination</p>
                      <p>• <strong>Turbidité</strong> : mesurée en continu, seuil max 1 NTU au robinet</p>
                      <p>• <strong>Pression</strong> : régulée par surpresseurs et réducteurs pour garantir 3-5 bars</p>
                      <p>• <strong>Prélèvements ARS</strong> : plus de 320 000 analyses par an sur l'ensemble du territoire</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="pertes">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-red-400" />
                      Pertes et fuites du réseau
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      En moyenne <strong>20% de l'eau</strong> est perdue par des fuites dans les canalisations.
                      Certaines communes rurales dépassent 50% de pertes. Le plan Eau France 2023
                      impose un rendement minimum de 85% pour les réseaux urbains et investit
                      dans la rénovation des conduites vieillissantes.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Section 6: Robinet */}
            <section
              ref={el => { sectionRefs.current[5] = el; }}
              data-section="robinet"
              className={cn(
                'transition-all duration-700',
                visibleSections.has('robinet') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Home className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">6. Arrivée au robinet</h2>
                  <p className="text-muted-foreground">L'eau potable chez vous</p>
                </div>
              </div>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-lg border bg-card text-center">
                      <Factory className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <div className="font-medium text-foreground">Compteur d'eau</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Point de livraison et de mesure de votre consommation
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card text-center">
                      <Network className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <div className="font-medium text-foreground">Réseau intérieur</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Canalisations privées sous la responsabilité du propriétaire
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card text-center">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <div className="font-medium text-foreground">Contrôle ARS</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Résultats consultables en mairie et sur InfoEau.fr
                      </p>
                    </div>
                  </div>

                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="pt-4">
                      <p className="text-sm text-green-800">
                        ✅ <strong>L'eau du robinet est l'aliment le plus contrôlé en France</strong> avec plus de
                        63 critères de qualité vérifiés régulièrement par les Agences Régionales de Santé (ARS).
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Que vérifier chez vous ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Laissez couler l'eau quelques secondes si le robinet n'a pas été utilisé depuis plusieurs heures</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Vérifiez l'âge de vos canalisations intérieures (plomb interdit depuis 1995)</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Consultez le dernier rapport ARS de votre commune sur InfoEau.fr</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>N'utilisez jamais l'eau chaude sanitaire pour la cuisine (risque de métaux dissous)</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

          </div>
        </div>
      </div>
    </Layout>
  );
};

/* Sub-component for source type cards */
const SourceCard = ({ source, Icon }: { source: typeof sourceTypes[number]; Icon: React.ElementType }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card
      className={cn('cursor-pointer transition-all hover:shadow-md border', source.color.split(' ')[2])}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={cn('h-5 w-5', source.color.split(' ')[1])} />
            <span className="font-semibold text-foreground">{source.title}</span>
          </div>
          <Badge variant="secondary" className="text-xs">{source.percentage}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{source.description}</p>
        {expanded && (
          <div className="mt-3 pt-3 border-t space-y-1 text-sm animate-fade-in">
            <p><span className="font-medium text-foreground">Profondeur :</span> <span className="text-muted-foreground">{source.depth}</span></p>
            <p><span className="font-medium text-foreground">Qualité naturelle :</span> <span className="text-muted-foreground">{source.quality}</span></p>
            <p><span className="font-medium text-foreground">Risques :</span> <span className="text-muted-foreground">{source.risk}</span></p>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">{expanded ? '▲ Réduire' : '▼ Cliquer pour les détails'}</p>
      </CardContent>
    </Card>
  );
};

export default ParcoursEau;
