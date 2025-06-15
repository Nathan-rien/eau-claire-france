
import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WaterData } from '@/data/bottleWaterData';

interface WaterSelectorProps {
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredWaters: WaterData[];
}

const WaterSelector: React.FC<WaterSelectorProps> = ({
  selectedBrand,
  setSelectedBrand,
  searchQuery,
  setSearchQuery,
  filteredWaters
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-5 h-5" />
          <span>Sélectionnez une eau en bouteille</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Marque</label>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filteredWaters.map(water => (
                  <SelectItem key={water.id} value={water.id}>
                    {water.name} - {water.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Recherche</label>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une marque..."
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterSelector;
