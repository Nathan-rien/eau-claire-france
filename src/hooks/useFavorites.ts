
import { useState, useEffect } from 'react';
import { WaterData } from '@/data/bottleWaterData';
import { useSecureStorage } from '@/hooks/useSecureStorage';

export const useFavorites = () => {
  const [favorites, setFavorites] = useSecureStorage<WaterData[]>(
    'water-bottle-favorites',
    [],
    { validateIntegrity: true }
  );

  const addToFavorites = (bottle: WaterData) => {
    const isAlreadyFavorite = favorites.some(fav => fav.id === bottle.id);
    if (!isAlreadyFavorite) {
      setFavorites([...favorites, bottle]);
    }
  };

  const removeFromFavorites = (bottleId: string) => {
    setFavorites(favorites.filter(fav => fav.id !== bottleId));
  };

  const isFavorite = (bottleId: string) => {
    return favorites.some(fav => fav.id === bottleId);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  };
};
