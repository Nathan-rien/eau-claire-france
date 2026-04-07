
import React, { useState } from 'react';
import { Eye, EyeOff, AlertTriangle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import LazyInteractiveMap from './LazyInteractiveMap';
import { MapLoader } from '@/components/ui/map-loader';

interface Pollutant {
  name: string;
  avgValue: number;
  unit: string;
  limitValue: number;
  exceedanceRate: number;
}

interface Region {
  id: string;
  name: string;
  quality: string;
  cities: number;
  alerts: number;
  waterSource: string;
  complianceRate: number;
  population: number;
  waterSupplyZones: number;
  mainPollutants: Pollutant[];
}

const regions: Region[] = [
  {
    id: 'ile-de-france', name: 'Île-de-France', quality: 'B', cities: 1276, alerts: 2,
    waterSource: 'Seine et Marne', complianceRate: 98.2, population: 12.3, waterSupplyZones: 430,
    mainPollutants: [
      { name: 'Nitrates', avgValue: 28, unit: 'mg/L', limitValue: 50, exceedanceRate: 1.2 },
      { name: 'Pesticides', avgValue: 0.08, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 2.1 },
      { name: 'Plomb', avgValue: 3.2, unit: 'µg/L', limitValue: 10, exceedanceRate: 0.3 },
      { name: 'PFAS', avgValue: 0.06, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 0.8 },
      { name: 'THM', avgValue: 45, unit: 'µg/L', limitValue: 100, exceedanceRate: 0.5 },
    ],
  },
  {
    id: 'auvergne-rhone-alpes', name: 'Auvergne-Rhône-Alpes', quality: 'A', cities: 4032, alerts: 0,
    waterSource: 'Sources montagne', complianceRate: 99.1, population: 8.1, waterSupplyZones: 890,
    mainPollutants: [
      { name: 'Nitrates', avgValue: 12, unit: 'mg/L', limitValue: 50, exceedanceRate: 0.3 },
      { name: 'Pesticides', avgValue: 0.03, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 0.5 },
      { name: 'Plomb', avgValue: 1.8, unit: 'µg/L', limitValue: 10, exceedanceRate: 0.1 },
      { name: 'PFAS', avgValue: 0.02, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 0.2 },
      { name: 'Bactéries coliformes', avgValue: 0, unit: '/100mL', limitValue: 0, exceedanceRate: 0.4 },
    ],
  },
  {
    id: 'nouvelle-aquitaine', name: 'Nouvelle-Aquitaine', quality: 'B', cities: 4356, alerts: 1,
    waterSource: 'Nappes phréatiques', complianceRate: 97.8, population: 6.0, waterSupplyZones: 720,
    mainPollutants: [
      { name: 'Nitrates', avgValue: 32, unit: 'mg/L', limitValue: 50, exceedanceRate: 2.5 },
      { name: 'Pesticides', avgValue: 0.07, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 1.8 },
      { name: 'Plomb', avgValue: 2.5, unit: 'µg/L', limitValue: 10, exceedanceRate: 0.4 },
      { name: 'THM', avgValue: 38, unit: 'µg/L', limitValue: 100, exceedanceRate: 0.3 },
      { name: 'Chlore résiduel', avgValue: 0.15, unit: 'mg/L', limitValue: 0.3, exceedanceRate: 0.2 },
    ],
  },
  {
    id: 'occitanie', name: 'Occitanie', quality: 'C', cities: 4448, alerts: 5,
    waterSource: 'Eaux souterraines', complianceRate: 97.5, population: 5.9, waterSupplyZones: 680,
    mainPollutants: [
      { name: 'Nitrates', avgValue: 35, unit: 'mg/L', limitValue: 50, exceedanceRate: 3.1 },
      { name: 'Pesticides', avgValue: 0.09, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 2.8 },
      { name: 'Plomb', avgValue: 4.1, unit: 'µg/L', limitValue: 10, exceedanceRate: 0.6 },
      { name: 'PFAS', avgValue: 0.05, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 0.5 },
      { name: 'Bactéries coliformes', avgValue: 0, unit: '/100mL', limitValue: 0, exceedanceRate: 1.2 },
      { name: 'THM', avgValue: 52, unit: 'µg/L', limitValue: 100, exceedanceRate: 0.9 },
    ],
  },
  {
    id: 'hauts-de-france', name: 'Hauts-de-France', quality: 'B', cities: 3789, alerts: 3,
    waterSource: 'Nappes de craie', complianceRate: 97.9, population: 6.0, waterSupplyZones: 510,
    mainPollutants: [
      { name: 'Nitrates', avgValue: 38, unit: 'mg/L', limitValue: 50, exceedanceRate: 3.5 },
      { name: 'Pesticides', avgValue: 0.06, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 1.4 },
      { name: 'Plomb', avgValue: 3.8, unit: 'µg/L', limitValue: 10, exceedanceRate: 0.5 },
      { name: 'PFAS', avgValue: 0.07, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 1.0 },
      { name: 'THM', avgValue: 42, unit: 'µg/L', limitValue: 100, exceedanceRate: 0.4 },
    ],
  },
  {
    id: 'grand-est', name: 'Grand Est', quality: 'A', cities: 5133, alerts: 1,
    waterSource: 'Eaux de surface', complianceRate: 98.5, population: 5.6, waterSupplyZones: 620,
    mainPollutants: [
      { name: 'Nitrates', avgValue: 22, unit: 'mg/L', limitValue: 50, exceedanceRate: 0.8 },
      { name: 'Pesticides', avgValue: 0.04, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 0.7 },
      { name: 'Plomb', avgValue: 2.1, unit: 'µg/L', limitValue: 10, exceedanceRate: 0.2 },
      { name: 'PFAS', avgValue: 0.03, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 0.3 },
      { name: 'Bactéries coliformes', avgValue: 0, unit: '/100mL', limitValue: 0, exceedanceRate: 0.6 },
    ],
  },
  {
    id: 'bretagne', name: 'Bretagne', quality: 'C', cities: 1208, alerts: 4,
    waterSource: 'Eaux de surface', complianceRate: 96.8, population: 3.4, waterSupplyZones: 310,
    mainPollutants: [
      { name: 'Nitrates', avgValue: 42, unit: 'mg/L', limitValue: 50, exceedanceRate: 5.2 },
      { name: 'Pesticides', avgValue: 0.09, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 3.1 },
      { name: 'Plomb', avgValue: 2.8, unit: 'µg/L', limitValue: 10, exceedanceRate: 0.3 },
      { name: 'PFAS', avgValue: 0.04, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 0.4 },
      { name: 'THM', avgValue: 55, unit: 'µg/L', limitValue: 100, exceedanceRate: 1.1 },
      { name: 'Bactéries coliformes', avgValue: 0, unit: '/100mL', limitValue: 0, exceedanceRate: 1.5 },
    ],
  },
  {
    id: 'pays-de-la-loire', name: 'Pays de la Loire', quality: 'B', cities: 1266, alerts: 2,
    waterSource: 'Loire et affluents', complianceRate: 98.0, population: 3.8, waterSupplyZones: 380,
    mainPollutants: [
      { name: 'Nitrates', avgValue: 30, unit: 'mg/L', limitValue: 50, exceedanceRate: 2.0 },
      { name: 'Pesticides', avgValue: 0.06, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 1.5 },
      { name: 'Plomb', avgValue: 2.3, unit: 'µg/L', limitValue: 10, exceedanceRate: 0.2 },
      { name: 'THM', avgValue: 40, unit: 'µg/L', limitValue: 100, exceedanceRate: 0.4 },
      { name: 'Chlore résiduel', avgValue: 0.12, unit: 'mg/L', limitValue: 0.3, exceedanceRate: 0.1 },
    ],
  },
  {
    id: 'normandie', name: 'Normandie', quality: 'B', cities: 2651, alerts: 2,
    waterSource: 'Nappes calcaires', complianceRate: 97.6, population: 3.3, waterSupplyZones: 420,
    mainPollutants: [
      { name: 'Nitrates', avgValue: 33, unit: 'mg/L', limitValue: 50, exceedanceRate: 2.8 },
      { name: 'Pesticides', avgValue: 0.07, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 1.9 },
      { name: 'Plomb', avgValue: 3.0, unit: 'µg/L', limitValue: 10, exceedanceRate: 0.4 },
      { name: 'Bactéries coliformes', avgValue: 0, unit: '/100mL', limitValue: 0, exceedanceRate: 0.9 },
      { name: 'THM', avgValue: 48, unit: 'µg/L', limitValue: 100, exceedanceRate: 0.6 },
    ],
  },
  {
    id: 'bourgogne-franche-comte', name: 'Bourgogne-Franche-Comté', quality: 'A', cities: 3702, alerts: 0,
    waterSource: 'Sources karstiques', complianceRate: 98.8, population: 2.8, waterSupplyZones: 490,
    mainPollutants: [
      { name: 'Nitrates', avgValue: 18, unit: 'mg/L', limitValue: 50, exceedanceRate: 0.6 },
      { name: 'Pesticides', avgValue: 0.04, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 0.8 },
      { name: 'Plomb', avgValue: 1.5, unit: 'µg/L', limitValue: 10, exceedanceRate: 0.1 },
      { name: 'THM', avgValue: 30, unit: 'µg/L', limitValue: 100, exceedanceRate: 0.2 },
    ],
  },
  {
    id: 'centre-val-de-loire', name: 'Centre-Val de Loire', quality: 'B', cities: 1757, alerts: 2,
    waterSource: 'Nappes alluviales', complianceRate: 97.4, population: 2.6, waterSupplyZones: 350,
    mainPollutants: [
      { name: 'Nitrates', avgValue: 36, unit: 'mg/L', limitValue: 50, exceedanceRate: 3.2 },
      { name: 'Pesticides', avgValue: 0.08, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 2.4 },
      { name: 'Plomb', avgValue: 2.7, unit: 'µg/L', limitValue: 10, exceedanceRate: 0.3 },
      { name: 'PFAS', avgValue: 0.04, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 0.4 },
      { name: 'THM', avgValue: 44, unit: 'µg/L', limitValue: 100, exceedanceRate: 0.5 },
    ],
  },
  {
    id: 'provence-alpes-cote-dazur', name: "Provence-Alpes-Côte d'Azur", quality: 'A', cities: 946, alerts: 1,
    waterSource: 'Durance et sources', complianceRate: 98.9, population: 5.1, waterSupplyZones: 410,
    mainPollutants: [
      { name: 'Nitrates', avgValue: 15, unit: 'mg/L', limitValue: 50, exceedanceRate: 0.4 },
      { name: 'Pesticides', avgValue: 0.03, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 0.6 },
      { name: 'Plomb', avgValue: 1.9, unit: 'µg/L', limitValue: 10, exceedanceRate: 0.2 },
      { name: 'Chlore résiduel', avgValue: 0.10, unit: 'mg/L', limitValue: 0.3, exceedanceRate: 0.1 },
    ],
  },
  {
    id: 'corse', name: 'Corse', quality: 'A', cities: 360, alerts: 0,
    waterSource: 'Sources montagneuses', complianceRate: 99.3, population: 0.34, waterSupplyZones: 85,
    mainPollutants: [
      { name: 'Nitrates', avgValue: 8, unit: 'mg/L', limitValue: 50, exceedanceRate: 0.1 },
      { name: 'Pesticides', avgValue: 0.01, unit: 'µg/L', limitValue: 0.1, exceedanceRate: 0.2 },
      { name: 'Plomb', avgValue: 1.2, unit: 'µg/L', limitValue: 10, exceedanceRate: 0.1 },
      { name: 'Bactéries coliformes', avgValue: 0, unit: '/100mL', limitValue: 0, exceedanceRate: 0.3 },
    ],
  },
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

const getRiskLevel = (complianceRate: number): 'low' | 'medium' | 'high' => {
  if (complianceRate >= 98) return 'low';
  if (complianceRate >= 96) return 'medium';
  return 'high';
};

const getRiskLabel = (level: 'low' | 'medium' | 'high') =>
  level === 'low' ? 'Faible' : level === 'medium' ? 'Modéré' : 'Élevé';

const getRiskBadgeClass = (level: 'low' | 'medium' | 'high') =>
  level === 'low'
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : level === 'medium'
    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

const getExceedanceColor = (rate: number) =>
  rate > 2 ? 'text-red-600' : rate > 1 ? 'text-yellow-600' : 'text-green-600';

const QualityMap = () => {
  const [showWaterSources, setShowWaterSources] = useState<boolean>(true);

  return (
    <div className="space-y-6">
      {/* Quality Grade Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Légende des scores de qualité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Risk Level Legend */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Niveaux de risque (basés sur le taux de conformité)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { level: 'low' as const, label: 'Faible', desc: 'Conformité ≥ 98 %', color: 'bg-green-500' },
                { level: 'medium' as const, label: 'Modéré', desc: 'Conformité 96–98 %', color: 'bg-yellow-500' },
                { level: 'high' as const, label: 'Élevé', desc: 'Conformité < 96 %', color: 'bg-red-500' },
              ].map(item => (
                <div key={item.level} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 md:w-8 md:h-8 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                    ●
                  </div>
                  <div>
                    <div className="font-medium text-xs md:text-sm">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Interactive Map */}
      <MapLoader loadOnInteraction={true} minHeight="60vh">
        <LazyInteractiveMap showWaterSources={showWaterSources} />
      </MapLoader>

      {/* Regional Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map(region => {
          const riskLevel = getRiskLevel(region.complianceRate);
          return (
            <Card key={region.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm md:text-lg">{region.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskBadgeClass(riskLevel)}>
                      {getRiskLabel(riskLevel)}
                    </Badge>
                    <Badge className={`${getQualityColor(region.quality)} text-white text-xs`}>
                      {region.quality}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">Qualité moyenne</span>
                    <span className="font-medium">{getQualityLabel(region.quality)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">Taux de conformité</span>
                    <span className="font-medium">{region.complianceRate} %</span>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">Source d'eau</span>
                    <span className="font-medium text-right">{region.waterSource}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">Population desservie</span>
                    <span className="font-medium">{region.population} M</span>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">Zones d'approvisionnement</span>
                    <span className="font-medium">{region.waterSupplyZones.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">Communes</span>
                    <span className="font-medium">{region.cities.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">Alertes actives</span>
                    <div className="flex items-center space-x-1">
                      {region.alerts > 0 && (
                        <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                      )}
                      <span className={`font-medium ${region.alerts > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {region.alerts > 0 ? (
                          <a href="/alertes" className="hover:underline">{region.alerts}</a>
                        ) : (
                          region.alerts
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Collapsible Pollutants */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full pt-2 text-xs md:text-sm font-medium text-primary hover:underline">
                      <span>Polluants détectés ({region.mainPollutants.length})</span>
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4 transition-transform data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-1 px-1 text-muted-foreground font-medium">Polluant</th>
                              <th className="text-right py-1 px-1 text-muted-foreground font-medium">Moy.</th>
                              <th className="text-right py-1 px-1 text-muted-foreground font-medium">Limite</th>
                              <th className="text-right py-1 px-1 text-muted-foreground font-medium">Dép. %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {region.mainPollutants.map(p => (
                              <tr key={p.name} className="border-b border-border/50">
                                <td className="py-1 px-1">{p.name}</td>
                                <td className="text-right py-1 px-1">{p.avgValue} {p.unit}</td>
                                <td className="text-right py-1 px-1">{p.limitValue}</td>
                                <td className={`text-right py-1 px-1 font-medium ${getExceedanceColor(p.exceedanceRate)}`}>
                                  {p.exceedanceRate} %
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {riskLevel === 'high' && (
                    <div className="flex items-center space-x-1 text-xs md:text-sm text-destructive pt-1">
                      <AlertTriangle className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Région à surveiller</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QualityMap;
