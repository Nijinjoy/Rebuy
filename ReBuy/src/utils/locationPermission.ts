import { Linking, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  check,
  checkMultiple,
  openSettings,
  PERMISSIONS,
  request,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';

// - granted: ReBuy can read the location.
// - denied: not asked yet, or declined but can be asked again.
// - blocked: declined for good; only Settings can change it.
// - services_off: the phone's location is switched off.
export type LocationStatus = 'granted' | 'denied' | 'blocked' | 'services_off';

const IOS_PERMISSION = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
// Asking for both lets Android 12+ offer "Precise" and "Approximate".
const ANDROID_PERMISSIONS = [
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
];

type PermissionResult = (typeof RESULTS)[keyof typeof RESULTS];

function fromIosResult(result: PermissionResult): LocationStatus {
  switch (result) {
    case RESULTS.GRANTED:
    case RESULTS.LIMITED:
      return 'granted';
    case RESULTS.BLOCKED:
      return 'blocked';
    // iOS reports this when Location Services is off for the whole phone.
    case RESULTS.UNAVAILABLE:
      return 'services_off';
    default:
      return 'denied';
  }
}

function fromAndroidResults(results: PermissionResult[]): LocationStatus {
  if (results.some(r => r === RESULTS.GRANTED || r === RESULTS.LIMITED)) {
    return 'granted';
  }
  return results.some(r => r === RESULTS.BLOCKED) ? 'blocked' : 'denied';
}

// Android has no direct "is location on" check, but a position request
// fails straight away with POSITION_UNAVAILABLE when it's switched off.
// maximumAge 0 skips the cached last position, which is returned even
// while location is off. A timeout (e.g. no fix indoors) still counts as on.
function androidLocationIsOn() {
  return new Promise<boolean>(resolve => {
    Geolocation.getCurrentPosition(
      () => resolve(true),
      error => resolve(error.code !== error.POSITION_UNAVAILABLE),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 },
    );
  });
}

async function withServicesCheck(status: LocationStatus) {
  if (status === 'granted' && Platform.OS === 'android') {
    return (await androidLocationIsOn()) ? 'granted' : 'services_off';
  }
  return status;
}

// Reads the current state without showing any system prompt.
export async function checkLocationStatus(): Promise<LocationStatus> {
  if (Platform.OS === 'ios') {
    return fromIosResult(await check(IOS_PERMISSION));
  }
  const results = await checkMultiple(ANDROID_PERMISSIONS);
  return withServicesCheck(fromAndroidResults(Object.values(results)));
}

// Shows the system permission prompt (when the OS still allows it).
export async function requestLocationPermission(): Promise<LocationStatus> {
  if (Platform.OS === 'ios') {
    return fromIosResult(await request(IOS_PERMISSION));
  }
  const results = await requestMultiple(ANDROID_PERMISSIONS);
  return withServicesCheck(fromAndroidResults(Object.values(results)));
}

// Opens the screen where the user can fix the given status.
export async function openLocationSettings(status: LocationStatus) {
  if (status === 'services_off' && Platform.OS === 'android') {
    try {
      await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
      return;
    } catch {
      // Fall back to the app's own settings page.
    }
  }
  // iOS doesn't allow linking straight to Location Services.
  await openSettings();
}
