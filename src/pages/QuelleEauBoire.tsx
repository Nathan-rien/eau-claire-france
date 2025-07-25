import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { userProfiles, userIntolerances, userPreferences, UserProfile, UserIntolerance, UserPreference } from '@/data/waterProfiles';
import { waterRecommendationService, WaterRecommendation } from '@/services/waterRecommendationService';

const QuelleEauBoire: React.FC = () => {
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
  };

  const handleReset = () => {
    setSelectedProfiles([]);
    setSelectedIntolerances([]);
    setSelectedPreferences([]);
    setShowResults(false);
    setRecommendations([]);
  };

  const hasSelections = selectedProfiles.length > 0 || selectedIntolerances.length > 0 || selectedPreferences.length > 0;

  if (showResults) {
    return (
      <Layout>
        <SEOHead 
          title="Recommandations d'eau - Quelle eau boire ?"
          description="Découvrez les eaux recommandées selon votre profil"
        />
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
                        <p className="text-sm text-muted-foreground">Source: {recommendation.bottle.source}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="mb-2">
                        Score: {recommendation.score}/100
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
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead 
        title="Quelle eau boire ? - Trouvez l'eau adaptée à vos besoins"
        description="Découvrez quelle eau boire selon votre profil et vos besoins spécifiques"
      />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Quelle eau boire ?</h1>
          <p className="text-muted-foreground">
            Trouvez l'eau qui correspond le mieux à vos besoins et à votre profil
          </p>
        </div>

        <Tabs defaultValue="profiles" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profiles">Profils</TabsTrigger>
            <TabsTrigger value="intolerances">Intolérances</TabsTrigger>
            <TabsTrigger value="preferences">Préférences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profiles">
            <Card>
              <CardHeader>
                <CardTitle>Sélectionnez vos profils</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choisissez les profils qui vous correspondent (plusieurs choix possibles)
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
          </TabsContent>

          <TabsContent value="intolerances">
            <Card>
              <CardHeader>
                <CardTitle>Intolérances et restrictions</CardTitle>
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
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Préférences personnelles</CardTitle>
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
          </TabsContent>
        </Tabs>

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
    </Layout>
  );
};

export default QuelleEauBoire;