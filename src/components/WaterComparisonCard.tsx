
import React from 'react';
import { Droplets, Euro, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WaterData, TapWaterData } from '@/data/bottleWaterData';

interface WaterComparisonCardProps {
  water: WaterData | TapWaterData;
  isTapWater?: boolean;
  selectedWater?: WaterData;
}

const WaterComparisonCard: React.FC<WaterComparisonCardProps> = ({
  water,
  isTapWater = false,
  selectedWater
}) => {
  const cardClass = isTapWater 
    ? "border-2 border-blue-200 bg-blue-50" 
    : "border-2 border-orange-200 bg-orange-50";
  
  const iconColor = isTapWater ? "text-blue-500" : "text-orange-500";
  const priceColor = isTapWater ? "text-green-600" : "text-orange-600";

  return (
    <Card className={cardClass}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Droplets className={`w-5 h-5 md:w-6 md:h-6 ${iconColor}`} />
            <span className="text-sm md:text-base">{water.name}</span>
          </div>
          {isTapWater ? (
            <Badge className="bg-green-500 text-white text-xs">Recommandée</Badge>
          ) : (
            <Badge variant="outline" className="text-xs">{(water as WaterData).type}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isTapWater && selectedWater && (
            <div className="text-xs md:text-sm text-gray-600 mb-2 space-y-1">
              <div>Source: {selectedWater.source}</div>
              <div>Producteur: {selectedWater.producer}</div>
              <div>Conditionnement: {selectedWater.packaging}</div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <div className="text-center p-2 md:p-3 bg-white rounded-lg">
              <Euro className={`w-6 h-6 md:w-8 md:h-8 ${iconColor} mx-auto mb-2`} />
              <p className={`text-lg md:text-2xl font-bold ${priceColor}`}>
                {isTapWater ? water.price.toFixed(3) : water.price.toFixed(2)}€
              </p>
              <p className="text-xs md:text-sm text-gray-600">par litre</p>
            </div>
            <div className="text-center p-2 md:p-3 bg-white rounded-lg">
              <Leaf className={`w-6 h-6 md:w-8 md:h-8 ${iconColor} mx-auto mb-2`} />
              <p className={`text-lg md:text-2xl font-bold ${priceColor}`}>
                {isTapWater ? water.co2.toFixed(3) : water.co2.toFixed(2)}
              </p>
              <p className="text-xs md:text-sm text-gray-600">kg CO₂/L</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 md:p-4">
            <h4 className="font-medium mb-3 text-sm md:text-base">Composition (mg/L)</h4>
            <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
              <div className="flex justify-between">
                <span>Nitrates:</span>
                <span className="font-medium">{water.composition.nitrates}</span>
              </div>
              <div className="flex justify-between">
                <span>Sodium:</span>
                <span className="font-medium">{water.composition.sodium}</span>
              </div>
              <div className="flex justify-between">
                <span>Calcium:</span>
                <span className="font-medium">{water.composition.calcium}</span>
              </div>
              <div className="flex justify-between">
                <span>Magnésium:</span>
                <span className="font-medium">{water.composition.magnesium}</span>
              </div>
              {!isTapWater && (
                <div className="flex justify-between col-span-2">
                  <span>Résidus secs:</span>
                  <span className="font-medium">{water.composition.residusSec}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterComparisonCard;
