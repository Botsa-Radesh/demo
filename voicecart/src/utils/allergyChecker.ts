import { Product, Allergen, Member } from '@/types';

export interface AllergyWarning {
  productId: string;
  productName: string;
  allergens: { allergen: Allergen; affectedMembers: Member[] }[];
  severity: 'low' | 'medium' | 'high';
  suggestedSwap?: Product;
}

export function checkAllergies(product: Product, members: Member[], allProducts: Product[]): AllergyWarning | null {
  if (!product.allergens || product.allergens.length === 0) return null;

  const affected: { allergen: Allergen; affectedMembers: Member[] }[] = [];

  for (const allergen of product.allergens) {
    const allergicMembers = members.filter(m => m.allergies.includes(allergen));
    if (allergicMembers.length > 0) {
      affected.push({ allergen, affectedMembers: allergicMembers });
    }
  }

  if (affected.length === 0) return null;

  const severity = affected.length >= 3 ? 'high' : affected.length >= 2 ? 'medium' : 'low';

  const suggestedSwap = allProducts.find(
    p =>
      p.category === product.category &&
      p.id !== product.id &&
      !p.allergens.some(a => affected.some(af => af.allergen === a)) &&
      Math.abs(p.price - product.price) / product.price < 0.3
  );

  return { productId: product.id, productName: product.name, allergens: affected, severity, suggestedSwap };
}
