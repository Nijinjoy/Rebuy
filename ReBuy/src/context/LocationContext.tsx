import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useSessionState } from './useSessionState';
import { Area, DEFAULT_AREA } from '../data/areas';

type LocationContextValue = {
  // The area used for Nearby listings.
  area: Area;
  setArea: (area: Area) => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

// Picked by hand from AREAS until the app uses GPS.
export function LocationProvider({ children }: { children: ReactNode }) {
  const [area, setArea] = useSessionState<Area>(DEFAULT_AREA);

  const value = useMemo<LocationContextValue>(
    () => ({ area, setArea }),
    [area, setArea],
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used inside LocationProvider');
  }
  return context;
}
