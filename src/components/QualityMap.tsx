
import React, { useState } from 'react';
import { Filter, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InteractiveMap from './InteractiveMap';

const QualityMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedPollutant, setSelectedPollutant] = useState<string>('all');

  // Mock data for demonstration
  const regions = [
    { id: 'ile-de-france', name: 'Île-de-France', quality: 'B', cities: 1276, alerts: 2, waterSource: 'Seine et Marne' },
    { id: 'auvergne-rhone-alpes', name: 'Auvergne-Rhône-Alpes', quality: 'A', cities: 4032, alerts: 0, waterSource: 'Sources montagne' },
    { id: 'nouvelle-aquitaine', name: 'Nouvelle-Aquitaine', quality: 'B', cities: 4356, alerts: 1, waterSource: 'Nappes phréatiques' },
    { id: 'occitanie', name: 'Occitanie', quality: 'C', cities: 4448, alerts: 5, waterSource: 'Eaux souterraines' },
    { id: 'hauts-de-france', name: 'Hauts-de-France', quality: 'B', cities: 3789, alerts: 3, waterSource: 'Nappes de craie' },
    { id: 'grand-est', name: 'Grand Est', quality: 'A', cities: 5133, alerts: 1, waterSource: 'Eaux de surface' },
  ];

  const pollutants = [
    'Nitrates', 'Pesticides', 'Trihalométhanes', 'Plomb', 'Fluorures', 'Arsenic'
  ];

  const waterSources = [
    'Seine et Marne', 'Sources montagne', 'Nappes phréatiques', 'Eaux souterraines', 'Nappes de craie', 'Eaux de surface'
  ];

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'E': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'A': return 'Excellente';
      case 'B': return 'Bonne';
      case 'C': return 'Acceptable';
      case 'D': return 'Médiocre';
      case 'E': return 'Mauvaise';
      default: return 'Non évaluée';
    }
  };

  // Filter regions based on selected criteria
  const filteredRegions = regions.filter(region => {
    const regionMatch = selectedRegion === 'all' || region.id === selectedRegion;
    return regionMatch;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtres de visualisation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Région</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les régions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les régions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Polluant</label>
              <Select value={selectedPollutant} onValueChange={setSelectedPollutant}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les polluants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les polluants</SelectItem>
                  {pollutants.map(pollutant => (
                    <SelectItem key={pollutant} value={pollutant.toLowerCase()}>
                      {pollutant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Source d'eau</label>
              <Select value="all" onValueChange={() => {}}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sources</SelectItem>
                  {waterSources.map(source => (
                    <SelectItem key={source} value={source.toLowerCase()}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Légende des scores de qualité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { grade: 'A', label: 'Excellente', desc: 'Conforme en tout point' },
              { grade: 'B', label: 'Bonne', desc: 'Dépassement ponctuel' },
              { grade: 'C', label: 'Acceptable', desc: 'Données incomplètes' },
              { grade: 'D', label: 'Médiocre', desc: 'Non-conformité chronique' },
              { grade: 'E', label: 'Mauvaise', desc: 'Risques sanitaires' },
            ].map(item => (
              <div key={item.grade} className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${getQualityColor(item.grade)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  {item.grade}
                </div>
                <div>
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-gray-600">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <InteractiveMap selectedRegion={selectedRegion} selectedPollutant={selectedPollutant} />

      {/* Regional Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRegions.map(region => (
          <Card key={region.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{region.name}</CardTitle>
                <Badge className={`${getQualityColor(region.quality)} text-white`}>
                  {region.quality}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Qualité moyenne</span>
                  <span className="font-medium">{getQualityLabel(region.quality)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Source d'eau</span>
                  <span className="font-medium">{region.waterSource}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Communes</span>
                  <span className="font-medium">{region.cities.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Alertes actives</span>
                  <div className="flex items-center space-x-1">
                    {region.alerts > 0 && (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    )}
                    <span className={`font-medium ${region.alerts > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {region.alerts}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QualityMap;
