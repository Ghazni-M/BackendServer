import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/auth/me');
        setIsLoggedIn(true);
        const ids = await api.get('/favorites/ids');
        setFavorites(ids);
      } catch (err) {
        setIsLoggedIn(false);
        const stored = localStorage.getItem('ritchie_favorites');
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      }
    };
    checkAuth();
  }, []);

  const toggleFavorite = async (propertyId: number) => {
    const isLiked = favorites.includes(propertyId);
    let newFavorites: number[];

    if (isLiked) {
      newFavorites = favorites.filter(id => id !== propertyId);
      if (isLoggedIn) {
        try {
          await api.delete(`/favorites/${propertyId}`);
        } catch (err) {
          console.error('Failed to remove favorite', err);
        }
      }
    } else {
      newFavorites = [...favorites, propertyId];
      if (isLoggedIn) {
        try {
          await api.post(`/favorites/${propertyId}`, {});
        } catch (err) {
          console.error('Failed to add favorite', err);
        }
      }
    }

    setFavorites(newFavorites);
    if (!isLoggedIn) {
      localStorage.setItem('ritchie_favorites', JSON.stringify(newFavorites));
    }
  };

  const isFavorite = (propertyId: number) => favorites.includes(propertyId);

  return { favorites, toggleFavorite, isFavorite };
};
