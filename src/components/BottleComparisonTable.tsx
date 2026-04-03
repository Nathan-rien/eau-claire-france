import React from 'react';
import { Droplets } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { BottleWaterData } from '@/types/bottleTypes';
import { useBottleComparison } from '@/hooks/useBottleComparison';
import BottleComparisonDesktop from './Bottle/BottleComparisonDesktop';
import BottleComparisonMobile from './Bottle/BottleComparisonMobile';
import type { BottleComparisonProps } from '@/types/bottle';

// Re-export types for backwards compatibility
export type { BottleComparisonProps as BottleComparisonTableProps };

const BottleComparisonTable: React.FC<BottleComparisonProps> = ({
  selectedBottles,
  showTapWater,
  onToggleFavorite,
  onRemoveFavorite,
  isFavorite,
  showFavoriteControls = false
}) => {
  const {
    allItems,
    isEmpty,
    handleToggleFavorite,
    getEcoScoreColor,
    loadingState
  } = useBottleComparison({
    selectedBottles: [...selectedBottles], // Convert readonly to mutable
    showTapWater,
    onToggleFavorite,
    onRemoveFavorite,
    isFavorite
  });

  if (isEmpty) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Droplets className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">Aucune bouteille sélectionnée</h3>
          <p>Sélectionnez jusqu'à 3 bouteilles pour commencer la comparaison</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop view */}
      <div className="hidden lg:block">
        <BottleComparisonDesktop
          selectedBottles={[...selectedBottles]}
          showTapWater={showTapWater}
          allItems={allItems}
          handleToggleFavorite={handleToggleFavorite}
          getEcoScoreColor={getEcoScoreColor}
          isFavorite={isFavorite}
          loadingState={loadingState}
        />
      </div>

      {/* Mobile view */}
      <div className="lg:hidden">
        <BottleComparisonMobile
          selectedBottles={[...selectedBottles]}
          showTapWater={showTapWater}
          handleToggleFavorite={handleToggleFavorite}
          getEcoScoreColor={getEcoScoreColor}
          isFavorite={isFavorite}
          loadingState={loadingState}
        />
      </div>
    </div>
  );
};

export default BottleComparisonTable;