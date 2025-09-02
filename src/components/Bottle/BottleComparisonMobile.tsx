import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BottleWaterData, tapWaterComparison } from '@/data/bottleComparisonData';
import { 
  interpretNitrates, 
  interpretCalcium, 
  interpretMagnesium, 
  interpretSodium, 
  interpretPH 
} from '@/utils/nutritionalInterpretation';
import { formatPrice } from '@/utils/conversionUtils';
import BottleCard from './BottleCard';
import type { UseBottleComparisonReturn } from '@/hooks/useBottleComparison';
import { PriceDisplay } from '@/components/PriceDisplay';
import { makeTapPrice } from '@/lib/price';
import { PRICE_INPUTS } from '@/data/prices.example';

interface BottleComparisonMobileProps extends Pick<UseBottleComparisonReturn, 'handleToggleFavorite' | 'getEcoScoreColor' | 'loadingState'> {
  selectedBottles: BottleWaterData[];
  showTapWater: boolean;
  isFavorite?: (bottleId: number) => boolean;
}

const BottleComparisonMobile: React.FC<BottleComparisonMobileProps> = ({
  selectedBottles,
  showTapWater,
  handleToggleFavorite,
  getEcoScoreColor,
  isFavorite,
  loadingState
}) => {
  if (loadingState.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: showTapWater ? 3 : 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 8 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (loadingState.isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-destructive">
          <p>Erreur lors du chargement des données.</p>
          {loadingState.error && (
            <p className="text-sm text-muted-foreground mt-2">
              {loadingState.error.message}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showTapWater && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-800 text-base">
              Eau du robinet (référence)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <strong>Prix :</strong> 
                <div className="ml-1 text-green-700">
                  <PriceDisplay 
                    priceData={makeTapPrice(PRICE_INPUTS.tap!)} 
                    kind="tap" 
                    showMetadata={false}
                  />
                </div>
              </div>
              <div>
                <strong>Nitrates :</strong> 
                <span className={`ml-1 ${interpretNitrates(tapWaterComparison.nitrates_mgL).className}`}>
                  {tapWaterComparison.nitrates_mgL} mg/L {interpretNitrates(tapWaterComparison.nitrates_mgL).label}
                </span>
              </div>
              <div>
                <strong>Calcium :</strong> 
                <span className={`ml-1 ${interpretCalcium(tapWaterComparison.calcium_mgL).className}`}>
                  {tapWaterComparison.calcium_mgL} mg/L {interpretCalcium(tapWaterComparison.calcium_mgL).label}
                </span>
              </div>
              <div>
                <strong>Magnésium :</strong> 
                <span className={`ml-1 ${interpretMagnesium(tapWaterComparison.magnesium_mgL).className}`}>
                  {tapWaterComparison.magnesium_mgL} mg/L {interpretMagnesium(tapWaterComparison.magnesium_mgL).label}
                </span>
              </div>
              <div>
                <strong>Sodium :</strong> 
                <span className={`ml-1 ${interpretSodium(tapWaterComparison.sodium_mgL).className}`}>
                  {tapWaterComparison.sodium_mgL} mg/L {interpretSodium(tapWaterComparison.sodium_mgL).label}
                </span>
              </div>
              <div>
                <strong>pH :</strong> 
                <span className={`ml-1 ${interpretPH(tapWaterComparison.pH).className}`}>
                  {tapWaterComparison.pH} {interpretPH(tapWaterComparison.pH).label}
                </span>
              </div>
              <div>
                <strong>CO₂ :</strong> 
                <span className="ml-1 font-medium text-orange-700">
                  {tapWaterComparison.impact_carbone_gCO2L}g/L
                </span>
              </div>
              <div>
                <strong>Éco-score :</strong> 
                <Badge className={`ml-1 ${getEcoScoreColor(tapWaterComparison.ecoscore)}`}>
                  {tapWaterComparison.ecoscore}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {selectedBottles.map(bottle => (
          <BottleCard
            key={bottle.id}
            bottle={bottle}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite}
            getEcoScoreColor={getEcoScoreColor}
            isLoading={loadingState.isLoading}
          />
        ))}
      </div>
    </div>
  );
};

export default BottleComparisonMobile;