
import { useState, useEffect } from 'react';
import { BottleWaterData } from '@/data/bottleComparisonData';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<BottleWaterData[]>([]);

  // Charger les favoris depuis localStorage au démarrage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('water-bottle-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      }
    }
  }, []);

  // Sauvegarder les favoris dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('water-bottle-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (bottle: BottleWaterData) => {
    setFavorites(prev => {
      const isAlreadyFavorite = prev.some(fav => fav.id === bottle.id);
      if (!isAlreadyFavorite) {
        return [...prev, bottle];
      }
      return prev;
    });
  };

  const removeFromFavorites = (bottleId: number) => {
    setFavorites(prev => prev.filter(fav => fav.id !== bottleId));
  };

  const isFavorite = (bottleId: number) => {
    return favorites.some(fav => fav.id === bottleId);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  };
};
