
import React, { useState } from 'react';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LazyInteractiveMap from './LazyInteractiveMap';
import { MapLoader } from '@/components/ui/map-loader';

const QualityMap = () => {
  const [showWaterSources, setShowWaterSources] = useState<boolean>(true);

  // Mock data for demonstration
  const regions = [
    { id: 'ile-de-france', name: 'Île-de-France', quality: 'B', cities: 1276, alerts: 2, waterSource: 'Seine et Marne' },
    { id: 'auvergne-rhone-alpes', name: 'Auvergne-Rhône-Alpes', quality: 'A', cities: 4032, alerts: 0, waterSource: 'Sources montagne' },
    { id: 'nouvelle-aquitaine', name: 'Nouvelle-Aquitaine', quality: 'B', cities: 4356, alerts: 1, waterSource: 'Nappes phréatiques' },
    { id: 'occitanie', name: 'Occitanie', quality: 'C', cities: 4448, alerts: 5, waterSource: 'Eaux souterraines' },
    { id: 'hauts-de-france', name: 'Hauts-de-France', quality: 'B', cities: 3789, alerts: 3, waterSource: 'Nappes de craie' },
    { id: 'grand-est', name: 'Grand Est', quality: 'A', cities: 5133, alerts: 1, waterSource: 'Eaux de surface' },
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
      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Légende des scores de qualité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { grade: 'A', label: 'Excellente', desc: 'Conforme en tout point' },
              { grade: 'B', label: 'Bonne', desc: 'Dépassement ponctuel' },
              { grade: 'C', label: 'Acceptable', desc: 'Données incomplètes' },
              { grade: 'D', label: 'Médiocre', desc: 'Non-conformité chronique' },
              { grade: 'E', label: 'Mauvaise', desc: 'Risques sanitaires' },
            ].map(item => (
              <div key={item.grade} className="flex items-center space-x-3">
                <div className={`w-6 h-6 md:w-8 md:h-8 ${getQualityColor(item.grade)} rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm`}>
                  {item.grade}
                </div>
                <div>
                  <div className="font-medium text-xs md:text-sm">{item.label}</div>
                  <div className="text-xs text-gray-600">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Water Sources Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Visualisation des sources d'eau</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant={showWaterSources ? "default" : "outline"}
            onClick={() => setShowWaterSources(!showWaterSources)}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto text-xs md:text-sm px-3 py-2"
          >
            {showWaterSources ? <Eye className="w-3 h-3 md:w-4 md:h-4" /> : <EyeOff className="w-3 h-3 md:w-4 md:h-4" />}
            <span className="hidden sm:inline">
              {showWaterSources ? 'Masquer les zones de provenance' : 'Afficher les zones de provenance'}
            </span>
            <span className="sm:hidden">
              {showWaterSources ? 'Masquer zones' : 'Afficher zones'}
            </span>
          </Button>
        </CardContent>
      </Card>

      {/* Interactive Map - Lazy loaded on mobile */}
      <MapLoader loadOnInteraction={true} minHeight="60vh">
        <LazyInteractiveMap showWaterSources={showWaterSources} />
      </MapLoader>

      {/* Regional Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map(region => (
          <Card key={region.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm md:text-lg">{region.name}</CardTitle>
                <Badge className={`${getQualityColor(region.quality)} text-white text-xs`}>
                  {region.quality}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Qualité moyenne</span>
                  <span className="font-medium">{getQualityLabel(region.quality)}</span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Source d'eau</span>
                  <span className="font-medium text-right">{region.waterSource}</span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Communes</span>
                  <span className="font-medium">{region.cities.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Alertes actives</span>
                  <div className="flex items-center space-x-1">
                    {region.alerts > 0 && (
                      <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                    )}
                    <span className={`font-medium ${region.alerts > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {region.alerts > 0 ? (
                        <a href="/alertes" className="hover:underline">
                          {region.alerts}
                        </a>
                      ) : (
                        region.alerts
                      )}
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
