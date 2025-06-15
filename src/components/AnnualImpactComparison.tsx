
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaterData, TapWaterData } from '@/data/bottleWaterData';

interface AnnualImpactComparisonProps {
  selectedWater: WaterData;
  tapWater: TapWaterData;
}

const AnnualImpactComparison: React.FC<AnnualImpactComparisonProps> = ({
  selectedWater,
  tapWater
}) => {
  const calculateAnnualCost = (pricePerLiter: number) => {
    const dailyConsumption = 1.5;
    const annualConsumption = dailyConsumption * 365;
    return annualConsumption * pricePerLiter;
  };

  const calculateAnnualCO2 = (co2PerLiter: number) => {
    const dailyConsumption = 1.5;
    const annualConsumption = dailyConsumption * 365;
    return annualConsumption * co2PerLiter;
  };

  return (
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
  );
};

export default AnnualImpactComparison;
