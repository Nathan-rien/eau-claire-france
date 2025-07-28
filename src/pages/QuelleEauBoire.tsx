import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import Breadcrumb from '@/components/Breadcrumb';
import { seoData, generateFAQSchema } from '@/utils/seoData';
import { userProfiles, userIntolerances, userPreferences, UserProfile, UserIntolerance, UserPreference } from '@/data/waterProfiles';
import { waterRecommendationService, WaterRecommendation } from '@/services/waterRecommendationService';
import { useLanguage } from '@/contexts/LanguageContext';

const QuelleEauBoire: React.FC = () => {
  const { t } = useLanguage();
  
  // FAQ data for schema
  const faqData = [
    {
      question: "Comment choisir la meilleure eau en bouteille selon mon profil ?",
      answer: "Notre outil d'aide au choix prend en compte votre profil (femme enceinte, sportif, etc.), vos intolérances et préférences pour recommander les eaux les plus adaptées à vos besoins spécifiques."
    },
    {
      question: "Quelle eau boire pendant la grossesse ?",
      answer: "Les femmes enceintes devraient privilégier des eaux faibles en nitrates (< 25 mg/L) et en sodium (< 20 mg/L), riches en calcium et magnésium pour le développement du bébé."
    },
    {
      question: "Quelle eau pour les sportifs ?",
      answer: "Les sportifs ont besoin d'eaux riches en minéraux pour compenser les pertes liées à la transpiration, particulièrement en magnésium, calcium et avec un taux de sodium modéré."
    },
    {
      question: "Comment éviter les eaux trop riches en sodium ?",
      answer: "Sélectionnez l'option 'Hypertension' ou 'Pauvre en sodium' dans nos filtres pour obtenir uniquement des eaux avec moins de 20 mg/L de sodium."
    }
  ];
  const [selectedWaterType, setSelectedWaterType] = useState<string>('all');
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [selectedIntolerances, setSelectedIntolerances] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<WaterRecommendation[]>([]);

  const handleProfileToggle = (profileId: string) => {
    setSelectedProfiles(prev => 
      prev.includes(profileId) 
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const handleIntoleranceToggle = (intoleranceId: string) => {
    setSelectedIntolerances(prev => 
      prev.includes(intoleranceId) 
        ? prev.filter(id => id !== intoleranceId)
        : [...prev, intoleranceId]
    );
  };

  const handlePreferenceToggle = (preferenceId: string) => {
    setSelectedPreferences(prev => 
      prev.includes(preferenceId) 
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId]
    );
  };

  const handleGetRecommendations = () => {
    const profiles = userProfiles.filter(p => selectedProfiles.includes(p.id));
    const intolerances = userIntolerances.filter(i => selectedIntolerances.includes(i.id));
    const preferences = userPreferences.filter(p => selectedPreferences.includes(p.id));
    
    const results = waterRecommendationService.calculateRecommendations(profiles, intolerances, preferences);
    setRecommendations(results);
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
  };

  const hasSelections = selectedWaterType !== 'all' || selectedProfiles.length > 0 || selectedIntolerances.length > 0 || selectedPreferences.length > 0;

  if (showResults) {
    return (
      <Layout>
        <SEOHead 
          title={seoData.quelleEauBoire.title}
          description={seoData.quelleEauBoire.description}
          keywords={seoData.quelleEauBoire.keywords}
          canonical="/quelle-eau-boire"
          ogImage={seoData.quelleEauBoire.ogImage}
          schemaData={{
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Recommandations d'eau personnalisées",
            "description": seoData.quelleEauBoire.description,
            "url": "https://infoeau.fr/quelle-eau-boire",
            "mainEntity": generateFAQSchema(faqData)
          }}
        />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="container mx-auto">
            <Breadcrumb items={[
              { name: t('breadcrumb.waterRecommendation'), href: '/quelle-eau-boire', current: true }
            ]} />
          </div>
          
          <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Vos recommandations d'eau</h1>
          <div className="flex gap-2 justify-center mb-4 flex-wrap">
            {selectedProfiles.map(profileId => {
              const profile = userProfiles.find(p => p.id === profileId);
              return profile ? (
                <Badge key={profileId} className={profile.color}>
                  {profile.name}
                </Badge>
              ) : null;
            })}
            {selectedIntolerances.map(intoleranceId => {
              const intolerance = userIntolerances.find(i => i.id === intoleranceId);
              return intolerance ? (
                <Badge key={intoleranceId} variant="destructive">
                  ❌ {intolerance.name}
                </Badge>
              ) : null;
            })}
            {selectedPreferences.map(preferenceId => {
              const preference = userPreferences.find(p => p.id === preferenceId);
              return preference ? (
                <Badge key={preferenceId} variant="outline">
                  ⭐ {preference.name}
                </Badge>
              ) : null;
            })}
          </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleReset} variant="outline">
                Nouvelle recherche
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {recommendations.map((recommendation, index) => (
              <Card key={`${recommendation.bottle.id}-${index}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        {recommendation.bottle.marque} {recommendation.bottle.nom_bouteille}
                      </CardTitle>
                      <p className="text-muted-foreground">{recommendation.bottle.type_eau}</p>
                      {recommendation.bottle.source && (
                        <p className="text-sm text-muted-foreground">Source : {recommendation.bottle.source}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="mb-2">
                        Score : {recommendation.score}/100
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {recommendation.bottle.prix_moyen_litre?.toFixed(2) || 'N/A'}€/L
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendation.warnings.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <h4 className="font-semibold text-yellow-800">Avertissements</h4>
                        </div>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {recommendation.warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold mb-2">Pourquoi cette eau ?</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {recommendation.reasons.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Composition (mg/L)</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold">{recommendation.bottle.nitrates_mgL}</div>
                          <div className="text-sm text-muted-foreground">Nitrates</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold">{recommendation.bottle.sodium_mgL}</div>
                          <div className="text-sm text-muted-foreground">Sodium</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold">{recommendation.bottle.calcium_mgL}</div>
                          <div className="text-sm text-muted-foreground">Calcium</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold">{recommendation.bottle.magnesium_mgL}</div>
                          <div className="text-sm text-muted-foreground">Magnésium</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold">{recommendation.bottle.residu_sec_mgL}</div>
                          <div className="text-sm text-muted-foreground">Résidu sec</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-semibold">{recommendation.bottle.ecoscore}</div>
                          <div className="text-sm text-muted-foreground">Éco-score</div>
                        </div>
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

  return (
    <Layout>
      <SEOHead 
        title={seoData.quelleEauBoire.title}
        description={seoData.quelleEauBoire.description}
        keywords={seoData.quelleEauBoire.keywords}
        canonical="/quelle-eau-boire"
        ogImage={seoData.quelleEauBoire.ogImage}
        schemaData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Quelle eau boire ? - Guide personnalisé",
          "description": seoData.quelleEauBoire.description,
          "url": "https://infoeau.fr/quelle-eau-boire",
          "mainEntity": generateFAQSchema(faqData)
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto">
          <Breadcrumb items={[
            { name: t('breadcrumb.waterRecommendation'), href: '/quelle-eau-boire', current: true }
          ]} />
        </div>
        
        <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Quelle eau boire ?</h1>
          <p className="text-muted-foreground">
            Trouvez l'eau qui correspond le mieux à vos besoins et à votre profil
          </p>
        </div>

        <div className="space-y-6">
          {/* 1. Type d'eau préféré */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Type d'eau préféré
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Choisissez votre préférence entre eau plate et eau gazeuse
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer ${selectedWaterType === 'all' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`} onClick={() => setSelectedWaterType('all')}>
                  <Checkbox
                    id="all-water"
                    checked={selectedWaterType === 'all'}
                    onCheckedChange={() => setSelectedWaterType('all')}
                  />
                  <div className="flex-1">
                    <label htmlFor="all-water" className="font-medium cursor-pointer">
                      Toutes les eaux
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Plates et gazeuses
                    </p>
                  </div>
                </div>
                <div className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer ${selectedWaterType === 'plate' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`} onClick={() => setSelectedWaterType('plate')}>
                  <Checkbox
                    id="flat-water"
                    checked={selectedWaterType === 'plate'}
                    onCheckedChange={() => setSelectedWaterType('plate')}
                  />
                  <div className="flex-1">
                    <label htmlFor="flat-water" className="font-medium cursor-pointer">
                      Eau plate uniquement
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Sans bulles
                    </p>
                  </div>
                </div>
                <div className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer ${selectedWaterType === 'gazeuse' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`} onClick={() => setSelectedWaterType('gazeuse')}>
                  <Checkbox
                    id="sparkling-water"
                    checked={selectedWaterType === 'gazeuse'}
                    onCheckedChange={() => setSelectedWaterType('gazeuse')}
                  />
                  <div className="flex-1">
                    <label htmlFor="sparkling-water" className="font-medium cursor-pointer">
                      Eau gazeuse uniquement
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Avec bulles
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Profils */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Choisissez votre profil
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Sélectionnez un ou plusieurs profils qui vous correspondent
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProfiles.map((profile) => (
                  <div key={profile.id} className="flex items-start space-x-3 p-4 rounded-lg border">
                    <Checkbox
                      id={profile.id}
                      checked={selectedProfiles.includes(profile.id)}
                      onCheckedChange={() => handleProfileToggle(profile.id)}
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={profile.id} 
                        className="font-medium cursor-pointer"
                      >
                        {profile.name}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {profile.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. Intolérances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  3
                </span>
                Intolérances et restrictions
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Sélectionnez les substances que vous souhaitez éviter
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userIntolerances.map((intolerance) => (
                  <div key={intolerance.id} className="flex items-start space-x-3 p-4 rounded-lg border border-red-200 bg-red-50">
                    <Checkbox
                      id={intolerance.id}
                      checked={selectedIntolerances.includes(intolerance.id)}
                      onCheckedChange={() => handleIntoleranceToggle(intolerance.id)}
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={intolerance.id} 
                        className="font-medium cursor-pointer text-red-800"
                      >
                        {intolerance.name}
                      </label>
                      <p className="text-sm text-red-600">
                        {intolerance.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. Préférences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  4
                </span>
                Préférences personnelles
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Indiquez vos préférences pour le type d'eau
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userPreferences.map((preference) => (
                  <div key={preference.id} className="flex items-start space-x-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
                    <Checkbox
                      id={preference.id}
                      checked={selectedPreferences.includes(preference.id)}
                      onCheckedChange={() => handlePreferenceToggle(preference.id)}
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={preference.id} 
                        className="font-medium cursor-pointer text-blue-800"
                      >
                        {preference.name}
                      </label>
                      <p className="text-sm text-blue-600">
                        {preference.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <Button 
            onClick={handleGetRecommendations}
            disabled={!hasSelections}
            className="px-8"
          >
            Obtenir mes recommandations
          </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuelleEauBoire;