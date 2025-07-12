
import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BottleWaterData, getUniqueBottles } from '@/data/bottleComparisonData';

interface BottleSelectorV2Props {
  selectedBottles: BottleWaterData[];
  onBottleAdd: (bottle: BottleWaterData) => void;
  onBottleRemove: (bottleId: number) => void;
}

const BottleSelectorV2: React.FC<BottleSelectorV2Props> = ({
  selectedBottles,
  onBottleAdd,
  onBottleRemove
}) => {
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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Search className="w-5 h-5" />
          <span>Sélectionner des bouteilles à comparer (max 3)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bouteilles sélectionnées */}
        {selectedBottles.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Bouteilles sélectionnées:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedBottles.map(bottle => (
                <Badge key={bottle.id} variant="secondary" className="flex items-center space-x-1 py-1">
                  <span className="text-xs">{bottle.marque === bottle.nom_bouteille ? bottle.marque : `${bottle.marque} ${bottle.nom_bouteille}`}</span>
                  <button
                    onClick={() => onBottleRemove(bottle.id)}
                    className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filtres et recherche - Version compacte */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Type d'eau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="plate">Eau plate</SelectItem>
                <SelectItem value="gazeuse">Eau gazeuse</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={ecoFilter} onValueChange={setEcoFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Éco-score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les scores</SelectItem>
                <SelectItem value="A">A - Excellent</SelectItem>
                <SelectItem value="B">B - Très bon</SelectItem>
                <SelectItem value="C">C - Bon</SelectItem>
                <SelectItem value="D">D - Moyen</SelectItem>
                <SelectItem value="E">E - Mauvais</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Liste des bouteilles disponibles - Version optimisée */}
        <div className="max-h-48 lg:max-h-64 overflow-y-auto border rounded-lg">
          <div className="divide-y">
            {filteredBottles.map(bottle => (
              <div
                key={bottle.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => selectedBottles.length < 3 && onBottleAdd(bottle)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {bottle.marque === bottle.nom_bouteille ? bottle.marque : `${bottle.marque} - ${bottle.nom_bouteille}`}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {bottle.type_eau} • {bottle.format}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {bottle.prix_moyen_litre.toFixed(2)}€/L
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-1 py-0 ${
                        bottle.ecoscore === 'A' ? 'bg-green-100 text-green-800' :
                        bottle.ecoscore === 'B' ? 'bg-blue-100 text-blue-800' :
                        bottle.ecoscore === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        bottle.ecoscore === 'D' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {bottle.ecoscore}
                    </Badge>
                  </div>
                </div>
                {selectedBottles.length < 3 && (
                  <Button size="sm" variant="outline" className="ml-2 h-8 px-3 text-xs">
                    Ajouter
                  </Button>
                )}
              </div>
            ))}
          </div>
          {filteredBottles.length === 0 && (
            <div className="text-center py-6 text-gray-500 text-sm">
              Aucune bouteille trouvée
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BottleSelectorV2;
