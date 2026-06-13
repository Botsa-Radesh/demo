import { Product } from '@/types';
import { products } from '@/data/products';

export interface SubstitutionSuggestion {
  original: Product;
  suggested: Product;
  similarity: number;
  priceDiff: number;
  reason: string;
}

export function findSubstitution(product: Product): SubstitutionSuggestion | null {
  const candidates = products.filter(
    p =>
      p.id !== product.id &&
      p.category === product.category &&
      p.stockStatus !== 'out_of_stock'
  );

  if (candidates.length === 0) return null;

  let best: SubstitutionSuggestion | null = null;
  let bestScore = -1;

  for (const candidate of candidates) {
    let score = 0;
    if (candidate.brand === product.brand) score += 30;
    const commonTags = candidate.tags.filter(t => product.tags.includes(t));
    score += commonTags.length * 15;
    const priceRatio = Math.abs(candidate.price - product.price) / product.price;
    score += Math.max(0, (1 - priceRatio) * 40);
    if (candidate.allergens.length === product.allergens.length &&
        candidate.allergens.every(a => product.allergens.includes(a))) {
      score += 20;
    }

    if (score > bestScore) {
      bestScore = score;
      const priceDiff = candidate.price - product.price;
      const reason = priceDiff > 0
        ? `Slightly premium option (+₹${priceDiff})`
        : priceDiff < 0
          ? `Budget-friendly option (-₹${Math.abs(priceDiff)})`
          : 'Same price alternative';
      best = { original: product, suggested: candidate, similarity: Math.round(score), priceDiff, reason };
    }
  }

  return best;
}
