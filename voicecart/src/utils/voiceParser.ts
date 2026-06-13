import { VoiceCommandResult, LLMItem, Product } from '@/types';
import { findBestMatch, products } from '@/data/products';
import { recipes } from '@/data/recipes';
import { defaultTemplates } from '@/data/templates';
import { parseItemsWithLLM, findBestRecipeMatch, findRecipeSmart } from './llmService';

export async function parseVoiceCommand(text: string): Promise<VoiceCommandResult> {
  const lower = text.toLowerCase().trim();

  // Cart switching
  const switchMatch = lower.match(/switch\s+(to\s+)?(my\s+)?cart/i);
  if (switchMatch) {
    return { intent: 'SWITCH_CART', params: { target: 'personal' }, originalText: text, response: 'Switching to your personal cart!' };
  }

  if (/switch\s+(to\s+)?common/i.test(lower) || /go\s+to\s+(the\s+)?common/i.test(lower)) {
    return { intent: 'SWITCH_CART', params: { target: 'common' }, originalText: text, response: 'Switching to common cart!' };
  }

  // Show cart code
  if (/show.*code|cart code|code.*cart|invite.*code|share.*code/i.test(lower)) {
    return { intent: 'SHOW_CODE', params: {}, originalText: text, response: 'Here is your cart code!' };
  }

  // Create common cart
  if (/create.*common|new.*common|make.*common|start.*common/i.test(lower)) {
    const nameMatch = lower.match(/(?:called|named|name)\s+["']?([^"']+?)["']?(?:\s+with|\s*$)/i);
    const name = nameMatch ? nameMatch[1].trim() : 'Common Cart';
    return { intent: 'CREATE_COMMON', params: { name }, originalText: text, response: `Creating common cart "${name}"!` };
  }

  // Join cart
  if (/join.*cart|join.*code|enter.*code/i.test(lower)) {
    const codeMatch = lower.match(/[A-Z0-9]{4,}/i) || lower.match(/(?:code|cart)\s+([A-Z0-9-]+)/i);
    const code = codeMatch ? codeMatch[0].toUpperCase() : '';
    return { intent: 'JOIN_CART', params: { code }, originalText: text, response: code ? `Joining cart ${code}!` : 'Please provide a cart code.' };
  }

  if (/checkout|pay now|proceed to pay/i.test(lower)) {
    return { intent: 'CHECKOUT', params: {}, originalText: text, response: 'Taking you to checkout!' };
  }

  const isRecipeIntent = /recipe|make|how to make|cook|prepare|i'd like/i.test(lower);
  if (isRecipeIntent || (/i (want|need)/i.test(lower) && recipes.some(r => r.name.toLowerCase().split(' ').some(kw => lower.includes(kw))))) {
    const recipeName = await findBestRecipeMatch(text);
    if (recipeName) {
      const recipe = recipes.find(r => r.name === recipeName);
      if (recipe) {
        const match = lower.match(/(\d+)\s*(people|persons|servings|pax)/i) || lower.match(/for\s+(\d+)/);
        const servings = match ? match[1] : String(recipe.servings);
        return { intent: 'RECIPE_ADD', params: { recipeId: recipe.id, servings }, originalText: text, response: `Adding all ingredients for ${recipeName} for ${servings} people to your cart!` };
      }
    }
    const fallbackRecipe = findRecipeSmart(text);
    if (fallbackRecipe) {
      const r = recipes.find(x => x.name === fallbackRecipe);
      if (r) {
        return { intent: 'RECIPE_ADD', params: { recipeId: r.id, servings: String(r.servings) }, originalText: text, response: `Adding all ingredients for ${r.name} to your cart!` };
      }
    }
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

  if (/remove|delete|take out|clear/i.test(lower) && !/add.*and.*remove/i.test(lower)) {
    const itemName = lower.replace(/remove|delete|take out|clear|the|please/gi, '').trim();
    if (!itemName || itemName.length < 2) {
      return { intent: 'UNKNOWN', params: { query: itemName }, originalText: text, response: 'What would you like to remove?' };
    }
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

  // Try LLM-based parsing for item addition
  const llmItems = await parseItemsWithLLM(text);
  if (llmItems.length > 0) {
    const matchedItems: string[] = [];
    for (const item of llmItems) {
      const productName = item.productName.replace(/s$/, '');
      const product = findBestMatch(productName) || findBestMatch(item.productName);
      if (product) {
        matchedItems.push(`${item.quantity} ${product.name}`);
      }
    }
    if (matchedItems.length > 0) {
      return {
        intent: 'ADD_BATCH',
        params: {},
        items: llmItems,
        originalText: text,
        response: `Added ${matchedItems.join(', ')} to cart!`,
      };
    }
  }

  // Single item fallback
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
