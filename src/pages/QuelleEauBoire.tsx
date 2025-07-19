import React, { useState } from 'react';
import { Droplets, CheckCircle, Star, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import Layout from '@/components/Layout';
import { userProfiles, userIntolerances, userPreferences, UserProfile, UserIntolerance, UserPreference } from '@/data/waterProfiles';
import { getWaterRecommendations, WaterScore, getMineralColor } from '@/utils/waterRecommendation';

const QuelleEauBoire = () => {
  const [selectedProfiles, setSelectedProfiles] = useState<UserProfile[]>([]);
  const [selectedIntolerances, setSelectedIntolerances] = useState<UserIntolerance[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<UserPreference[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<WaterScore[]>([]);

  const handleProfileToggle = (profile: UserProfile) => {
    setSelectedProfiles(prev => {
      const exists = prev.find(p => p.id === profile.id);
      if (exists) {
        return prev.filter(p => p.id !== profile.id);
      } else {
        return [...prev, profile];
      }
    });
  };

  const handleIntoleranceToggle = (intolerance: UserIntolerance) => {
    setSelectedIntolerances(prev => {
      const exists = prev.find(i => i.id === intolerance.id);
      if (exists) {
        return prev.filter(i => i.id !== intolerance.id);
      } else {
        return [...prev, intolerance];
      }
    });
  };

  const handlePreferenceToggle = (preference: UserPreference) => {
    setSelectedPreferences(prev => {
      const exists = prev.find(p => p.id === preference.id);
      if (exists) {
        return prev.filter(p => p.id !== preference.id);
      } else {
        return [...prev, preference];
      }
    });
  };

  const handleGetRecommendations = () => {
    const results = getWaterRecommendations({
      profiles: selectedProfiles,
      intolerances: selectedIntolerances,
      preferences: selectedPreferences
    });
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          <section className="py-12 px-4">
            <div className="container mx-auto max-w-4xl">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                  <Droplets className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                  <span>Vos recommandations d'eau</span>
                </h1>
                <p className="text-base md:text-lg text-gray-600 mb-6">
                  Voici les eaux les mieux adaptées à vos besoins
                </p>
                
                {/* Selected criteria */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {selectedProfiles.map(profile => (
                    <Badge key={profile.id} className={profile.color}>
                      {profile.name}
                    </Badge>
                  ))}
                  {selectedIntolerances.map(intolerance => (
                    <Badge key={intolerance.id} variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                      {intolerance.name}
                    </Badge>
                  ))}
                  {selectedPreferences.map(preference => (
                    <Badge key={preference.id} variant="outline">
                      {preference.name}
                    </Badge>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" onClick={handleReset}>
                    Nouvelle recherche
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>

              {/* Results */}
              {recommendations.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-500 mb-4">Aucune eau ne correspond parfaitement à vos critères.</p>
                    <Button onClick={handleReset}>Modifier vos critères</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {recommendations.map((recommendation, index) => (
                    <Card key={recommendation.id} className="overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                              #{index + 1} {recommendation.name}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mb-2">{recommendation.type}</p>
                            <p className="text-xs text-gray-500">{recommendation.source}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={recommendation.badgeColor}>
                              {recommendation.badgeText}
                            </Badge>
                            <div className="mt-2">
                              <div className="text-2xl font-bold text-blue-600">
                                {recommendation.percentage}%
                              </div>
                              <div className="text-xs text-gray-500">
                                {recommendation.score}/{recommendation.maxScore} pts
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        {/* Composition */}
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Composition (mg/L)</h4>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Nitrates</span>
                              <div className={`font-semibold ${getMineralColor('nitrates', recommendation.composition.nitrates)}`}>
                                {recommendation.composition.nitrates}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Sodium</span>
                              <div className={`font-semibold ${getMineralColor('sodium', recommendation.composition.sodium)}`}>
                                {recommendation.composition.sodium}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Calcium</span>
                              <div className={`font-semibold ${getMineralColor('calcium', recommendation.composition.calcium)}`}>
                                {recommendation.composition.calcium}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Magnésium</span>
                              <div className={`font-semibold ${getMineralColor('magnesium', recommendation.composition.magnesium)}`}>
                                {recommendation.composition.magnesium}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Résidu sec</span>
                              <div className={`font-semibold ${getMineralColor('residusSec', recommendation.composition.residusSec)}`}>
                                {recommendation.composition.residusSec}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Reasons */}
                        {recommendation.reasons.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2">Pourquoi cette eau ?</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {recommendation.reasons.map((reason, idx) => (
                                <li key={idx} className="flex items-start">
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Prix moyen</span>
                          <span className="font-semibold">{recommendation.price}€/L</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <Droplets className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                <span>Quelle eau boire ?</span>
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                Découvrez les eaux en bouteille les mieux adaptées à vos besoins physiologiques, 
                intolérances et objectifs de santé.
              </p>
            </div>

            {/* Step 1: Profiles */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  <span>Choisissez votre profil</span>
                </CardTitle>
                <p className="text-gray-600">Sélectionnez un ou plusieurs profils qui vous correspondent</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userProfiles.map(profile => (
                    <div
                      key={profile.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedProfiles.find(p => p.id === profile.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleProfileToggle(profile)}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          checked={!!selectedProfiles.find(p => p.id === profile.id)}
                          onChange={() => {}}
                        />
                        <div>
                          <h3 className="font-semibold">{profile.name}</h3>
                          <p className="text-sm text-gray-600">{profile.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Intolerances */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  <span>Avez-vous des intolérances ?</span>
                </CardTitle>
                <p className="text-gray-600">Sélectionnez vos intolérances ou sensibilités (optionnel)</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userIntolerances.map(intolerance => (
                    <div
                      key={intolerance.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedIntolerances.find(i => i.id === intolerance.id)
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleIntoleranceToggle(intolerance)}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          checked={!!selectedIntolerances.find(i => i.id === intolerance.id)}
                          onChange={() => {}}
                        />
                        <div>
                          <h3 className="font-semibold">{intolerance.name}</h3>
                          <p className="text-sm text-gray-600">{intolerance.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Preferences */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  <span>Préférences spécifiques</span>
                </CardTitle>
                <p className="text-gray-600">Critères additionnels selon vos préférences (optionnel)</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userPreferences.map(preference => (
                    <div
                      key={preference.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPreferences.find(p => p.id === preference.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handlePreferenceToggle(preference)}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          checked={!!selectedPreferences.find(p => p.id === preference.id)}
                          onChange={() => {}}
                        />
                        <div>
                          <h3 className="font-semibold">{preference.name}</h3>
                          <p className="text-sm text-gray-600">{preference.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Get Recommendations Button */}
            <div className="text-center">
              <Button 
                size="lg" 
                onClick={handleGetRecommendations}
                disabled={!hasSelections}
                className="px-8 py-3"
              >
                <Star className="w-5 h-5 mr-2" />
                Voir mes recommandations
              </Button>
              {!hasSelections && (
                <p className="text-sm text-gray-500 mt-2">
                  Veuillez sélectionner au moins un profil, une intolérance ou une préférence
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default QuelleEauBoire;