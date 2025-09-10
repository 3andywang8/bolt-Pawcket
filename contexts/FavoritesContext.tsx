import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

// 收藏項目介面
export interface FavoriteItem {
  id: string;
  animalId: string;
  animalName: string;
  animalType: 'cat' | 'dog';
  animalImage: string;
  animalBreed: string;
  animalAge: string;
  shelter: string;
  location: string;
  personality: string[];
  addedDate: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (animal: Omit<FavoriteItem, 'id' | 'addedDate'>) => void;
  removeFromFavorites: (animalId: string) => void;
  isFavorite: (animalId: string) => boolean;
  getFavoriteById: (animalId: string) => FavoriteItem | undefined;
  clearAllFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const addToFavorites = useCallback((animalData: Omit<FavoriteItem, 'id' | 'addedDate'>) => {
    setFavorites(prev => {
      // 檢查是否已經收藏
      if (prev.some(fav => fav.animalId === animalData.animalId)) {
        return prev;
      }

      const newFavorite: FavoriteItem = {
        ...animalData,
        id: Date.now().toString(),
        addedDate: new Date().toLocaleDateString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
      };

      return [newFavorite, ...prev];
    });
  }, []);

  const removeFromFavorites = useCallback((animalId: string) => {
    setFavorites(prev => prev.filter(fav => fav.animalId !== animalId));
  }, []);

  const isFavorite = useCallback((animalId: string) => {
    return favorites.some(fav => fav.animalId === animalId);
  }, [favorites]);

  const getFavoriteById = useCallback((animalId: string) => {
    return favorites.find(fav => fav.animalId === animalId);
  }, [favorites]);

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const value: FavoritesContextType = useMemo(() => ({
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoriteById,
    clearAllFavorites,
  }), [
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoriteById,
    clearAllFavorites,
  ]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};