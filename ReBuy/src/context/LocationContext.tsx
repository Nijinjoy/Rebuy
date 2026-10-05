import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';
import { useSessionState } from './useSessionState';
import { Area, DEFAULT_AREA } from '../data/areas';
import { getCurrentArea } from '../utils/currentLocation';

type LocationContextValue = {
  // The area used for Nearby listings.
  area: Area;
  // True once the user has a real area this session (GPS or picked),
  // rather than the default.
  located: boolean;
  // True while a GPS lookup is running.
  locating: boolean;
  // Picks an area by hand.
  setArea: (area: Area) => void;
  // Looks up the current GPS position and uses it. Throws LocationError.
  locateMe: () => Promise<void>;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [area, setAreaState] = useSessionState<Area>(DEFAULT_AREA);
  const [located, setLocated] = useSessionState(false);
  const [locating, setLocating] = useSessionState(false);
  // Shares one lookup between callers that ask at the same time.
  const pending = useRef<Promise<void> | null>(null);

  const setArea = useCallback(
    (next: Area) => {
      setAreaState(next);
      setLocated(true);
    },
    [setAreaState, setLocated],
  );

  const locateMe = useCallback(() => {
    if (!pending.current) {
      setLocating(true);
      pending.current = getCurrentArea()
        .then(setArea)
        .finally(() => {
          pending.current = null;
          setLocating(false);
        });
    }
    return pending.current;
  }, [setArea, setLocating]);

  const value = useMemo<LocationContextValue>(
    () => ({ area, located, locating, setArea, locateMe }),
    [area, located, locating, setArea, locateMe],
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
