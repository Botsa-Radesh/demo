import { LLMItem } from '@/types';
import { products, findBestMatch } from '@/data/products';
import { recipes } from '@/data/recipes';

// Track AI availability for the UI indicator
let aiAvailable: boolean | null = null;

export function getAIAvailability(): boolean | null {
  return aiAvailable;
}

async function callServerAI(action: string, payload: Record<string, unknown>): Promise<{ data: Record<string, unknown> | null; available: boolean }> {
  try {
    const res = await fetch('/api/ai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    });

    if (res.status === 503) {
      aiAvailable = false;
      return { data: null, available: false };
    }

    if (!res.ok) {
      return { data: null, available: aiAvailable ?? true };
    }

    const data = await res.json();
    if (data.available !== undefined) {
      aiAvailable = data.available;
    }
    return { data, available: data.available ?? true };
  } catch {
    return { data: null, available: aiAvailable ?? false };
  }
}

function smartParse(text: string): LLMItem[] {
  const lower = text.toLowerCase().trim();
  const cleaned = lower
    .replace(/^(add|get|i need|i want|please add|kindly add|need|want|buy|purchase)\s+/i, '')
    .replace(/\s+please$/i, '')
    .trim();

  const separators = /[,;&]|\band\b|\bplus\b/;
  const parts = cleaned.split(separators).map(s => s.trim()).filter(Boolean);

  const items: LLMItem[] = [];

  for (const part of parts) {
    const qtyMatch = part.match(/(\d+)\s*(kg|g|l|ml|packet|dozen|pk|pieces|bottle|litre|liters|kgs|grams)?/i);
    let quantity = 1;
    let namePart = part;

    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1]) || 1;
      namePart = part.replace(qtyMatch[0], '').trim();
    }

    namePart = namePart.replace(/^(a |an |the |some |of )/i, '').trim();

    if (!namePart || namePart.length < 1) continue;
    items.push({ productName: namePart, quantity });
  }

  if (items.length === 0) {
    const qtyMatch = cleaned.match(/(\d+)/);
    const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
    const name = cleaned.replace(/(\d+)\s*(kg|g|l|ml|packet|dozen|pk|pieces|bottle|litre|liters|kgs|grams)?/i, '').trim().replace(/^(a |an |the |some |of )/i, '');
    if (name) {
      items.push({ productName: name, quantity: qty });
    }
  }

  return items;
}

export async function parseItemsWithLLM(text: string): Promise<LLMItem[]> {
  const { data } = await callServerAI('parse_items', { text });
  if (data && Array.isArray(data.items) && data.items.length > 0) {
    return data.items as LLMItem[];
  }
  return smartParse(text);
}

export function matchLLMItemsToProducts(llmItems: LLMItem[]): { productName: string; matchedProduct?: { id: string; name: string }; quantity: number }[] {
  return llmItems.map(item => {
    const productName = item.productName;
    const singular = productName.replace(/s$/, '');
    const matched = findBestMatch(singular) || findBestMatch(productName);
    return {
      productName: item.productName,
      matchedProduct: matched ? { id: matched.id, name: matched.name } : undefined,
      quantity: item.quantity,
    };
  });
}

export function findRecipeSmart(text: string): string | null {
  const lower = text.toLowerCase();
  const cookingWords = ['recipe', 'make', 'cook', 'prepare', 'want', 'need', 'i\'d like', 'i\'ll', 'i will'];
  const hasCookingIntent = cookingWords.some(w => lower.includes(w));

  if (!hasCookingIntent) return null;

  for (const r of recipes) {
    const name = r.name.toLowerCase();
    if (lower.includes(name)) return r.name;
    const keywords = name.split(' ');
    if (keywords.some(kw => lower.includes(kw))) return r.name;
  }
  return null;
}

export async function findBestRecipeMatch(text: string): Promise<string | null> {
  const { data } = await callServerAI('match_recipe', { text });
  if (data && data.recipe) {
    const recipe = recipes.find(r => r.name.toLowerCase() === (data.recipe as string).toLowerCase());
    if (recipe) return recipe.name;
  }
  return findRecipeSmart(text);
}

export interface CartAnalysis {
  summary: string;
  tip: string;
  missing: string;
  duplicates: boolean;
  balanced: boolean;
}

export async function analyzeCart(items: { name: string; quantity: number; category: string; price: number }[]): Promise<CartAnalysis | null> {
  if (items.length === 0) return null;

  const { data } = await callServerAI('analyze_cart', { items });
  if (data && data.analysis) {
    return data.analysis as CartAnalysis;
  }
  return null;
}

export { smartParse };
