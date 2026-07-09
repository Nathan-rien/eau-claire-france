
import React from 'react';
import { Star } from 'lucide-react';
import type { BottleWaterData } from '@/types/bottleTypes';
import { WaterData } from '@/data/bottleWaterData';
import BottleComparisonTable from './BottleComparisonTable';
import { convertWaterDataToBottleWaterData } from '@/utils/conversionUtils';

interface FavoritesTabProps {
  favorites: WaterData[];
  onToggleFavorite: (bottle: BottleWaterData) => void;
  onRemoveFavorite: (bottleId: number) => void;
  isFavorite: (bottleId: number) => boolean;
}

const FavoritesTab: React.FC<FavoritesTabProps> = ({
  favorites,
  onToggleFavorite,
  onRemoveFavorite,
  isFavorite
}) => {
  const favoritesAsBottleWaterData = favorites.map(convertWaterDataToBottleWaterData);

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
        <p className="text-lg text-foreground mb-2">Aucune bouteille en favori pour le moment.</p>
        <p className="text-sm text-muted-foreground">
          Ajoutez des bouteilles en favoris depuis l'onglet Comparaison.
        </p>
      </div>
    );
  }

  return (
    <BottleComparisonTable
      selectedBottles={favoritesAsBottleWaterData}
      showTapWater={false}
      onToggleFavorite={onToggleFavorite}
      onRemoveFavorite={onRemoveFavorite}
      isFavorite={isFavorite}
      showFavoriteControls={true}
    />
  );
};

export default FavoritesTab;
