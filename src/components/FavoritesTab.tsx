
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
        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-lg text-gray-500 mb-2">Aucune bouteille en favori pour le moment.</p>
        <p className="text-sm text-gray-400">
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
