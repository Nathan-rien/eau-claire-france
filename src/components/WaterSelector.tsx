
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
        <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
          <Search className="w-4 h-4 md:w-5 md:h-5" />
          <span>Sélectionnez une eau en bouteille</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Marque</label>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-full h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filteredWaters
                  .filter(water => water.id && water.id.trim() !== '')
                  .map(water => (
                    <SelectItem key={water.id} value={water.id}>
                      <span className="text-base">{water.name} - {water.type}</span>
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
              className="w-full h-12 text-base"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterSelector;
