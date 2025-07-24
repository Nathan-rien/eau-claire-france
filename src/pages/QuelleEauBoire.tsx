import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';

interface WaterProfile {
  id: string;
  name: string;
  description: string;
}

interface WaterRecommendation {
  id: string;
  name: string;
  type: string;
  score: number;
  reasons: string[];
  composition: { [key: string]: number };
}

const profiles: WaterProfile[] = [
  { id: 'sport', name: 'Sportif', description: 'Pratique sportive régulière' },
  { id: 'pregnant', name: 'Femme enceinte', description: 'Besoins spécifiques pendant la grossesse' },
  { id: 'senior', name: 'Senior', description: 'Plus de 65 ans' },
  { id: 'child', name: 'Enfant', description: 'Moins de 12 ans' },
];

const mockRecommendations: WaterRecommendation[] = [
  {
    id: '1',
    name: 'Evian',
    type: 'Eau de source',
    score: 85,
    reasons: ['Faible minéralisation', 'Adaptée aux enfants', 'pH neutre'],
    composition: { calcium: 80, magnesium: 26, sodium: 6.5 }
  },
  {
    id: '2',
    name: 'Volvic',
    type: 'Eau de source',
    score: 82,
    reasons: ['Très faible minéralisation', 'Idéale pour les nourrissons'],
    composition: { calcium: 11.5, magnesium: 8, sodium: 11.6 }
  }
];

const QuelleEauBoire: React.FC = () => {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<WaterRecommendation[]>([]);

  const handleProfileToggle = (profileId: string) => {
    setSelectedProfiles(prev => 
      prev.includes(profileId) 
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const handleGetRecommendations = () => {
    setRecommendations(mockRecommendations);
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedProfiles([]);
    setShowResults(false);
    setRecommendations([]);
  };

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
            <div className="flex gap-2 justify-center mb-4">
              {selectedProfiles.map(profileId => {
                const profile = profiles.find(p => p.id === profileId);
                return profile ? (
                  <Badge key={profileId} variant="secondary">
                    {profile.name}
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
            {recommendations.map((water, index) => (
              <Card key={water.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        {water.name}
                      </CardTitle>
                      <p className="text-muted-foreground">{water.type}</p>
                    </div>
                    <Badge variant="default">
                      Score: {water.score}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Pourquoi cette eau ?</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {water.reasons.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Composition (mg/L)</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(water.composition).map(([mineral, value]) => (
                          <div key={mineral} className="text-center p-2 bg-muted rounded">
                            <div className="font-semibold">{value}</div>
                            <div className="text-sm text-muted-foreground capitalize">{mineral}</div>
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

        <Card>
          <CardHeader>
            <CardTitle>Sélectionnez votre profil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map((profile) => (
                <div key={profile.id} className="flex items-start space-x-3 p-4 rounded-lg border">
                  <Checkbox
                    id={profile.id}
                    checked={selectedProfiles.includes(profile.id)}
                    onCheckedChange={() => handleProfileToggle(profile.id)}
                  />
                  <div>
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

            <div className="mt-6 text-center">
              <Button 
                onClick={handleGetRecommendations}
                disabled={selectedProfiles.length === 0}
                className="px-8"
              >
                Obtenir mes recommandations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default QuelleEauBoire;