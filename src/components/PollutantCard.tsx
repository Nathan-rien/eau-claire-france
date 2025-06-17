
import React from 'react';
import { AlertTriangle, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface Pollutant {
  id: string;
  name: string;
  category: string;
  limit: number;
  unit: string;
  origin: string;
  health: string;
  prevalence: number;
  trend: string;
  riskLevel: string;
  commonValues: string;
  detection: string;
}

interface PollutantCardProps {
  pollutant: Pollutant;
}

const PollutantCard: React.FC<PollutantCardProps> = ({ pollutant }) => {
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
  );
};

export default PollutantCard;
