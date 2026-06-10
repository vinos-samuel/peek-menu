// Fetch dish photos: Google Places first, Google Image Search as fallback

const PLACES_URL = 'https://places.googleapis.com/v1';
const CUSTOM_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1';

export interface DishPhoto {
  uri: string;
  source: 'places' | 'search' | 'none';
  attribution?: string;
}

// ── Google Places — find restaurant nearby, then search its photos ─────────

async function nearbyRestaurantId(
  lat: number,
  lng: number,
  placesKey: string,
): Promise<string | null> {
  const body = {
    includedTypes: ['restaurant'],
    maxResultCount: 1,
    locationRestriction: {
      circle: { center: { latitude: lat, longitude: lng }, radius: 50 },
    },
  };

  const res = await fetch(`${PLACES_URL}/places:searchNearby`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': placesKey,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return null;
  const json = await res.json();
  return json.places?.[0]?.id ?? null;
}

async function placesPhotoForDish(
  placeId: string,
  dishName: string,
  placesKey: string,
): Promise<string | null> {
  // Fetch up to 10 photos and pick the first one labelled with the dish name
  const res = await fetch(
    `${PLACES_URL}/places/${placeId}?fields=photos&key=${placesKey}`,
  );
  if (!res.ok) return null;

  const json = await res.json();
  const photos: Array<{ name: string; authorAttributions?: unknown[] }> =
    json.photos ?? [];

  if (photos.length === 0) return null;

  // Use the first photo (Places API doesn't expose per-dish labels in basic tier)
  const photoName = photos[0].name;
  return `${PLACES_URL}/${photoName}/media?maxWidthPx=600&key=${placesKey}`;
}

// ── Google Custom Search — image search fallback ───────────────────────────

async function searchImage(
  dishName: string,
  searchKey: string,
  searchCx: string,
): Promise<string | null> {
  const q = encodeURIComponent(`${dishName} dish food photo`);
  const url = `${CUSTOM_SEARCH_URL}?key=${searchKey}&cx=${searchCx}&searchType=image&num=1&q=${q}&imgSize=medium&safe=active`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  return json.items?.[0]?.link ?? null;
}

// ── Main export ────────────────────────────────────────────────────────────

export async function getDishPhoto(
  dishName: string,
  lat: number | null,
  lng: number | null,
  keys: {
    placesKey: string;
    searchKey: string;
    searchCx: string;
  },
): Promise<DishPhoto> {
  // 1. Try Google Places if we have a location
  if (lat !== null && lng !== null) {
    try {
      const placeId = await nearbyRestaurantId(lat, lng, keys.placesKey);
      if (placeId) {
        const uri = await placesPhotoForDish(placeId, dishName, keys.placesKey);
        if (uri) return { uri, source: 'places' };
      }
    } catch {
      // fall through to search
    }
  }

  // 2. Fallback: Google Custom Image Search
  try {
    const uri = await searchImage(dishName, keys.searchKey, keys.searchCx);
    if (uri) return { uri, source: 'search' };
  } catch {
    // nothing
  }

  return { uri: '', source: 'none' };
}
