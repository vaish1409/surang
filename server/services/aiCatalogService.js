const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Keep this list in sync with the `category` enum in models/Artwork.js
const CATEGORIES = [
  'Madhubani', 'Warli', 'Kalamkari', 'Pottery', 'Pattachitra',
  'Weaving', 'Sculpture', 'Folk Art', 'Photography', 'Other',
];

const SYSTEM_PROMPT = `You are the cataloging assistant inside SURANG, a marketplace where Indian artisans list and sell their own handmade craft directly to buyers.

You will be shown one photo of a handmade artwork or craft item. Draft a first-pass product listing the artisan can review and edit — you are assisting, not replacing, their own description of their own work.

Respond with ONLY a raw JSON object matching exactly this shape:

{
  "category": one of [${CATEGORIES.join(', ')}],
  "title": a short, specific title, max 8 words,
  "description": 2 to 4 sentences a buyer would find useful, describing visible technique, motifs, and colors,
  "artStyle": a short phrase naming the specific visible style or motif, or empty string if not identifiable,
  "medium": likely visible material/medium, or empty string if not identifiable,
  "suggestedTags": array of 3 to 6 short lowercase keyword tags,
  "confidence": "high", "medium", or "low" — how confident you are in the category guess specifically,
  "artisanPrompt": one short, specific question to ask the artisan to fill the biggest gap you could not tell from the photo (e.g. dimensions, region of origin, time taken) — empty string if nothing significant is missing
}

Rules:
- Never claim a GI tag, certification, award, or verified authenticity — you cannot see provenance from a photo.
- If the photo is blurry, poorly lit, or ambiguous, use "low" confidence honestly rather than guessing with false certainty.
- Do not invent a backstory, region, or artisan biography you cannot see in the photo.
- Write the description the way a proud artisan would describe their own work to a buyer, not like a generic product listing.`;

async function autoCatalogFromImage({ base64, mimeType }) {
  const request = {
    model: 'gemini-3.6-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: 'Catalog this artwork photo for SURANG. Keep the JSON concise.' },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 2000,
      responseMimeType: 'application/json',
      responseJsonSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: CATEGORIES },
          title: { type: 'string' },
          description: { type: 'string' },
          artStyle: { type: 'string' },
          medium: { type: 'string' },
          suggestedTags: { type: 'array', items: { type: 'string' } },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          artisanPrompt: { type: 'string' },
        },
        required: ['category', 'title', 'description', 'artStyle', 'medium', 'suggestedTags', 'confidence', 'artisanPrompt'],
      },
    },
  };

  let parsed;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await ai.models.generateContent(request);
      const text = response.text;
      if (!text) throw new Error('AI did not return a text response');

      const cleaned = text.replace(/```json|```/g, '').trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start < 0 || end <= start) throw new Error('Could not parse AI response as JSON');
        parsed = JSON.parse(cleaned.slice(start, end + 1));
      }
      break;
    } catch (error) {
      const transient = /429|503|UNAVAILABLE|high demand|Could not parse AI response|Unexpected end/i.test(error.message || '');
      if (!transient || attempt === 3) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  if (!CATEGORIES.includes(parsed.category)) parsed.category = 'Other';
  return parsed;
}

module.exports = { autoCatalogFromImage, CATEGORIES };
