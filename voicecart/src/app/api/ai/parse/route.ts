import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function getApiKey(): string | null {
  return process.env.GEMINI_KEY || process.env.NEXT_PUBLIC_GEMINI_KEY || null;
}

const systemPrompt = `You extract grocery items from natural language. Return ONLY a JSON array of objects with keys "name" and "quantity" (number). Quantity defaults to 1 if not specified. Examples:

Input: "add 2kg rice, 1 packet of pasta, 3 apples and a bottle of oil"
Output: [{"name":"rice","quantity":2},{"name":"pasta","quantity":1},{"name":"apples","quantity":3},{"name":"oil","quantity":1}]

Input: "i need milk bread and eggs"
Output: [{"name":"milk","quantity":1},{"name":"bread","quantity":1},{"name":"eggs","quantity":1}]`;

const recipeSystemPrompt = `You are a recipe matcher. Given a user's request, return the EXACT name of the closest matching recipe from this list. Return ONLY the recipe name, nothing else. If no recipe matches, return "UNKNOWN".

Available recipes: Butter Chicken, Paneer Butter Masala, Pasta Alfredo, Dal Tadka, Masala Chai, Chicken Biryani, Maggi Noodles, Egg Curry, Aloo Paratha`;

const cartAnalysisPrompt = `You are a smart AI shopping assistant. Analyze the given cart items and return a JSON object with these keys:
- "summary": a one-line summary of what the cart contains (e.g. "Looks like you're prepping for a week of Indian cooking!")
- "tip": one practical cost-saving or health tip based on the cart contents
- "missing": one item they might have forgotten (be specific, based on what they're buying)
- "duplicates": boolean — true if there are duplicate or very similar items
- "balanced": boolean — true if the cart has a good mix of categories

Return ONLY valid JSON, no other text.`;

async function callGemini(prompt: string, maxTokens = 300): Promise<string | null> {
  const key = getApiKey();
  if (!key) return null;

  try {
    const res = await fetch(`${GEMINI_API}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: maxTokens },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, text, items } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    const key = getApiKey();
    if (!key) {
      return NextResponse.json({ error: 'AI service unavailable', available: false }, { status: 503 });
    }

    switch (action) {
      case 'parse_items': {
        const prompt = `${systemPrompt}\n\nInput: "${text}"\nOutput:`;
        const content = await callGemini(prompt);
        if (!content) return NextResponse.json({ items: [], available: true });

        const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        try {
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed)) {
            const result = parsed.map((item: { name?: string; quantity?: number }) => ({
              productName: String(item.name || '').trim().toLowerCase(),
              quantity: Math.max(1, parseInt(String(item.quantity)) || 1),
            }));
            return NextResponse.json({ items: result, available: true });
          }
        } catch {}
        return NextResponse.json({ items: [], available: true });
      }

      case 'match_recipe': {
        const prompt = `${recipeSystemPrompt}\n\nInput: "${text}"\nOutput:`;
        const content = await callGemini(prompt, 50);
        if (!content || content === 'UNKNOWN') {
          return NextResponse.json({ recipe: null, available: true });
        }
        return NextResponse.json({ recipe: content, available: true });
      }

      case 'analyze_cart': {
        if (!items || items.length === 0) {
          return NextResponse.json({ analysis: null, available: true });
        }
        const itemList = items.map((i: { quantity: number; name: string; category: string; price: number }) =>
          `${i.quantity}x ${i.name} (${i.category}, ₹${i.price})`
        ).join('\n');
        const prompt = `${cartAnalysisPrompt}\n\nCart items:\n${itemList}\n\nAnalysis:`;
        const content = await callGemini(prompt);
        if (!content) return NextResponse.json({ analysis: null, available: true });

        const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        try {
          const parsed = JSON.parse(cleaned);
          return NextResponse.json({
            analysis: {
              summary: String(parsed.summary || ''),
              tip: String(parsed.tip || ''),
              missing: String(parsed.missing || ''),
              duplicates: Boolean(parsed.duplicates),
              balanced: Boolean(parsed.balanced),
            },
            available: true,
          });
        } catch {}
        return NextResponse.json({ analysis: null, available: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
