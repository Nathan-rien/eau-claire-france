
import React, { useState } from 'react';
import { Droplets, Euro, Leaf, TrendingUp, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BottleComparison = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>('cristaline');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Données réelles des eaux en bouteille issues du CSV
  const bottledWaters = [
    {
      id: 'cristaline',
      name: 'Cristaline',
      type: 'Eau de source',
      source: 'Diverses (multi-sources régionales)',
      price: 0.2,
      co2: 0.25,
      composition: {
        nitrates: 6.8,
        sodium: 5.1,
        calcium: 90.0,
        magnesium: 7.0,
        residusSec: 330
      },
      producer: 'Sources Alma',
      packaging: 'Plastique'
    },
    {
      id: 'evian',
      name: 'Evian',
      type: 'Eau minérale naturelle',
      source: 'Évian-les-Bains (Haute-Savoie)',
      price: 0.65,
      co2: 0.35,
      composition: {
        nitrates: 3.8,
        sodium: 6.5,
        calcium: 80.0,
        magnesium: 26.0,
        residusSec: 345
      },
      producer: 'Danone',
      packaging: 'Plastique / Verre'
    },
    {
      id: 'vittel',
      name: 'Vittel',
      type: 'Eau minérale naturelle',
      source: 'Vittel (Vosges)',
      price: 0.55,
      co2: 0.32,
      composition: {
        nitrates: 4.2,
        sodium: 8.4,
        calcium: 240.0,
        magnesium: 42.0,
        residusSec: 900
      },
      producer: 'Nestlé Waters',
      packaging: 'Plastique / Verre'
    },
    {
      id: 'volvic',
      name: 'Volvic',
      type: 'Eau minérale naturelle',
      source: 'Volvic (Puy-de-Dôme)',
      price: 0.6,
      co2: 0.3,
      composition: {
        nitrates: 7.0,
        sodium: 11.6,
        calcium: 12.0,
        magnesium: 8.0,
        residusSec: 130
      },
      producer: 'Danone',
      packaging: 'Plastique'
    },
    {
      id: 'contrex',
      name: 'Contrex',
      type: 'Eau minérale naturelle',
      source: 'Contrexéville (Vosges)',
      price: 0.75,
      co2: 0.38,
      composition: {
        nitrates: 0.7,
        sodium: 9.4,
        calcium: 468.0,
        magnesium: 74.5,
        residusSec: 2078
      },
      producer: 'Nestlé Waters',
      packaging: 'Plastique'
    },
    {
      id: 'hepar',
      name: 'Hépar',
      type: 'Eau minérale naturelle',
      source: 'Vittel (Vosges)',
      price: 0.7,
      co2: 0.4,
      composition: {
        nitrates: 2.6,
        sodium: 10.0,
        calcium: 549.0,
        magnesium: 119.0,
        residusSec: 2510
      },
      producer: 'Nestlé Waters',
      packaging: 'Plastique'
    },
    {
      id: 'st-yorre',
      name: 'St-Yorre',
      type: 'Eau minérale naturelle gazeuse',
      source: 'Saint-Yorre (Allier)',
      price: 0.55,
      co2: 0.33,
      composition: {
        nitrates: 0.3,
        sodium: 1700.0,
        calcium: 160.0,
        magnesium: 80.0,
        residusSec: 4774
      },
      producer: 'Neptune',
      packaging: 'Plastique'
    },
    {
      id: 'quezac',
      name: 'Quézac',
      type: 'Eau minérale naturelle gazeuse',
      source: 'Quézac (Lozère)',
      price: 0.6,
      co2: 0.35,
      composition: {
        nitrates: 0.2,
        sodium: 100.0,
        calcium: 90.0,
        magnesium: 15.0,
        residusSec: 1100
      },
      producer: 'Ogeu',
      packaging: 'Verre / Plastique'
    },
    {
      id: 'la-salvetat',
      name: 'La Salvetat',
      type: 'Eau minérale naturelle gazeuse',
      source: 'La Salvetat-sur-Agout (Hérault)',
      price: 0.5,
      co2: 0.28,
      composition: {
        nitrates: 0.6,
        sodium: 10.0,
        calcium: 50.0,
        magnesium: 10.0,
        residusSec: 400
      },
      producer: 'Nestlé Waters',
      packaging: 'Plastique'
    },
    {
      id: 'chateldon',
      name: 'Chateldon',
      type: 'Eau minérale naturelle gazeuse',
      source: 'Chateldon (Puy-de-Dôme)',
      price: 1.5,
      co2: 0.45,
      composition: {
        nitrates: 0.5,
        sodium: 150.0,
        calcium: 150.0,
        magnesium: 20.0,
        residusSec: 2000
      },
      producer: 'Société des Eaux de Chateldon',
      packaging: 'Verre'
    },
    {
      id: 'mont-roucous',
      name: 'Mont Roucous',
      type: 'Eau minérale naturelle',
      source: 'Lacaune (Tarn)',
      price: 0.5,
      co2: 0.26,
      composition: {
        nitrates: 1.2,
        sodium: 3.1,
        calcium: 2.5,
        magnesium: 0.9,
        residusSec: 22
      },
      producer: 'Sources Mont Roucous',
      packaging: 'Plastique'
    },
    {
      id: 'thonon',
      name: 'Thonon',
      type: 'Eau minérale naturelle',
      source: 'Thonon-les-Bains (Haute-Savoie)',
      price: 0.45,
      co2: 0.27,
      composition: {
        nitrates: 2.1,
        sodium: 5.0,
        calcium: 60.0,
        magnesium: 5.0,
        residusSec: 300
      },
      producer: 'Neptune',
      packaging: 'Plastique'
    }
  ];

  // Données de l'eau du robinet pour comparaison
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

  // Filtrer les eaux selon la recherche
  const filteredWaters = bottledWaters.filter(water =>
    water.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    water.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    water.producer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <div>Source: {selectedWater.source}</div>
                <div>Producteur: {selectedWater.producer}</div>
                <div>Conditionnement: {selectedWater.packaging}</div>
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
                  <div className="flex justify-between">
                    <span>Résidus secs:</span>
                    <span className="font-medium">{selectedWater.composition.residusSec}</span>
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
