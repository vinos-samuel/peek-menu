import * as FileSystem from 'expo-file-system';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface DishResult {
  originalName: string; // as printed on menu
  englishName: string;  // translated / plain English
  price?: string;
  section?: string;     // e.g. "Starters", "Mains"
}

export async function extractDishesFromMenu(
  photoUri: string,
  apiKey: string,
): Promise<DishResult[]> {
  // Read the image as base64
  const base64 = await FileSystem.readAsStringAsync(photoUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const body = {
    contents: [
      {
        parts: [
          {
            text: `You are a menu reader. Extract every dish name from this menu photo.
Return ONLY a JSON array. Each item must have:
- "originalName": exact text from menu
- "englishName": plain English name (translate if needed, keep concise)
- "price": price string if visible (else omit)
- "section": menu section heading if visible (else omit)

No markdown. No explanation. JSON array only.`,
          },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 1024,
    },
  };

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }

  const json = await res.json();
  const text: string =
    json.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';

  // Strip markdown code fences if Gemini adds them
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(clean) as DishResult[];
}
