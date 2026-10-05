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

export function getPosition() {
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
export async function areaName(lat: number, lng: number) {
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

// Longest location the backend accepts.
const MAX_ADDRESS_LENGTH = 100;

// Street-level address for a point, e.g. "Braih St, Dubai Marina, Dubai".
// `label` replaces the street, for a place the user searched for by name.
// Null when nothing could be looked up.
export async function placeAddress(lat: number, lng: number, label?: string) {
  const url =
    'https://maps.googleapis.com/maps/api/geocode/json' +
    `?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  const data: GeocodeResponse = await response.json();
  if (data.status !== 'OK') {
    return label ?? null;
  }

  const components = data.results.flatMap(r => r.address_components);
  const find = (types: string[], skip?: RegExp) => {
    for (const type of types) {
      const match = components.find(
        c => c.types.includes(type) && !skip?.test(c.long_name),
      );
      if (match) {
        return match.long_name;
      }
    }
    return undefined;
  };

  const parts = [
    label ?? find(['route'], /unnamed/i),
    find(['neighborhood', 'sublocality_level_1', 'sublocality', 'locality']),
    find(['administrative_area_level_1']),
  ].filter((part): part is string => !!part);
  // e.g. the area and emirate are both "Sharjah".
  const address = [...new Set(parts)].join(', ');

  return address.slice(0, MAX_ADDRESS_LENGTH) || null;
}

// The user's current position as an Area. Throws LocationError.
export async function getCurrentArea(): Promise<Area> {
  const { lat, lng } = await getPosition();
  // The position is enough for distances, so a failed lookup only
  // costs us the name.
  const name = await areaName(lat, lng).catch(() => null);
  return { name: name ?? 'Current location', lat, lng };
}
