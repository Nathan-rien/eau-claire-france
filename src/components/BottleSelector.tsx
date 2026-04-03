
import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BottleWaterData, getUniqueBottles } from '@/data/bottleComparisonData';
import { usePrices } from '@/hooks/usePrices';
import { useLanguage } from '@/contexts/LanguageContext';

interface BottleSelectorProps {
  selectedBottles: BottleWaterData[];
  onBottleAdd: (bottle: BottleWaterData) => void;
  onBottleRemove: (bottleId: number) => void;
}

const BottleSelector: React.FC<BottleSelectorProps> = ({
  selectedBottles,
  onBottleAdd,
  onBottleRemove
}) => {
  const { t } = useLanguage();
  const { bottle: bottlePrice } = usePrices();
  const fmt = (v: number) => (v < 0.01 ? v.toFixed(3) : v.toFixed(2)).replace(".", ",") + " €/L";
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [ecoFilter, setEcoFilter] = useState('all');
  
  const uniqueBottles = getUniqueBottles();
  
  const filteredBottles = uniqueBottles.filter(bottle => {
    const matchesSearch = bottle.marque.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bottle.nom_bouteille.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bottle.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || 
                       (typeFilter === 'plate' && !bottle.type_eau.toLowerCase().includes('gazeuse')) ||
                       (typeFilter === 'gazeuse' && bottle.type_eau.toLowerCase().includes('gazeuse'));
    
    const matchesEco = ecoFilter === 'all' || bottle.ecoscore === ecoFilter;
    
    const notSelected = !selectedBottles.find(b => b.id === bottle.id);
    
    return matchesSearch && matchesType && matchesEco && notSelected;
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-5 h-5" />
          <span>{t('comp.bottleSelector.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedBottles.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">{t('comp.bottleSelector.selected')}</h3>
            <div className="flex flex-wrap gap-2">
              {selectedBottles.map(bottle => (
                <Badge key={bottle.id} variant="secondary" className="flex items-center space-x-1">
                  <span>{bottle.marque === bottle.nom_bouteille ? bottle.marque : `${bottle.marque} ${bottle.nom_bouteille}`}</span>
                  <button
                    onClick={() => onBottleRemove(bottle.id)}
                    className="ml-1 hover:bg-red-100 rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('comp.bottleSelector.search')}</label>
            <Input
              placeholder={t('comp.bottleSelector.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 text-base"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('comp.bottleSelector.waterType')}</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('comp.bottleSelector.allTypes')}</SelectItem>
                  <SelectItem value="plate">{t('comp.bottleSelector.still')}</SelectItem>
                  <SelectItem value="gazeuse">{t('comp.bottleSelector.sparkling')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('comp.bottleSelector.ecoScore')}</label>
              <Select value={ecoFilter} onValueChange={setEcoFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('comp.bottleSelector.allScores')}</SelectItem>
                  <SelectItem value="A">{t('comp.bottleSelector.ecoScoreA')}</SelectItem>
                  <SelectItem value="B">{t('comp.bottleSelector.ecoScoreB')}</SelectItem>
                  <SelectItem value="C">{t('comp.bottleSelector.ecoScoreC')}</SelectItem>
                  <SelectItem value="D">{t('comp.bottleSelector.ecoScoreD')}</SelectItem>
                  <SelectItem value="E">{t('comp.bottleSelector.ecoScoreE')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto">
          <div className="grid grid-cols-1 gap-2">
            {filteredBottles.map(bottle => (
              <div
                key={bottle.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => selectedBottles.length < 3 && onBottleAdd(bottle)}
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {bottle.marque === bottle.nom_bouteille ? bottle.marque : `${bottle.marque} - ${bottle.nom_bouteille}`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {bottle.type_eau} • {bottle.format} • {bottle.source}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {fmt(bottlePrice.value)}
                      </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        bottle.ecoscore === 'A' ? 'bg-green-100 text-green-800' :
                        bottle.ecoscore === 'B' ? 'bg-blue-100 text-blue-800' :
                        bottle.ecoscore === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        bottle.ecoscore === 'D' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      Éco: {bottle.ecoscore}
                    </Badge>
                  </div>
                </div>
                {selectedBottles.length < 3 && (
                  <Button size="sm" variant="outline">
                    {t('comp.bottleSelector.add')}
                  </Button>
                )}
              </div>
            ))}
          </div>
          {filteredBottles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t('comp.bottleSelector.noResults')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BottleSelector;
