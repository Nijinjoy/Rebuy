import { GOOGLE_MAPS_API_KEY } from '../config/keys';

const PLACES_URL = 'https://maps.googleapis.com/maps/api/place';

export type PlaceSuggestion = {
  placeId: string;
  // e.g. "Dubai Marina Mall"
  title: string;
  // e.g. "Sheikh Zayed Road, Dubai"
  subtitle: string;
};

type AutocompleteResponse = {
  status: string;
  predictions: {
    place_id: string;
    description: string;
    structured_formatting?: { main_text?: string; secondary_text?: string };
  }[];
};

type DetailsResponse = {
  status: string;
  result?: { geometry?: { location?: { lat: number; lng: number } } };
};

// Places in the UAE matching what the user typed, via Google Places.
export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const url =
    `${PLACES_URL}/autocomplete/json` +
    `?input=${encodeURIComponent(query)}&components=country:ae` +
    `&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  const data: AutocompleteResponse = await response.json();
  if (data.status === 'ZERO_RESULTS') {
    return [];
  }
  if (data.status !== 'OK') {
    throw new Error(`Place search failed: ${data.status}`);
  }

  return data.predictions.map(prediction => ({
    placeId: prediction.place_id,
    title:
      prediction.structured_formatting?.main_text ?? prediction.description,
    subtitle: prediction.structured_formatting?.secondary_text ?? '',
  }));
}

// Where a suggestion from searchPlaces is on the map.
export async function getPlaceLocation(placeId: string) {
  const url =
    `${PLACES_URL}/details/json` +
    `?place_id=${encodeURIComponent(placeId)}&fields=geometry/location` +
    `&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  const data: DetailsResponse = await response.json();
  const location = data.result?.geometry?.location;
  if (data.status !== 'OK' || !location) {
    throw new Error(`Place lookup failed: ${data.status}`);
  }
  return location;
}
