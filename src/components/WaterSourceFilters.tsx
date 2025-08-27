import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSourcesStatistics } from '@/data/waterSources';
import { bottledWaters } from '@/data/bottleWaterData';

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
  const stats = getSourcesStatistics();

  const filterOptions = [
    {
      id: 'all',
      label: 'Toutes les sources',
      count: stats.total,
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    {
      id: 'source',
      label: 'Eau de source',
      count: stats.byType['Eau de source'],
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'minerale',
      label: 'Eau minérale naturelle',
      count: stats.byType['Eau minérale naturelle'],
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'gazeuse',
      label: 'Eau minérale gazeuse',
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
            Filtres
          </CardTitle>
          {(selectedType !== 'all' || selectedBrand !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2">Type d'eau</h4>
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

          {/* Sélection par marque */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Marque d'eau</h4>
            <Select value={selectedBrand} onValueChange={onBrandChange}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les marques" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les marques</SelectItem>
                {bottledWaters
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((water) => (
                    <SelectItem key={water.id} value={water.id}>
                      {water.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Répartition par région */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Répartition par région</h4>
            <div className="space-y-1">
              {Object.entries(stats.byRegion)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([region, count]) => (
                  <div key={region} className="flex justify-between text-xs">
                    <span className="truncate">{region}</span>
                    <Badge variant="outline" className="ml-2">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterSourceFilters;