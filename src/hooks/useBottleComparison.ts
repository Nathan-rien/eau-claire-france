import { useState, useCallback, useMemo } from 'react';
import { BottleWaterData, tapWaterComparison } from '@/data/bottleComparisonData';
import { toast } from '@/hooks/use-toast';
import { normalizeBottleName } from '@/utils/conversionUtils';
import type { LoadingState } from '@/types/bottle';

export interface UseBottleComparisonProps {
  selectedBottles: BottleWaterData[];
  showTapWater: boolean;
  onToggleFavorite?: (bottle: BottleWaterData) => void;
  onRemoveFavorite?: (bottleId: number) => void;
  isFavorite?: (bottleId: number) => boolean;
}

export interface UseBottleComparisonReturn {
  allItems: BottleWaterData[];
  isEmpty: boolean;
  handleToggleFavorite: (bottle: BottleWaterData) => void;
  getEcoScoreColor: (score: string) => string;
  loadingState: LoadingState;
  setLoadingState: (state: Partial<LoadingState>) => void;
}

export const useBottleComparison = ({
  selectedBottles,
  showTapWater,
  onToggleFavorite,
  onRemoveFavorite,
  isFavorite
}: UseBottleComparisonProps): UseBottleComparisonReturn => {
  const [loadingState, setLoadingStateInternal] = useState<LoadingState>({
    isLoading: false,
    isError: false,
    error: null
  });

  const setLoadingState = useCallback((state: Partial<LoadingState>) => {
    setLoadingStateInternal(prev => ({ ...prev, ...state }));
  }, []);

  const allItems = useMemo(() => {
    if (showTapWater) {
      // Ensure tapWaterComparison has all required BottleWaterData properties
      const tapWaterWithFullData: BottleWaterData = {
        ...tapWaterComparison,
        id: 0,
        marque: 'Eau du robinet',
        type_eau: 'Eau du robinet',
        format: '∞',
        source: 'Réseau public',
        emballage: 'N/A',
        recyclable: 'N/A',
        consigne: 'N/A',
      };
      return [tapWaterWithFullData, ...selectedBottles];
    }
    return selectedBottles;
  }, [selectedBottles, showTapWater]);

  const isEmpty = selectedBottles.length === 0;

  const getEcoScoreColor = useCallback((score: string): string => {
    const colorMap: Record<string, string> = {
      'A': 'bg-green-100 text-green-800 border-green-200',
      'B': 'bg-blue-100 text-blue-800 border-blue-200',
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'D': 'bg-orange-100 text-orange-800 border-orange-200',
      'E': 'bg-red-100 text-red-800 border-red-200'
    };
    return colorMap[score] || 'bg-gray-100 text-gray-800 border-gray-200';
  }, []);

  const handleToggleFavorite = useCallback((bottle: BottleWaterData) => {
    if (!onToggleFavorite || !isFavorite) return;
    
    const bottleName = normalizeBottleName(bottle.marque, bottle.nom_bouteille);
    
    try {
      if (isFavorite(bottle.id)) {
        if (onRemoveFavorite) {
          onRemoveFavorite(bottle.id);
          toast({
            title: "Retiré des favoris",
            description: `${bottleName} a été retiré de vos favoris.`,
            variant: "default"
          });
        }
      } else {
        onToggleFavorite(bottle);
        toast({
          title: "Ajouté aux favoris",
          description: `${bottleName} a été ajouté à vos favoris.`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification des favoris.",
        variant: "destructive"
      });
    }
  }, [onToggleFavorite, onRemoveFavorite, isFavorite]);

  return {
    allItems,
    isEmpty,
    handleToggleFavorite,
    getEcoScoreColor,
    loadingState,
    setLoadingState
  };
};