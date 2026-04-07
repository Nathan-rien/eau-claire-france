import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Zap, ClipboardList, ArrowLeft, Droplets, Sparkles, GlassWater, Baby, Heart, Dumbbell, User, Sun, ShieldAlert, Info, Target, Activity, Bone, Leaf, Search } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
import { seoData, generateFAQSchema } from '@/utils/seoData';
import { userProfiles, userIntolerances, userPreferences, UserProfile } from '@/data/waterProfiles';
import { waterRecommendationService, WaterRecommendation } from '@/services/waterRecommendationService';
import { useBottleData } from '@/hooks/useBottleData';
import { useLanguage } from '@/contexts/LanguageContext';

type DiagnosticMode = null | 'quick' | 'full';

const quickProfiles = [
  { id: 'sportif-regulier', name: 'Sportif', icon: Dumbbell },
  { id: 'grossesse', name: 'Grossesse', icon: Heart },
  { id: 'nourrisson', name: 'Nourrisson', icon: Baby },
  { id: 'menopause-seniors', name: 'Senior', icon: Sun },
  { id: 'hypertension', name: 'Hypertension', icon: Heart },
  { id: 'gout-neutre', name: 'Quotidien', icon: User },
];

const quickObjectives = [
  { id: 'sante', name: 'Santé au quotidien', icon: Heart, preferenceId: 'eau-pauvre-sodium' },
  { id: 'sport', name: 'Performance sportive', icon: Activity, preferenceId: 'eau-riche-magnesium' },
  { id: 'digestion', name: 'Digestion & transit', icon: Leaf, preferenceId: 'eau-riche-magnesium' },
  { id: 'os', name: 'Os & articulations', icon: Bone, preferenceId: 'eau-riche-calcium' },
  { id: 'pure', name: 'Eau la plus pure', icon: Search, preferenceId: 'eau-legere' },
];

const QuelleEauBoire: React.FC = () => {
  const { t } = useLanguage();
  
  const faqData = [
    { question: "Comment choisir la meilleure eau en bouteille selon mon profil ?", answer: "Notre outil d'aide au choix prend en compte votre profil (femme enceinte, sportif, etc.), vos intolérances et préférences pour recommander les eaux les plus adaptées à vos besoins spécifiques." },
    { question: "Quelle eau boire pendant la grossesse ?", answer: "Les femmes enceintes devraient privilégier des eaux faibles en nitrates (< 25 mg/L) et en sodium (< 20 mg/L), riches en calcium et magnésium pour le développement du bébé." },
    { question: "Quelle eau pour les sportifs ?", answer: "Les sportifs ont besoin d'eaux riches en minéraux pour compenser les pertes liées à la transpiration, particulièrement en magnésium, calcium et avec un taux de sodium modéré." },
    { question: "Comment éviter les eaux trop riches en sodium ?", answer: "Sélectionnez l'option 'Hypertension' ou 'Pauvre en sodium' dans nos filtres pour obtenir uniquement des eaux avec moins de 20 mg/L de sodium." }
  ];

  const [mode, setMode] = useState<DiagnosticMode>(null);
  const [selectedWaterType, setSelectedWaterType] = useState<string>('all');
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [selectedIntolerances, setSelectedIntolerances] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<WaterRecommendation[]>([]);
  
  // Quick diagnostic state
  const [quickWaterType, setQuickWaterType] = useState<string>('all');
  const [quickProfile, setQuickProfile] = useState<string | null>(null);
  const [quickObjective, setQuickObjective] = useState<string | null>(null);
  const { composition, catalog, mdd: mddData, loading, error } = useBottleData();

  const handleProfileToggle = (profileId: string) => {
    setSelectedProfiles(prev => 
      prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId]
    );
  };

  const handleIntoleranceToggle = (intoleranceId: string) => {
    setSelectedIntolerances(prev => 
      prev.includes(intoleranceId) ? prev.filter(id => id !== intoleranceId) : [...prev, intoleranceId]
    );
  };

  const handlePreferenceToggle = (preferenceId: string) => {
    setSelectedPreferences(prev => 
      prev.includes(preferenceId) ? prev.filter(id => id !== preferenceId) : [...prev, preferenceId]
    );
  };

  const filterByWaterType = useCallback((results: WaterRecommendation[], waterType: string) => {
    if (waterType === 'plate') {
      return results.filter(rec => rec.bottle.type_eau === 'Eau de source' || rec.bottle.type_eau === 'Eau minérale naturelle');
    } else if (waterType === 'gazeuse') {
      return results.filter(rec => rec.bottle.type_eau === 'Eau minérale naturelle gazeuse');
    }
    return results;
  }, []);

  const handleGetRecommendations = () => {
    if (!composition.length || !catalog.length) return;
    
    const profiles = userProfiles.filter(p => selectedProfiles.includes(p.id));
    const intolerancesData = userIntolerances.filter(i => selectedIntolerances.includes(i.id));
    const preferencesData = userPreferences.filter(p => selectedPreferences.includes(p.id));
    
    let results = waterRecommendationService.calculateRecommendations(profiles, intolerancesData, preferencesData);
    results = filterByWaterType(results, selectedWaterType);
    
    setRecommendations(results);
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickRecommendations = () => {
    if (!composition.length || !catalog.length || !quickProfile) return;
    
    const profiles = userProfiles.filter(p => p.id === quickProfile);
    const selectedObjective = quickObjectives.find(o => o.id === quickObjective);
    const preferencesData = selectedObjective 
      ? userPreferences.filter(p => p.id === selectedObjective.preferenceId)
      : [];
    let results = waterRecommendationService.calculateRecommendations(profiles, [], preferencesData);
    results = filterByWaterType(results, quickWaterType);
    
    setRecommendations(results);
    setSelectedProfiles([quickProfile]);
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSelectedWaterType('all');
    setSelectedProfiles([]);
    setSelectedIntolerances([]);
    setSelectedPreferences([]);
    setShowResults(false);
    setRecommendations([]);
    setQuickWaterType('all');
    setQuickProfile(null);
    setQuickObjective(null);
    setMode(null);
  };

  const handleBackToChoice = () => {
    setMode(null);
    setQuickWaterType('all');
    setQuickProfile(null);
    setQuickObjective(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasSelections = selectedWaterType !== 'all' || selectedProfiles.length > 0 || selectedIntolerances.length > 0 || selectedPreferences.length > 0;

  const seoProps = {
    title: seoData.quelleEauBoire.title,
    description: seoData.quelleEauBoire.description,
    keywords: seoData.quelleEauBoire.keywords,
    canonical: "/quelle-eau-boire",
    ogImage: seoData.quelleEauBoire.ogImage,
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Quelle eau boire ? - Guide personnalisé",
      "description": seoData.quelleEauBoire.description,
      "url": "https://infoeau.fr/quelle-eau-boire",
      "mainEntity": generateFAQSchema(faqData)
    }
  };

  // ─── Results view ───
  if (showResults) {
    return (
      <Layout>
        <SEOHead {...seoProps} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50">
          <div className="container mx-auto">
            <Breadcrumb items={[{ name: t('breadcrumb.waterRecommendation'), href: '/quelle-eau-boire', current: true }]} />
          </div>
          <div className="container mx-auto py-6 md:py-8 px-4 max-w-4xl">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">Vos recommandations d'eau</h1>
              <div className="flex gap-2 justify-center mb-4 flex-wrap">
                {selectedProfiles.map(profileId => {
                  const profile = userProfiles.find(p => p.id === profileId);
                  return profile ? <Badge key={profileId} className={profile.color}>{profile.name}</Badge> : null;
                })}
                {selectedIntolerances.map(intoleranceId => {
                  const intolerance = userIntolerances.find(i => i.id === intoleranceId);
                  return intolerance ? <Badge key={intoleranceId} variant="destructive">❌ {intolerance.name}</Badge> : null;
                })}
                {selectedPreferences.map(preferenceId => {
                  const preference = userPreferences.find(p => p.id === preferenceId);
                  return preference ? <Badge key={preferenceId} variant="outline">⭐ {preference.name}</Badge> : null;
                })}
              </div>
              <Button onClick={handleReset} variant="outline">Nouvelle recherche</Button>
            </div>

            <div className="space-y-4 md:space-y-6">
              {recommendations.map((recommendation, index) => (
                <Card key={`${recommendation.bottle.id}-${index}`}>
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg md:text-2xl">
                          <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-xs md:text-sm font-bold shrink-0">
                            {index + 1}
                          </span>
                          <span className="truncate">
                            {recommendation.bottle.marque === recommendation.bottle.nom_bouteille 
                              ? recommendation.bottle.marque 
                              : `${recommendation.bottle.marque} ${recommendation.bottle.nom_bouteille}`}
                          </span>
                        </CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">{recommendation.bottle.type_eau}</p>
                        {recommendation.bottle.source && (
                          <p className="text-xs md:text-sm text-muted-foreground">Source : {recommendation.bottle.source}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="default" className="mb-1">Score : {recommendation.score}/100</Badge>
                        <div className="text-sm text-muted-foreground">{recommendation.bottle.prix_moyen_litre?.toFixed(2) || 'N/A'}€/L</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    <div className="space-y-4">
                      {recommendation.warnings.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <h4 className="font-semibold text-yellow-800 text-sm">Avertissements</h4>
                          </div>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {recommendation.warnings.map((warning, i) => <li key={i}>{warning}</li>)}
                          </ul>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold mb-2 text-sm md:text-base">Pourquoi cette eau ?</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {recommendation.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-sm md:text-base">Composition (mg/L)</h4>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
                          {[
                            { label: 'Nitrates', value: recommendation.bottle.nitrates_mgL },
                            { label: 'Sodium', value: recommendation.bottle.sodium_mgL },
                            { label: 'Calcium', value: recommendation.bottle.calcium_mgL },
                            { label: 'Magnésium', value: recommendation.bottle.magnesium_mgL },
                            { label: 'Résidu sec', value: recommendation.bottle.residu_sec_mgL },
                            { label: 'Éco-score', value: recommendation.bottle.ecoscore },
                          ].map(item => (
                            <div key={item.label} className="text-center p-2 bg-muted rounded">
                              <div className="font-semibold text-sm">{item.value}</div>
                              <div className="text-xs text-muted-foreground">{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── Mode selection screen ───
  if (mode === null) {
    return (
      <Layout>
        <SEOHead {...seoProps} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50">
          <div className="container mx-auto">
            <Breadcrumb items={[{ name: t('breadcrumb.waterRecommendation'), href: '/quelle-eau-boire', current: true }]} />
          </div>
          <div className="container mx-auto py-8 md:py-12 px-4 max-w-3xl">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Quelle eau boire ?</h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Trouvez l'eau qui correspond le mieux à vos besoins
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Quick diagnostic */}
              <button
                onClick={() => { setMode('quick'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="group text-left"
              >
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 active:scale-[0.98] cursor-pointer">
                  <CardContent className="p-6 md:p-8 flex flex-col items-center text-center min-h-[180px] md:min-h-[220px] justify-center gap-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Zap className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-semibold mb-2">Diagnostic rapide</h2>
                      <p className="text-muted-foreground text-sm md:text-base">
                        3 questions, résultat en 30 secondes
                      </p>
                    </div>
                    <Badge variant="secondary" className="mt-auto">⚡ Rapide</Badge>
                  </CardContent>
                </Card>
              </button>

              {/* Full diagnostic */}
              <button
                onClick={() => { setMode('full'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="group text-left"
              >
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 active:scale-[0.98] cursor-pointer">
                  <CardContent className="p-6 md:p-8 flex flex-col items-center text-center min-h-[180px] md:min-h-[220px] justify-center gap-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-accent/50 flex items-center justify-center group-hover:bg-accent transition-colors">
                      <ClipboardList className="w-7 h-7 md:w-8 md:h-8 text-accent-foreground" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-semibold mb-2">Diagnostic complet</h2>
                      <p className="text-muted-foreground text-sm md:text-base">
                        Analyse détaillée avec profils, intolérances et préférences
                      </p>
                    </div>
                    <Badge variant="outline" className="mt-auto">📋 4 étapes</Badge>
                  </CardContent>
                </Card>
              </button>
            </div>

            {/* SEO Content Sections */}
            <div className="mt-12 md:mt-16 space-y-10 md:space-y-12 max-w-3xl mx-auto">
              {/* Section 1: Pourquoi */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Info className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold">Pourquoi choisir une eau adaptée à vos besoins ?</h2>
                </div>
                <div className="text-muted-foreground space-y-3 text-sm md:text-base leading-relaxed">
                  <p>
                    Chaque <strong>eau minérale</strong> ou <strong>eau de source</strong> possède une <strong>composition minérale unique</strong>, 
                    déterminée par les roches qu'elle traverse en sous-sol. Calcium, magnésium, sodium, nitrates, résidu sec : 
                    ces paramètres varient considérablement d'une marque à l'autre et influencent directement votre santé.
                  </p>
                  <p>
                    Vos besoins en minéraux dépendent de votre <strong>âge</strong>, de votre <strong>activité physique</strong>, 
                    de votre <strong>état de santé</strong> et de situations particulières comme la <strong>grossesse</strong> ou l'<strong>allaitement</strong>. 
                    Une eau parfaitement adaptée à un sportif ne conviendra pas forcément à un nourrisson ou à une personne souffrant d'hypertension.
                  </p>
                  <p>
                    Notre diagnostic analyse la composition de dizaines d'eaux en bouteille disponibles en France et les compare 
                    à votre profil pour vous recommander les eaux les plus adaptées à vos besoins spécifiques.
                  </p>
                </div>
              </section>

              {/* Section 2: Comment fonctionne le diagnostic */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold">Comment fonctionne notre diagnostic ?</h2>
                </div>
                <div className="text-muted-foreground space-y-3 text-sm md:text-base leading-relaxed">
                  <p>
                    Notre algorithme attribue un <strong>score sur 100</strong> à chaque eau en fonction de sa compatibilité avec votre profil. 
                    Chaque critère minéral (calcium, magnésium, sodium, nitrates, résidu sec) est évalué selon des seuils 
                    recommandés par les autorités sanitaires et pondéré selon son importance pour votre situation.
                  </p>
                  <p>
                    Par exemple, pour un profil « grossesse », la teneur en nitrates et en calcium reçoit une <strong>pondération élevée</strong>, 
                    car ces minéraux sont critiques pour le développement du fœtus. Pour un sportif, 
                    le magnésium et le sodium sont prioritaires pour compenser les pertes liées à la transpiration.
                  </p>
                  <p>
                    Les eaux sont ensuite classées du meilleur au moins bon score, avec des explications transparentes 
                    sur les raisons de chaque recommandation. Vous savez exactement <strong>pourquoi</strong> une eau vous est conseillée.
                  </p>
                </div>
              </section>

              {/* Section 3: Risques */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-destructive" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold">Les risques d'une eau non adaptée</h2>
                </div>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
                  Boire une eau inadaptée à votre profil peut avoir des conséquences sur votre santé à court et long terme. 
                  Voici les principaux risques identifiés :
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {[
                    {
                      title: 'Excès de sodium & hypertension',
                      desc: 'Une eau riche en sodium (> 200 mg/L) peut aggraver l\'hypertension artérielle et favoriser la rétention d\'eau.',
                    },
                    {
                      title: 'Nitrates & nourrissons',
                      desc: 'Les nitrates en excès (> 10 mg/L) sont dangereux pour les bébés : ils réduisent la capacité du sang à transporter l\'oxygène (méthémoglobinémie).',
                    },
                    {
                      title: 'Manque de calcium & ostéoporose',
                      desc: 'Une eau trop pauvre en calcium ne compense pas les carences, surtout chez les seniors et les femmes ménopausées, augmentant le risque de fragilité osseuse.',
                    },
                    {
                      title: 'Excès de minéralisation & calculs rénaux',
                      desc: 'Une eau très minéralisée (résidu sec > 1 500 mg/L) consommée quotidiennement peut favoriser la formation de calculs rénaux chez les personnes prédisposées.',
                    },
                    {
                      title: 'Magnésium élevé & troubles digestifs',
                      desc: 'Un excès de magnésium (> 50 mg/L) peut provoquer des diarrhées et aggraver un syndrome du côlon irritable.',
                    },
                  ].map((risk) => (
                    <div key={risk.title} className="flex gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                      <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-sm md:text-base mb-1">{risk.title}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">{risk.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── Quick diagnostic ───
  if (mode === 'quick') {
    return (
      <Layout>
        <SEOHead {...seoProps} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50">
          <div className="container mx-auto">
            <Breadcrumb items={[{ name: t('breadcrumb.waterRecommendation'), href: '/quelle-eau-boire', current: true }]} />
          </div>
          <div className="container mx-auto py-6 md:py-8 px-4 max-w-2xl">
            <button
              onClick={handleBackToChoice}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Retour au choix</span>
            </button>

            <div className="text-center mb-6 md:mb-8">
              <div className="inline-flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-primary" />
                <h1 className="text-xl md:text-2xl font-bold">Diagnostic rapide</h1>
              </div>
              <p className="text-muted-foreground text-sm md:text-base">
                Choisissez votre type d'eau, votre profil et votre objectif
              </p>
            </div>

            <div className="space-y-6 md:space-y-8">
              {/* Water type pills */}
              <div>
                <h3 className="font-semibold mb-3 text-sm md:text-base">Type d'eau</h3>
                <div className="flex gap-2 md:gap-3">
                  {[
                    { id: 'all', label: 'Toutes', icon: Droplets },
                    { id: 'plate', label: 'Plate', icon: GlassWater },
                    { id: 'gazeuse', label: 'Gazeuse', icon: Sparkles },
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => setQuickWaterType(option.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 md:py-3.5 rounded-full border text-sm md:text-base font-medium transition-all duration-150 min-h-[48px]
                        ${quickWaterType === option.id 
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                          : 'bg-card border-border hover:border-primary/40 text-foreground'
                        }`}
                    >
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile selection */}
              <div>
                <h3 className="font-semibold mb-3 text-sm md:text-base">Votre profil principal</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {quickProfiles.map(profile => {
                    const IconComp = profile.icon;
                    const isSelected = quickProfile === profile.id;
                    return (
                      <button
                        key={profile.id}
                        onClick={() => setQuickProfile(isSelected ? null : profile.id)}
                        className={`flex flex-col items-center gap-2 p-4 md:p-5 rounded-xl border text-sm font-medium transition-all duration-150 min-h-[80px]
                          ${isSelected 
                            ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                            : 'bg-card border-border hover:border-primary/40 text-foreground'
                          }`}
                      >
                        <IconComp className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        {profile.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Objective selection */}
              <div>
                <h3 className="font-semibold mb-3 text-sm md:text-base">Votre objectif principal</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {quickObjectives.map(objective => {
                    const IconComp = objective.icon;
                    const isSelected = quickObjective === objective.id;
                    return (
                      <button
                        key={objective.id}
                        onClick={() => setQuickObjective(isSelected ? null : objective.id)}
                        className={`flex flex-col items-center gap-2 p-4 md:p-5 rounded-xl border text-sm font-medium transition-all duration-150 min-h-[80px]
                          ${isSelected 
                            ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                            : 'bg-card border-border hover:border-primary/40 text-foreground'
                          }`}
                      >
                        <IconComp className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        {objective.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleQuickRecommendations}
                  disabled={!quickProfile}
                  className="w-full py-6 text-base md:text-lg font-semibold min-h-[52px]"
                  size="lg"
                >
                  Voir mes recommandations
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── Full diagnostic (existing form) ───
  return (
    <Layout>
      <SEOHead {...seoProps} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50">
        <div className="container mx-auto">
          <Breadcrumb items={[{ name: t('breadcrumb.waterRecommendation'), href: '/quelle-eau-boire', current: true }]} />
        </div>
        
        <div className="container mx-auto py-6 md:py-8 px-4 max-w-4xl">
          <button
            onClick={handleBackToChoice}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour au choix</span>
          </button>

          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <ClipboardList className="w-5 h-5 text-muted-foreground" />
              <h1 className="text-2xl md:text-3xl font-bold">Diagnostic complet</h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              Trouvez l'eau qui correspond le mieux à vos besoins et à votre profil
            </p>
          </div>

          <div className="space-y-6">
            {/* 1. Type d'eau */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-3 text-lg md:text-2xl">
                  <span className="bg-purple-500 text-white rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-xs md:text-sm font-bold">1</span>
                  Type d'eau préféré
                </CardTitle>
                <p className="text-sm text-muted-foreground">Choisissez votre préférence entre eau plate et eau gazeuse</p>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  {[
                    { id: 'all', label: 'Toutes les eaux', desc: 'Plates et gazeuses' },
                    { id: 'plate', label: 'Eau plate uniquement', desc: 'Sans bulles' },
                    { id: 'gazeuse', label: 'Eau gazeuse uniquement', desc: 'Avec bulles' },
                  ].map(opt => (
                    <div 
                      key={opt.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer min-h-[56px] transition-colors ${
                        selectedWaterType === opt.id ? 'border-purple-500 bg-purple-50' : 'border-border'
                      }`} 
                      onClick={() => setSelectedWaterType(opt.id)}
                    >
                      <Checkbox id={`water-${opt.id}`} checked={selectedWaterType === opt.id} onCheckedChange={() => setSelectedWaterType(opt.id)} />
                      <div className="flex-1">
                        <label htmlFor={`water-${opt.id}`} className="font-medium cursor-pointer text-sm md:text-base">{opt.label}</label>
                        <p className="text-xs md:text-sm text-muted-foreground">{opt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 2. Profils */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-3 text-lg md:text-2xl">
                  <span className="bg-blue-500 text-white rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-xs md:text-sm font-bold">2</span>
                  Choisissez votre profil
                </CardTitle>
                <p className="text-sm text-muted-foreground">Sélectionnez un ou plusieurs profils qui vous correspondent</p>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {userProfiles.map((profile) => (
                    <div key={profile.id} className="flex items-start space-x-3 p-3 md:p-4 rounded-lg border min-h-[56px]">
                      <Checkbox id={profile.id} checked={selectedProfiles.includes(profile.id)} onCheckedChange={() => handleProfileToggle(profile.id)} />
                      <div className="flex-1">
                        <label htmlFor={profile.id} className="font-medium cursor-pointer text-sm md:text-base">{profile.name}</label>
                        <p className="text-xs md:text-sm text-muted-foreground">{profile.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 3. Intolérances */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-3 text-lg md:text-2xl">
                  <span className="bg-red-500 text-white rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-xs md:text-sm font-bold">3</span>
                  Intolérances et restrictions
                </CardTitle>
                <p className="text-sm text-muted-foreground">Sélectionnez les substances que vous souhaitez éviter</p>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {userIntolerances.map((intolerance) => (
                    <div key={intolerance.id} className="flex items-start space-x-3 p-3 md:p-4 rounded-lg border border-red-200 bg-red-50 min-h-[56px]">
                      <Checkbox id={intolerance.id} checked={selectedIntolerances.includes(intolerance.id)} onCheckedChange={() => handleIntoleranceToggle(intolerance.id)} />
                      <div className="flex-1">
                        <label htmlFor={intolerance.id} className="font-medium cursor-pointer text-red-800 text-sm md:text-base">{intolerance.name}</label>
                        <p className="text-xs md:text-sm text-red-600">{intolerance.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 4. Préférences */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-3 text-lg md:text-2xl">
                  <span className="bg-green-500 text-white rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-xs md:text-sm font-bold">4</span>
                  Préférences personnelles
                </CardTitle>
                <p className="text-sm text-muted-foreground">Indiquez vos préférences pour le type d'eau</p>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {userPreferences.map((preference) => (
                    <div key={preference.id} className="flex items-start space-x-3 p-3 md:p-4 rounded-lg border border-blue-200 bg-blue-50 min-h-[56px]">
                      <Checkbox id={preference.id} checked={selectedPreferences.includes(preference.id)} onCheckedChange={() => handlePreferenceToggle(preference.id)} />
                      <div className="flex-1">
                        <label htmlFor={preference.id} className="font-medium cursor-pointer text-blue-800 text-sm md:text-base">{preference.name}</label>
                        <p className="text-xs md:text-sm text-blue-600">{preference.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 text-center">
            <Button onClick={handleGetRecommendations} disabled={!hasSelections} className="px-8 min-h-[48px]">
              Obtenir mes recommandations
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuelleEauBoire;
