import React from 'react';
import { Droplets } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { BottleWaterData } from '@/types/bottleTypes';
import { useBottleComparison } from '@/hooks/useBottleComparison';
import BottleComparisonDesktop from './Bottle/BottleComparisonDesktop';
import BottleComparisonMobile from './Bottle/BottleComparisonMobile';
import type { BottleComparisonProps } from '@/types/bottle';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
  const {
    allItems,
    isEmpty,
    handleToggleFavorite,
    getEcoScoreColor,
    loadingState
  } = useBottleComparison({
    selectedBottles: [...selectedBottles],
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
          <h3 className="text-lg font-medium mb-2">{t('comp.bottleComparison.noSelection')}</h3>
          <p>{t('comp.bottleComparison.noSelectionDesc')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
