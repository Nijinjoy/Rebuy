import Geolocation, {
  GeolocationError,
} from '@react-native-community/geolocation';
import { GOOGLE_MAPS_API_KEY } from '../config/keys';
import type { Area } from '../data/areas';

// Asks for permission itself the first time (both platforms).
Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  locationProvider: 'auto',
});

// Shown to the user, so keep these plain.
export class LocationError extends Error {}

function getPosition() {
  return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      (error: GeolocationError) =>
        reject(
          new LocationError(
            error.code === error.PERMISSION_DENIED
              ? 'Allow ReBuy to use your location in Settings, then try again.'
              : "We couldn't find your location. Check that location is on and try again.",
          ),
        ),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60 * 1000 },
    );
  });
}

type GeocodeResponse = {
  status: string;
  results: {
    address_components: { long_name: string; types: string[] }[];
  }[];
};

// Most specific name first, e.g. "Dubai Marina" before "Dubai".
const NAME_TYPES = [
  'neighborhood',
  'sublocality_level_1',
  'sublocality',
  'locality',
  'administrative_area_level_1',
];

// Area name for a point, via Google's Geocoding API.
async function areaName(lat: number, lng: number) {
  const url =
    'https://maps.googleapis.com/maps/api/geocode/json' +
    `?latlng=${lat},${lng}&result_type=${NAME_TYPES.join('|')}` +
    `&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  const data: GeocodeResponse = await response.json();
  if (data.status !== 'OK') {
    return null;
  }

  const components = data.results.flatMap(r => r.address_components);
  for (const type of NAME_TYPES) {
    const match = components.find(c => c.types.includes(type));
    if (match) {
      return match.long_name;
    }
  }
  return null;
}

// The user's current position as an Area. Throws LocationError.
export async function getCurrentArea(): Promise<Area> {
  const { lat, lng } = await getPosition();
  // The position is enough for distances, so a failed lookup only
  // costs us the name.
  const name = await areaName(lat, lng).catch(() => null);
  return { name: name ?? 'Current location', lat, lng };
}
