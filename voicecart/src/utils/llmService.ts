import { LLMItem } from '@/types';
import { products, findBestMatch } from '@/data/products';
import { recipes } from '@/data/recipes';

const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function getApiKey(): string | null {
  try {
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GEMINI_KEY) {
      return process.env.NEXT_PUBLIC_GEMINI_KEY;
    }
  } catch {}
  return null;
}

const systemPrompt = `You extract grocery items from natural language. Return ONLY a JSON array of objects with keys "name" and "quantity" (number). Quantity defaults to 1 if not specified. Examples:

Input: "add 2kg rice, 1 packet of pasta, 3 apples and a bottle of oil"
Output: [{"name":"rice","quantity":2},{"name":"pasta","quantity":1},{"name":"apples","quantity":3},{"name":"oil","quantity":1}]

Input: "i need milk bread and eggs"
Output: [{"name":"milk","quantity":1},{"name":"bread","quantity":1},{"name":"eggs","quantity":1}]

Input: "get me 5 bananas 2kg onions and 1 litre milk"
Output: [{"name":"bananas","quantity":5},{"name":"onions","quantity":2},{"name":"milk","quantity":1}]`;

async function callGemini(text: string): Promise<LLMItem[] | null> {
  const key = getApiKey();
  if (!key) return null;

  try {
    const res = await fetch(`${GEMINI_API}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nInput: "${text}"\nOutput:`,
          }],
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return null;

    const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => ({
        productName: String(item.name || '').trim().toLowerCase(),
        quantity: Math.max(1, parseInt(item.quantity) || 1),
      }));
    }
    return null;
  } catch {
    return null;
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
  const llmResult = await callGemini(text);
  if (llmResult && llmResult.length > 0) {
    return llmResult;
  }
  return smartParse(text);
}

export function matchLLMItemsToProducts(llmItems: LLMItem[]): { productName: string; matchedProduct?: { id: string; name: string }; quantity: number }[] {
  return llmItems.map(item => {
    let productName = item.productName;
    const singular = productName.replace(/s$/, '');
    const matched = findBestMatch(singular) || findBestMatch(productName);
    return {
      productName: item.productName,
      matchedProduct: matched ? { id: matched.id, name: matched.name } : undefined,
      quantity: item.quantity,
    };
  });
}

const recipeSystemPrompt = `You are a recipe matcher. Given a user's request, return the EXACT name of the closest matching recipe from this list. Return ONLY the recipe name, nothing else. If no recipe matches, return "UNKNOWN".

Available recipes: Butter Chicken, Paneer Butter Masala, Pasta Alfredo, Dal Tadka, Masala Chai, Chicken Biryani, Maggi Noodles, Egg Curry, Aloo Paratha

Examples:
Input: "i want to prepare biryani"
Output: Chicken Biryani

Input: "make some pasta"
Output: Pasta Alfredo

Input: "cook butter chicken for dinner"
Output: Butter Chicken

Input: "i need breakfast ideas"
Output: UNKNOWN`;

export async function findRecipeWithLLM(text: string): Promise<string | null> {
  const key = getApiKey();
  if (!key) return null;

  try {
    const res = await fetch(`${GEMINI_API}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${recipeSystemPrompt}\n\nInput: "${text}"\nOutput:`,
          }],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 50 },
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!content || content === 'UNKNOWN') return null;

    const recipe = recipes.find(r => r.name.toLowerCase() === content.toLowerCase());
    return recipe?.name || null;
  } catch {
    return null;
  }
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
  const llm = await findRecipeWithLLM(text);
  if (llm) return llm;
  return findRecipeSmart(text);
}

const cartAnalysisPrompt = `You are a smart AI shopping assistant. Analyze the given cart items and return a JSON object with these keys:
- "summary": a one-line summary of what the cart contains (e.g. "Looks like you're prepping for a week of Indian cooking!")
- "tip": one practical cost-saving or health tip based on the cart contents
- "missing": one item they might have forgotten (be specific, based on what they're buying)
- "duplicates": boolean — true if there are duplicate or very similar items
- "balanced": boolean — true if the cart has a good mix of categories

Return ONLY valid JSON, no other text.`;

export interface CartAnalysis {
  summary: string;
  tip: string;
  missing: string;
  duplicates: boolean;
  balanced: boolean;
}

export async function analyzeCart(items: { name: string; quantity: number; category: string; price: number }[]): Promise<CartAnalysis | null> {
  const key = getApiKey();
  if (!key || items.length === 0) return null;

  const itemList = items.map(i => `${i.quantity}x ${i.name} (${i.category}, ₹${i.price})`).join('\n');
  const prompt = `${cartAnalysisPrompt}\n\nCart items:\n${itemList}\n\nAnalysis:`;

  try {
    const res = await fetch(`${GEMINI_API}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 300 },
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return null;

    const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      summary: String(parsed.summary || ''),
      tip: String(parsed.tip || ''),
      missing: String(parsed.missing || ''),
      duplicates: Boolean(parsed.duplicates),
      balanced: Boolean(parsed.balanced),
    };
  } catch {
    return null;
  }
}

const insightsPrompt = `You are a smart AI shopping analyst. Given order history data and member names, return a JSON array of exactly 3 insights. Each insight has:
- "emoji": a single emoji representing the insight
- "title": short bold title (max 40 chars)
- "detail": one-line explanation (max 80 chars)

Make insights specific, data-driven, and personalized. Cover: spending trends, frequently bought items, member comparisons, or savings tips.

Return ONLY valid JSON array, no other text.`;

export interface DashboardInsight {
  emoji: string;
  title: string;
  detail: string;
}

export async function generateDashboardInsights(
  orders: { date: string; totalAmount: number; items: { name: string; quantity: number; price: number; category: string }[]; memberPayments: { memberId: string; amount: number }[] }[],
  members: { id: string; name: string }[]
): Promise<DashboardInsight[]> {
  const key = getApiKey();
  if (!key || orders.length === 0) {
    return [
      { emoji: '🛒', title: 'Start ordering to see insights', detail: 'Your personalized analytics will appear here after your first order.' },
      { emoji: '📊', title: 'Track your spending', detail: 'Order history will power AI-driven spending insights.' },
      { emoji: '🎯', title: 'Smart recommendations', detail: 'Get product suggestions based on your purchase patterns.' },
    ];
  }

  const memberMap = Object.fromEntries(members.map(m => [m.id, m.name]));
  const summary = orders.slice(-10).map(o => {
    const date = new Date(o.date).toLocaleDateString();
    const items = o.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
    const members_paid = o.memberPayments.map(p => `${memberMap[p.memberId] || p.memberId}:₹${p.amount}`).join(', ');
    return `[${date}] ₹${o.totalAmount} — ${items} | Paid: ${members_paid}`;
  }).join('\n');

  const memberNames = members.map(m => m.name).join(', ');

  const prompt = `${insightsPrompt}\n\nMembers: ${memberNames}\n\nRecent orders:\n${summary}\n\nInsights:`;

  try {
    const res = await fetch(`${GEMINI_API}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
      }),
    });

    if (!res.ok) return getFallbackInsights(orders, members);

    const data = await res.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return getFallbackInsights(orders, members);

    const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length >= 3) {
      return parsed.slice(0, 3).map((i: any) => ({
        emoji: String(i.emoji || '💡'),
        title: String(i.title || 'Insight'),
        detail: String(i.detail || ''),
      }));
    }
    return getFallbackInsights(orders, members);
  } catch {
    return getFallbackInsights(orders, members);
  }
}

function getFallbackInsights(
  orders: { date: string; totalAmount: number; items: { name: string; quantity: number; price: number; category: string }[]; memberPayments: { memberId: string; amount: number }[] }[],
  members: { id: string; name: string }[]
): DashboardInsight[] {
  const total = orders.reduce((s, o) => s + o.totalAmount, 0);
  const avg = total / Math.max(orders.length, 1);
  const allItems = orders.flatMap(o => o.items);
  const freq: Record<string, number> = {};
  for (const i of allItems) {
    freq[i.name] = (freq[i.name] || 0) + i.quantity;
  }
  const topItem = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  const thisMonth = orders.filter(o => new Date(o.date).getMonth() === new Date().getMonth());
  const monthTotal = thisMonth.reduce((s, o) => s + o.totalAmount, 0);

  return [
    { emoji: '💰', title: `₹${total.toLocaleString()} total spent`, detail: `Across ${orders.length} orders — avg ₹${Math.round(avg)} per order` },
    { emoji: '📈', title: `₹${monthTotal.toLocaleString()} this month`, detail: `${thisMonth.length} orders so far this month` },
    { emoji: topItem ? '🛒' : '📊', title: topItem ? `Most bought: ${topItem[0]}` : 'Start ordering!', detail: topItem ? `Bought ${topItem[1]} times` : 'Your first order will generate insights' },
  ];
}

export { smartParse };
