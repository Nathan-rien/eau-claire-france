
import React, { useState } from 'react';
import { MapPin, Filter, Droplets, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const QualityMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedPollutant, setSelectedPollutant] = useState<string>('all');

  // Mock data for demonstration
  const regions = [
    { id: 'ile-de-france', name: 'Île-de-France', quality: 'B', cities: 1276, alerts: 2 },
    { id: 'auvergne-rhone-alpes', name: 'Auvergne-Rhône-Alpes', quality: 'A', cities: 4032, alerts: 0 },
    { id: 'nouvelle-aquitaine', name: 'Nouvelle-Aquitaine', quality: 'B', cities: 4356, alerts: 1 },
    { id: 'occitanie', name: 'Occitanie', quality: 'C', cities: 4448, alerts: 5 },
    { id: 'hauts-de-france', name: 'Hauts-de-France', quality: 'B', cities: 3789, alerts: 3 },
    { id: 'grand-est', name: 'Grand Est', quality: 'A', cities: 5133, alerts: 1 },
  ];

  const pollutants = [
    'Nitrates', 'Pesticides', 'Trihalométhanes', 'Plomb', 'Fluorures', 'Arsenic'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card>
        <CardContent className="p-0">
          <div className="h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 800 600" className="w-full h-full">
                {/* Simplified France outline */}
                <path
                  d="M200,150 L250,120 L300,130 L350,140 L400,160 L450,180 L500,200 L520,250 L510,300 L480,350 L450,400 L400,450 L350,480 L300,490 L250,480 L200,450 L150,400 L120,350 L130,300 L140,250 Z"
                  fill="rgba(59, 130, 246, 0.3)"
                  stroke="rgba(59, 130, 246, 0.6)"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="text-center z-10">
              <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Carte Interactive</h3>
              <p className="text-gray-600 mb-4">
                Visualisation de la qualité de l'eau par région
              </p>
              <Button className="bg-gradient-to-r from-blue-500 to-green-500">
                Voir la carte complète
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map(region => (
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
    </div>
  );
};

export default QualityMap;
