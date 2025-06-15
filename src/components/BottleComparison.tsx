
import React, { useState } from 'react';
import { Droplets, Euro, Leaf, TrendingUp, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BottleComparison = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>('evian');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mock data for bottled water brands
  const bottledWaters = [
    {
      id: 'evian',
      name: 'Evian',
      type: 'Eau minérale naturelle',
      source: 'Évian-les-Bains (74)',
      price: 0.45,
      co2: 0.35,
      composition: {
        nitrates: 3.8,
        sodium: 6.5,
        calcium: 80,
        magnesium: 26,
        residusSec: 309
      }
    },
    {
      id: 'vittel',
      name: 'Vittel',
      type: 'Eau minérale naturelle',
      source: 'Vittel (88)',
      price: 0.42,
      co2: 0.32,
      composition: {
        nitrates: 4.4,
        sodium: 7.3,
        calcium: 94,
        magnesium: 20,
        residusSec: 841
      }
    },
    {
      id: 'cristaline',
      name: 'Cristaline',
      type: 'Eau de source',
      source: 'Multiples sources',
      price: 0.25,
      co2: 0.28,
      composition: {
        nitrates: 2.1,
        sodium: 11.2,
        calcium: 68,
        magnesium: 18,
        residusSec: 285
      }
    },
    {
      id: 'contrex',
      name: 'Contrex',
      type: 'Eau minérale naturelle',
      source: 'Contrexéville (88)',
      price: 0.55,
      co2: 0.38,
      composition: {
        nitrates: 2.7,
        sodium: 9.1,
        calcium: 486,
        magnesium: 84,
        residusSec: 2078
      }
    }
  ];

  // Mock tap water data for comparison
  const tapWater = {
    name: 'Eau du robinet (Paris)',
    price: 0.004,
    co2: 0.001,
    composition: {
      nitrates: 12,
      sodium: 15,
      calcium: 90,
      magnesium: 8,
      residusSec: 280
    }
  };

  const selectedWater = bottledWaters.find(w => w.id === selectedBrand) || bottledWaters[0];

  const calculateAnnualCost = (pricePerLiter: number) => {
    const dailyConsumption = 1.5; // litres per day
    const annualConsumption = dailyConsumption * 365;
    return annualConsumption * pricePerLiter;
  };

  const calculateAnnualCO2 = (co2PerLiter: number) => {
    const dailyConsumption = 1.5;
    const annualConsumption = dailyConsumption * 365;
    return annualConsumption * co2PerLiter;
  };

  return (
    <div className="space-y-6">
      {/* Brand Selection */}
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
                  {bottledWaters.map(water => (
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

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tap Water Card */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Droplets className="w-6 h-6 text-blue-500" />
                <span>Eau du robinet</span>
              </div>
              <Badge className="bg-green-500 text-white">Recommandée</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <Euro className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {tapWater.price.toFixed(3)}€
                  </p>
                  <p className="text-sm text-gray-600">par litre</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <Leaf className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {tapWater.co2.toFixed(3)}
                  </p>
                  <p className="text-sm text-gray-600">kg CO₂/L</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium mb-3">Composition (mg/L)</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Nitrates:</span>
                    <span className="font-medium">{tapWater.composition.nitrates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sodium:</span>
                    <span className="font-medium">{tapWater.composition.sodium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calcium:</span>
                    <span className="font-medium">{tapWater.composition.calcium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Magnésium:</span>
                    <span className="font-medium">{tapWater.composition.magnesium}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottled Water Card */}
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Droplets className="w-6 h-6 text-orange-500" />
                <span>{selectedWater.name}</span>
              </div>
              <Badge variant="outline">{selectedWater.type}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-2">
                Source: {selectedWater.source}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <Euro className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">
                    {selectedWater.price.toFixed(2)}€
                  </p>
                  <p className="text-sm text-gray-600">par litre</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <Leaf className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">
                    {selectedWater.co2.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">kg CO₂/L</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium mb-3">Composition (mg/L)</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Nitrates:</span>
                    <span className="font-medium">{selectedWater.composition.nitrates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sodium:</span>
                    <span className="font-medium">{selectedWater.composition.sodium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calcium:</span>
                    <span className="font-medium">{selectedWater.composition.calcium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Magnésium:</span>
                    <span className="font-medium">{selectedWater.composition.magnesium}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Annual Impact Comparison */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Impact annuel (consommation 1,5L/jour)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-4">Coût économique</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">Eau du robinet</p>
                  <p className="text-3xl font-bold text-green-600">
                    {calculateAnnualCost(tapWater.price).toFixed(0)}€
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">{selectedWater.name}</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {calculateAnnualCost(selectedWater.price).toFixed(0)}€
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <p className="text-sm font-medium text-red-800">
                    Différence: +{(calculateAnnualCost(selectedWater.price) - calculateAnnualCost(tapWater.price)).toFixed(0)}€/an
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-bold mb-4">Impact environnemental</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">Eau du robinet</p>
                  <p className="text-3xl font-bold text-green-600">
                    {calculateAnnualCO2(tapWater.co2).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">kg CO₂/an</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">{selectedWater.name}</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {calculateAnnualCO2(selectedWater.co2).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">kg CO₂/an</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <p className="text-sm font-medium text-red-800">
                    Différence: +{(calculateAnnualCO2(selectedWater.co2) - calculateAnnualCO2(tapWater.co2)).toFixed(1)} kg CO₂/an
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="font-bold text-lg text-gray-800">
              L'eau du robinet est {Math.round(selectedWater.price / tapWater.price)}x moins chère 
              et {Math.round(selectedWater.co2 / tapWater.co2)}x moins polluante
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BottleComparison;
