import { Product, CartItem } from '@/types';
import { products } from '@/data/products';

const categoryPriority: Record<string, number> = {
  'Staples': 1,
  'Fruits & Vegetables': 2,
  'Dairy': 3,
  'Snacks': 4,
  'Beverages': 5,
  'Personal Care': 6,
  'Household': 7,
};

export function optimizeCartForBudget(
  budget: number,
  existingItems: CartItem[],
  memberId: string
): { items: { product: Product; quantity: number }[]; total: number; remaining: number } {
  const existingTotal = existingItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  let available = budget - existingTotal;

  if (available <= 0) return { items: [], total: 0, remaining: 0 };

  const sorted = [...products]
    .filter(p => p.stockStatus !== 'out_of_stock')
    .sort((a, b) => (categoryPriority[a.category] || 99) - (categoryPriority[b.category] || 99));

  const selected: { product: Product; quantity: number }[] = [];

  for (const product of sorted) {
    if (available <= 0) break;
    const maxQty = Math.floor(available / product.price);
    if (maxQty > 0) {
      const qty = Math.min(maxQty, 2);
      selected.push({ product, quantity: qty });
      available -= product.price * qty;
    }
  }

  const total = selected.reduce((s, i) => s + i.product.price * i.quantity, 0);
  return { items: selected, total, remaining: Math.round(available) };
}

export function upgradeProduct(current: Product): Product | null {
  const upgraded = products.find(
    p => p.category === current.category && p.price > current.price && p.price <= current.price * 1.5 && p.id !== current.id
  );
  return upgraded || null;
}
