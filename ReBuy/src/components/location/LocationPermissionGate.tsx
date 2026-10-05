import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import {
  checkLocationStatus,
  LocationStatus,
  openLocationSettings,
  requestLocationPermission,
} from '../../utils/locationPermission';
import LocationPermissionModal from './LocationPermissionModal';

type Props = {
  // False while something (e.g. the splash) covers the app.
  enabled: boolean;
};

// Checks location once the user reaches the app. If it works, fetches the
// user's area straight away; if it's off or not allowed, asks them to turn
// it on and fetches as soon as they do (from the modal, Settings or the
// quick settings panel). "Not now" hides the modal until the next launch.
function LocationPermissionGate({ enabled }: Props) {
  const { isSignedIn, isGuest } = useAuth();
  const { locateMe } = useLocation();
  // The last problem found; kept while the modal fades out after a fix.
  const [status, setStatus] =
    useState<Exclude<LocationStatus, 'granted'>>('denied');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const dismissed = useRef(false);
  // Refs so the AppState listener sees current values.
  const lastStatus = useRef<LocationStatus | null>(null);
  const checking = useRef(false);
  const busyRef = useRef(false);

  const inApp = enabled && (isSignedIn || isGuest);

  const apply = useCallback(
    (next: LocationStatus) => {
      const becameAvailable =
        next === 'granted' && lastStatus.current !== 'granted';
      lastStatus.current = next;

      if (next === 'granted') {
        setVisible(false);
        if (becameAvailable) {
          // Errors here (e.g. no GPS fix yet) leave the header's
          // "Set your location" for the user to tap.
          locateMe().catch(() => {});
        }
        return;
      }
      setStatus(next);
      if (!dismissed.current) {
        setVisible(true);
      }
    },
    [locateMe],
  );

  const refresh = useCallback(async () => {
    if (checking.current) {
      return;
    }
    checking.current = true;
    try {
      apply(await checkLocationStatus());
    } catch {
      // Can't tell; don't nag.
    } finally {
      checking.current = false;
    }
  }, [apply]);

  // Check when the user first lands in the app.
  useEffect(() => {
    if (inApp) {
      refresh();
    } else {
      // Signing out resets the area, so fetch again on the next sign-in.
      lastStatus.current = null;
    }
  }, [inApp, refresh]);

  // Re-check when the user comes back from Settings, or (Android) closes
  // the quick settings panel, while location still isn't working.
  useEffect(() => {
    if (!inApp) {
      return;
    }
    const recheck = () => {
      if (lastStatus.current !== 'granted' && !busyRef.current) {
        refresh();
      }
    };
    const subscriptions = [
      AppState.addEventListener('change', state => {
        if (state === 'active') {
          recheck();
        }
      }),
    ];
    // The 'focus' event only exists on Android; subscribing on iOS throws.
    if (Platform.OS === 'android') {
      subscriptions.push(AppState.addEventListener('focus', recheck));
    }
    return () => subscriptions.forEach(s => s.remove());
  }, [inApp, refresh]);

  const setBusyState = (next: boolean) => {
    busyRef.current = next;
    setBusy(next);
  };

  const handleEnable = async () => {
    if (status === 'denied') {
      setBusyState(true);
      try {
        apply(await requestLocationPermission());
      } catch {
        // Leave the modal as it is.
      } finally {
        setBusyState(false);
      }
      return;
    }
    openLocationSettings(status).catch(() => {});
  };

  const handleDismiss = () => {
    dismissed.current = true;
    setVisible(false);
  };

  return (
    <LocationPermissionModal
      visible={visible && inApp}
      status={status}
      busy={busy}
      onEnable={handleEnable}
      onDismiss={handleDismiss}
    />
  );
}

export default LocationPermissionGate;
