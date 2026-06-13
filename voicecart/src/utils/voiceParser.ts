import { VoiceCommandResult, Product } from '@/types';
import { findBestMatch, products } from '@/data/products';
import { recipes } from '@/data/recipes';
import { defaultTemplates } from '@/data/templates';

export function parseVoiceCommand(text: string): VoiceCommandResult {
  const lower = text.toLowerCase().trim();

  if (/checkout|pay now|proceed to pay/i.test(lower)) {
    return { intent: 'CHECKOUT', params: {}, originalText: text, response: 'Taking you to checkout!' };
  }

  if (/recipe|make|how to make|cook/i.test(lower)) {
    for (const r of recipes) {
      if (lower.includes(r.name.toLowerCase())) {
        const match = lower.match(/for\s+(\d+)/);
        const servings = match ? match[1] : String(r.servings);
        return { intent: 'RECIPE', params: { recipeId: r.id, servings }, originalText: text, response: `Loading recipe for ${r.name} for ${servings} people!` };
      }
    }
    return { intent: 'RECIPE', params: { recipeId: 'r1', servings: '4' }, originalText: text, response: 'I found Butter Chicken recipe for you!' };
  }

  if (/budget|under\s+\d+|within\s+\d+/i.test(lower)) {
    const match = lower.match(/(\d+)/);
    const amount = match ? match[1] : '500';
    return { intent: 'BUDGET', params: { amount }, originalText: text, response: `Building a cart under ₹${amount}!` };
  }

  if (/template|load\s+\w+|weekly|party|breakfast/i.test(lower)) {
    for (const t of defaultTemplates) {
      if (lower.includes(t.name.toLowerCase().split(' ')[0])) {
        return { intent: 'TEMPLATE', params: { templateId: t.id }, originalText: text, response: `Loading ${t.name}!` };
      }
    }
    return { intent: 'TEMPLATE', params: { templateId: 't1' }, originalText: text, response: 'Loading Weekly Groceries template!' };
  }

  if (/what.*cart|summary|list|show.*cart|what.*added|what.*have/i.test(lower)) {
    if (/priya/i.test(lower)) return { intent: 'HIGHLIGHT', params: { memberId: 'm2' }, originalText: text, response: "Here's what Priya added!" };
    if (/amit/i.test(lower)) return { intent: 'HIGHLIGHT', params: { memberId: 'm3' }, originalText: text, response: "Here's what Amit added!" };
    if (/rahul/i.test(lower)) return { intent: 'HIGHLIGHT', params: { memberId: 'm1' }, originalText: text, response: "Here's what Rahul added!" };
    return { intent: 'SUMMARY', params: {}, originalText: text, response: 'Here\'s your cart summary!' };
  }

  if (/remove|delete|take out|clear/i.test(lower)) {
    const itemName = lower.replace(/remove|delete|take out|clear|the|please/gi, '').trim();
    const product = findBestMatch(itemName);
    if (product) return { intent: 'REMOVE_ITEM', params: { productId: product.id }, originalText: text, response: `Removed ${product.name} from cart!` };
    return { intent: 'UNKNOWN', params: { query: itemName }, originalText: text, response: 'I couldn\'t find that item to remove.' };
  }

  if (/mark.*shared|shared|split/i.test(lower)) {
    const itemName = lower.replace(/mark|as|shared|split|the/gi, '').trim();
    const product = findBestMatch(itemName);
    if (product) return { intent: 'MARK_SHARED', params: { productId: product.id }, originalText: text, response: `Marked ${product.name} as shared!` };
    return { intent: 'UNKNOWN', params: { query: itemName }, originalText: text, response: 'I couldn\'t find that item to mark as shared.' };
  }

  if (/reorder|running out|need.*again|ran out/i.test(lower)) {
    return { intent: 'REORDER', params: {}, originalText: text, response: 'Reordering your essential items!' };
  }

  const product = findBestMatch(lower);
  if (product) {
    const qtyMatch = lower.match(/(\d+)\s*(kg|g|l|ml|packet|dozen|pk|pieces|bottle)/i);
    const quantity = qtyMatch ? qtyMatch[1] : '1';
    return { intent: 'ADD_ITEM', params: { productId: product.id, quantity }, originalText: text, response: `Added ${quantity} ${product.name} to cart!` };
  }

  return { intent: 'UNKNOWN', params: { query: lower }, originalText: text, response: "I'll find the best match for you!" };
}

export function generateInviteCode(): string {
  const prefixes = ['FLAT', 'HOME', 'ROOM', 'CART', 'SHOP', 'HOST'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${code}`;
}
