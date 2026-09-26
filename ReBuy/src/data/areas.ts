export type Area = {
  name: string;
  // Approximate centre of the area.
  lat: number;
  lng: number;
};

// Areas users can pick as their location, until the app uses GPS.
// Names match the `location` of listings in sampleProducts.
export const AREAS: Area[] = [
  { name: 'Dubai Marina', lat: 25.0805, lng: 55.1403 },
  { name: 'JLT', lat: 25.0693, lng: 55.1413 },
  { name: 'Al Barsha', lat: 25.1136, lng: 55.2006 },
  { name: 'Arabian Ranches', lat: 25.0553, lng: 55.2656 },
  { name: 'Jumeirah', lat: 25.2048, lng: 55.2471 },
  { name: 'Business Bay', lat: 25.185, lng: 55.265 },
  { name: 'Deira', lat: 25.2711, lng: 55.3075 },
  { name: 'Mirdif', lat: 25.2196, lng: 55.4203 },
  { name: 'Sharjah', lat: 25.3463, lng: 55.4209 },
  { name: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
];

export const DEFAULT_AREA = AREAS[0];

// The seven emirates, largest first, with the AREAS inside each. A listing
// whose location is the emirate's own name (e.g. "Ajman") counts too.
export const EMIRATES: { name: string; areas: string[] }[] = [
  {
    name: 'Dubai',
    areas: [
      'Dubai Marina',
      'JLT',
      'Al Barsha',
      'Arabian Ranches',
      'Jumeirah',
      'Business Bay',
      'Deira',
      'Mirdif',
    ],
  },
  { name: 'Abu Dhabi', areas: ['Abu Dhabi'] },
  { name: 'Sharjah', areas: ['Sharjah'] },
  { name: 'Ajman', areas: [] },
  { name: 'Ras Al Khaimah', areas: [] },
  { name: 'Fujairah', areas: [] },
  { name: 'Umm Al Quwain', areas: [] },
];

// Listing locations that belong to an emirate, for the Explore filter.
export function emirateLocations(emirate: { name: string; areas: string[] }) {
  return [...new Set([emirate.name, ...emirate.areas])];
}

export function findArea(name: string) {
  return AREAS.find(a => a.name === name);
}

// Straight-line distance in km (haversine).
export function distanceKm(a: Area, b: Area) {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
