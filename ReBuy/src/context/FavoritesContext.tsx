import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type FavoritesContextValue = {
  ids: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

// Saved listings, kept in memory until there's an API for them.
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      ids,
      isFavorite: productId => ids.includes(productId),
      toggleFavorite: productId =>
        setIds(current =>
          current.includes(productId)
            ? current.filter(id => id !== productId)
            : [...current, productId],
        ),
    }),
    [ids],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used inside FavoritesProvider');
  }
  return context;
}
