
import React from 'react';
import { AlertTriangle, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();

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
      case 'low': return t('comp.pollutantCard.riskLow');
      case 'medium': return t('comp.pollutantCard.riskMedium');
      case 'high': return t('comp.pollutantCard.riskHigh');
      default: return t('comp.pollutantCard.riskUnknown');
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
              <span className="text-gray-600">{t('comp.pollutantCard.category')}</span>
              <p className="font-medium">{pollutant.category}</p>
            </div>
            <div>
              <span className="text-gray-600">{t('comp.pollutantCard.legalLimit')}</span>
              <p className="font-medium">{pollutant.limit} {pollutant.unit}</p>
            </div>
            <div>
              <span className="text-gray-600">{t('comp.pollutantCard.detection')}</span>
              <p className="font-medium">{pollutant.detection}</p>
            </div>
            <div>
              <span className="text-gray-600">{t('comp.pollutantCard.commonValues')}</span>
              <p className="font-medium">{pollutant.commonValues}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              {t('comp.pollutantCard.origin')}
            </h4>
            <p className="text-sm text-gray-700">{pollutant.origin}</p>
          </div>

          <div className="bg-red-50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2 text-red-800">{t('comp.pollutantCard.healthEffects')}</h4>
            <p className="text-sm text-red-700">{pollutant.health}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm">
              <span className="text-gray-600">{t('comp.pollutantCard.prevalence')} </span>
              <span className="font-medium">{pollutant.prevalence}{t('comp.pollutantCard.ofNetworks')}</span>
            </div>
            <Button size="sm" variant="outline" asChild>
              <a href="/carte-polluants">
                {t('comp.pollutantCard.viewOnMap')}
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PollutantCard;
