import React, { useState } from 'react';
import { AlertTriangle, Info, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PollutantIndex = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock pollutant data
  const pollutants = [
    {
      id: 'nitrates',
      name: 'Nitrates',
      category: 'Chimique',
      limit: 50,
      unit: 'mg/L',
      origin: 'Agriculture intensive, élevage',
      health: 'Risque pour les nourrissons (méthémoglobinémie)',
      prevalence: 15,
      trend: 'stable',
      riskLevel: 'medium',
      commonValues: '5-25 mg/L',
      detection: '85% des réseaux'
    },
    {
      id: 'pesticides',
      name: 'Pesticides totaux',
      category: 'Chimique',
      limit: 0.5,
      unit: 'µg/L',
      origin: 'Agriculture, traitement des espaces verts',
      health: 'Perturbateurs endocriniens, cancérigènes potentiels',
      prevalence: 32,
      trend: 'increasing',
      riskLevel: 'high',
      commonValues: '0.1-0.3 µg/L',
      detection: '32% des réseaux'
    },
    {
      id: 'trihalomethanes',
      name: 'Trihalométhanes',
      category: 'Sous-produit',
      limit: 100,
      unit: 'µg/L',
      origin: 'Chloration de l\'eau (sous-produit de désinfection)',
      health: 'Cancérigènes probables, irritation',
      prevalence: 68,
      trend: 'stable',
      riskLevel: 'medium',
      commonValues: '10-40 µg/L',
      detection: '68% des réseaux'
    },
    {
      id: 'plomb',
      name: 'Plomb',
      category: 'Métaux',
      limit: 10,
      unit: 'µg/L',
      origin: 'Canalisations anciennes, soudures',
      health: 'Neurotoxique, particulièrement dangereux pour les enfants',
      prevalence: 8,
      trend: 'decreasing',
      riskLevel: 'high',
      commonValues: '1-5 µg/L',
      detection: '8% des réseaux'
    },
    {
      id: 'arsenic',
      name: 'Arsenic',
      category: 'Métaux',
      limit: 10,
      unit: 'µg/L',
      origin: 'Géologie naturelle, activités industrielles',
      health: 'Cancérigène, lésions cutanées',
      prevalence: 3,
      trend: 'stable',
      riskLevel: 'high',
      commonValues: '1-3 µg/L',
      detection: '3% des réseaux'
    },
    {
      id: 'fluorures',
      name: 'Fluorures',
      category: 'Chimique',
      limit: 1.5,
      unit: 'mg/L',
      origin: 'Géologie naturelle, industrie',
      health: 'Fluorose dentaire et osseuse à haute dose',
      prevalence: 12,
      trend: 'stable',
      riskLevel: 'low',
      commonValues: '0.1-0.5 mg/L',
      detection: '12% des réseaux'
    }
  ];

  const categories = ['all', 'Chimique', 'Métaux', 'Sous-produit'];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Faible';
      case 'medium': return 'Modéré';
      case 'high': return 'Élevé';
      default: return 'Non évalué';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'stable': return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
      default: return null;
    }
  };

  const filteredPollutants = pollutants.filter(pollutant => {
    const matchesSearch = pollutant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pollutant.origin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pollutant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Index des polluants surveillés</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un polluant..."
                className="w-full"
              />
            </div>
            <div>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-4">
                  {categories.map(category => (
                    <TabsTrigger key={category} value={category}>
                      {category === 'all' ? 'Tous' : category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{pollutants.length}</div>
            <div className="text-sm text-blue-800">Polluants surveillés</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {pollutants.filter(p => p.riskLevel === 'low').length}
            </div>
            <div className="text-sm text-green-800">Risque faible</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {pollutants.filter(p => p.riskLevel === 'medium').length}
            </div>
            <div className="text-sm text-yellow-800">Risque modéré</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {pollutants.filter(p => p.riskLevel === 'high').length}
            </div>
            <div className="text-sm text-red-800">Risque élevé</div>
          </CardContent>
        </Card>
      </div>

      {/* Pollutants List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPollutants.map(pollutant => (
          <Card key={pollutant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span>{pollutant.name}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getRiskColor(pollutant.riskLevel)}>
                    {getRiskLabel(pollutant.riskLevel)}
                  </Badge>
                  {getTrendIcon(pollutant.trend)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Catégorie:</span>
                    <p className="font-medium">{pollutant.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Limite légale:</span>
                    <p className="font-medium">{pollutant.limit} {pollutant.unit}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Détection:</span>
                    <p className="font-medium">{pollutant.detection}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Valeurs courantes:</span>
                    <p className="font-medium">{pollutant.commonValues}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-1" />
                    Origine
                  </h4>
                  <p className="text-sm text-gray-700">{pollutant.origin}</p>
                </div>

                <div className="bg-red-50 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2 text-red-800">Effets sur la santé</h4>
                  <p className="text-sm text-red-700">{pollutant.health}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Prévalence: </span>
                    <span className="font-medium">{pollutant.prevalence}% des réseaux</span>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <a href="/carte-polluants">
                      Voir sur la carte
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPollutants.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun polluant trouvé pour votre recherche.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PollutantIndex;
