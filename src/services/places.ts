// Google Places — nearby restaurant detection + text search

const PLACES_URL = 'https://places.googleapis.com/v1';

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  distance?: number; // metres
}

export async function detectNearbyRestaurant(
  lat: number,
  lng: number,
  placesKey: string,
): Promise<Restaurant | null> {
  const body = {
    includedTypes: ['restaurant'],
    maxResultCount: 1,
    locationRestriction: {
      circle: { center: { latitude: lat, longitude: lng }, radius: 80 },
    },
  };

  const res = await fetch(`${PLACES_URL}/places:searchNearby`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': placesKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return null;
  const json = await res.json();
  const place = json.places?.[0];
  if (!place) return null;

  return {
    id: place.id,
    name: place.displayName?.text ?? 'Unknown',
    address: place.formattedAddress ?? '',
  };
}

export async function searchRestaurants(
  query: string,
  placesKey: string,
): Promise<Restaurant[]> {
  const body = {
    textQuery: query,
    includedType: 'restaurant',
    maxResultCount: 5,
  };

  const res = await fetch(`${PLACES_URL}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': placesKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return [];
  const json = await res.json();
  return (json.places ?? []).map((p: any) => ({
    id: p.id,
    name: p.displayName?.text ?? '',
    address: p.formattedAddress ?? '',
  }));
}
