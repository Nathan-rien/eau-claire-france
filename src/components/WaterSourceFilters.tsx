import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSourcesStatistics } from '@/data/waterSources';
import { bottledWaters } from '@/data/bottleWaterData';
import { useLanguage } from '@/contexts/LanguageContext';

interface WaterSourceFiltersProps {
  selectedType: string;
  selectedBrand: string;
  onTypeChange: (type: string) => void;
  onBrandChange: (brand: string) => void;
  onReset: () => void;
}

const WaterSourceFilters: React.FC<WaterSourceFiltersProps> = ({
  selectedType,
  selectedBrand,
  onTypeChange,
  onBrandChange,
  onReset
}) => {
  const { t } = useLanguage();
  const stats = getSourcesStatistics();

  const filterOptions = [
    {
      id: 'all',
      label: t('comp.waterSourceFilters.allSources'),
      count: stats.total,
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    {
      id: 'source',
      label: t('comp.waterSourceFilters.springWater'),
      count: stats.byType['Eau de source'],
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'minerale',
      label: t('comp.waterSourceFilters.mineralWater'),
      count: stats.byType['Eau minérale naturelle'],
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'gazeuse',
      label: t('comp.waterSourceFilters.sparklingWater'),
      count: stats.byType['Eau minérale naturelle gazeuse'],
      color: 'bg-amber-100 text-amber-800 border-amber-200'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('comp.waterSourceFilters.title')}
          </CardTitle>
          {(selectedType !== 'all' || selectedBrand !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t('comp.waterSourceFilters.reset')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2">{t('comp.waterSourceFilters.waterType')}</h4>
            <div className="grid grid-cols-1 gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={selectedType === option.id ? "default" : "outline"}
                  className="justify-between h-auto p-3"
                  onClick={() => onTypeChange(option.id)}
                >
                  <span className="text-left">
                    {option.label}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className={selectedType === option.id ? "bg-white/20 text-white" : option.color}
                  >
                    {option.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('comp.waterSourceFilters.brand')}</h4>
            <Select value={selectedBrand} onValueChange={onBrandChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('comp.waterSourceFilters.allBrands')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('comp.waterSourceFilters.allBrands')}</SelectItem>
                {bottledWaters
                  .filter(water => water.id && water.id.trim() !== '')
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((water) => (
                    <SelectItem key={water.id} value={water.id}>
                      {water.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default WaterSourceFilters;
