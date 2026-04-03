import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';

interface MineralInfo {
  name: string;
  unit: string;
  description: string;
  benefits: string[];
  recommendations: string;
}

const mineralInfos: Record<string, MineralInfo> = {
  nitrates: {
    name: 'Nitrates',
    unit: 'mg/L',
    description: 'Composés azotés naturels présents dans l\'eau',
    benefits: ['Indicateur de qualité de l\'eau', 'Faibles taux recommandés'],
    recommendations: '< 10 mg/L pour nourrissons et femmes enceintes, < 50 mg/L en général'
  },
  sodium: {
    name: 'Sodium',
    unit: 'mg/L',
    description: 'Minéral essentiel pour l\'équilibre hydrique',
    benefits: ['Régulation de la pression artérielle', 'Équilibre des fluides corporels'],
    recommendations: '< 20 mg/L pour régimes sans sel, 10-100 mg/L en général'
  },
  calcium: {
    name: 'Calcium',
    unit: 'mg/L',
    description: 'Minéral essentiel pour les os et les dents',
    benefits: ['Santé osseuse et dentaire', 'Contraction musculaire', 'Coagulation sanguine'],
    recommendations: '> 150 mg/L pour ostéoporose, 50-300 mg/L en général'
  },
  magnesium: {
    name: 'Magnésium',
    unit: 'mg/L',
    description: 'Minéral vital pour de nombreuses fonctions corporelles',
    benefits: ['Fonction musculaire', 'Système nerveux', 'Métabolisme énergétique'],
    recommendations: '> 50 mg/L contre la constipation, > 20 mg/L pour la fatigue'
  },
  residusSec: {
    name: 'Résidu sec',
    unit: 'mg/L',
    description: 'Mesure de la minéralisation totale de l\'eau',
    benefits: ['Indicateur de minéralisation', 'Goût et digestibilité'],
    recommendations: '< 500 mg/L eau légère, > 1000 mg/L eau fortement minéralisée'
  }
};

interface MineralTooltipProps {
  mineral: string;
  value: number;
  className?: string;
}

const MineralTooltip: React.FC<MineralTooltipProps> = ({ mineral, value, className = "" }) => {
  const { t } = useLanguage();
  const info = mineralInfos[mineral];
  
  if (!info) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center cursor-help ${className}`}>
            <Info className="w-3 h-3 ml-1 text-gray-400 hover:text-blue-500" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-3" side="top">
          <div className="space-y-2">
            <div className="font-semibold text-sm">
              {info.name}: {value} {info.unit}
            </div>
            <p className="text-xs text-gray-600">
              {info.description}
            </p>
            <div className="text-xs">
              <p className="font-medium mb-1">{t('comp.mineral.benefits')}</p>
              <ul className="list-disc list-inside space-y-0.5">
                {info.benefits.map((benefit, index) => (
                  <li key={index} className="text-gray-600">{benefit}</li>
                ))}
              </ul>
            </div>
            <div className="text-xs">
              <p className="font-medium">{t('comp.mineral.recommendations')}</p>
              <p className="text-gray-600">{info.recommendations}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MineralTooltip;
