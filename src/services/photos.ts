// Fetch dish photos from the Peek backend (TheMealDB + Wikipedia fallback)

const API_URL = 'https://peek-api.vercel.app';

export interface DishPhoto {
  uri: string;
  source: 'mealdb' | 'wikipedia' | 'none';
}

export async function getDishPhotos(
  dishNames: string[],
  restaurantName?: string,
): Promise<Record<string, DishPhoto>> {
  try {
    const res = await fetch(`${API_URL}/api/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dishes: dishNames, restaurantName }),
    });
    if (!res.ok) throw new Error(`Photos API error ${res.status}`);

    const json = await res.json();
    const result: Record<string, DishPhoto> = {};
    for (const name of dishNames) {
      const p = json.photos?.[name];
      result[name] = p?.url ? { uri: p.url, source: p.source } : { uri: '', source: 'none' };
    }
    return result;
  } catch {
    const result: Record<string, DishPhoto> = {};
    for (const name of dishNames) result[name] = { uri: '', source: 'none' };
    return result;
  }
}
