import { Product } from '@/types';

// Using reliable placeholder service with product-specific colors
function img(id: string): string {
  // Use product emoji as the primary display (handled in the component)
  // This URL is a fallback that won't break the layout if images fail
  const colors: Record<string, string> = {
    onion: 'C4A35A', tomato: 'FF4444', potato: 'C4A35A', banana: 'FFE135',
    apple: 'FF0000', spinach: '2E7D32', capsicum: '4CAF50', milk: 'E3F2FD',
    milk2: 'E3F2FD', curd: 'FAFAFA', paneer: 'FFFACD', butter: 'FFD700',
    cream: 'FFF8E1', rice: 'FAFAFA', toordal: 'FFD700', flour: 'F5DEB3',
    sugar: 'FAFAFA', oil: 'FFD700', salt: 'FAFAFA', maggi: 'FF6600',
    lays: 'FFD700', parleg: '8B4513', haldiram: 'FF6347', coldcoffee: '6F4E37',
    cocacola: 'FF0000', sprite: '00FF00', mangojuice: 'FFA500', greentea: '90EE90',
    chai: '8B4513', shampoo: 'FF69B4', facewash: '00BFFF', soap: 'FFD700',
    toothpaste: '00BFFF', detergent: '4169E1', floorcleaner: '00FF7F',
    dishwash: 'FFD700', toiletcleaner: '00BFFF', turmeric: 'FF8C00',
    chilli: 'DC143C', garammasala: '8B4513', chicken: 'FFB6C1',
    eggs: 'FAFAFA', peanutbutter: 'D2691E', cornflakes: 'FFD700',
  };
  const color = colors[id] || 'EEEEEE';
  return `https://placehold.co/200x200/${color}/333333?text=${encodeURIComponent(id)}`;
}

export const products: Product[] = [
  { id: 'p1', name: 'Onion', category: 'Fruits & Vegetables', price: 25, unit: 'kg', emoji: '🧅', imageUrl: img('onion'), color: '#C4A35A', stockStatus: 'in_stock', brand: 'Fresh Farms', allergens: [], tags: ['staple', 'vegetable'] },
  { id: 'p2', name: 'Tomato', category: 'Fruits & Vegetables', price: 30, unit: 'kg', emoji: '🍅', imageUrl: img('tomato'), color: '#FF4444', stockStatus: 'in_stock', brand: 'Fresh Farms', allergens: [], tags: ['staple', 'vegetable'] },
  { id: 'p3', name: 'Potato', category: 'Fruits & Vegetables', price: 20, unit: 'kg', emoji: '🥔', imageUrl: img('potato'), color: '#C4A35A', stockStatus: 'in_stock', brand: 'Fresh Farms', allergens: [], tags: ['staple', 'vegetable'] },
  { id: 'p4', name: 'Banana', category: 'Fruits & Vegetables', price: 40, unit: 'dozen', emoji: '🍌', imageUrl: img('banana'), color: '#FFE135', stockStatus: 'in_stock', brand: 'Fresh Farms', allergens: [], tags: ['fruit'] },
  { id: 'p5', name: 'Apple', category: 'Fruits & Vegetables', price: 120, unit: 'kg', emoji: '🍎', imageUrl: img('apple'), color: '#FF0000', stockStatus: 'in_stock', brand: 'Kashmir Valley', allergens: [], tags: ['fruit'] },
  { id: 'p6', name: 'Spinach', category: 'Fruits & Vegetables', price: 15, unit: 'bunch', emoji: '🥬', imageUrl: img('spinach'), color: '#2E7D32', stockStatus: 'low_stock', brand: 'Green Leaf', allergens: [], tags: ['vegetable', 'green'] },
  { id: 'p7', name: 'Capsicum', category: 'Fruits & Vegetables', price: 40, unit: 'kg', emoji: '🫑', imageUrl: img('capsicum'), color: '#4CAF50', stockStatus: 'in_stock', brand: 'Fresh Farms', allergens: [], tags: ['vegetable'] },
  { id: 'p8', name: 'Amul Milk 1L', category: 'Dairy', price: 56, unit: 'L', emoji: '🥛', imageUrl: img('milk'), color: '#FFFFFF', stockStatus: 'in_stock', brand: 'Amul', allergens: ['Dairy'], tags: ['dairy', 'staple'] },
  { id: 'p9', name: 'Amul Dahi 400g', category: 'Dairy', price: 40, unit: '400g', emoji: '🫗', imageUrl: img('curd'), color: '#FAFAFA', stockStatus: 'in_stock', brand: 'Amul', allergens: ['Dairy'], tags: ['dairy'] },
  { id: 'p10', name: 'Mother Dairy Milk 1L', category: 'Dairy', price: 58, unit: 'L', emoji: '🥛', imageUrl: img('milk2'), color: '#E8E8E8', stockStatus: 'in_stock', brand: 'Mother Dairy', allergens: ['Dairy'], tags: ['dairy', 'staple'] },
  { id: 'p11', name: 'Amul Paneer 200g', category: 'Dairy', price: 85, unit: '200g', emoji: '🧀', imageUrl: img('paneer'), color: '#FFFACD', stockStatus: 'in_stock', brand: 'Amul', allergens: ['Dairy'], tags: ['dairy', 'protein'] },
  { id: 'p12', name: 'Amul Butter 100g', category: 'Dairy', price: 52, unit: '100g', emoji: '🧈', imageUrl: img('butter'), color: '#FFD700', stockStatus: 'in_stock', brand: 'Amul', allergens: ['Dairy'], tags: ['dairy'] },
  { id: 'p13', name: 'Fresh Cream 200ml', category: 'Dairy', price: 65, unit: '200ml', emoji: '🥛', imageUrl: img('cream'), color: '#FFF8E1', stockStatus: 'in_stock', brand: 'Amul', allergens: ['Dairy'], tags: ['dairy'] },
  { id: 'p14', name: 'Rice 5kg', category: 'Staples', price: 225, unit: '5kg', emoji: '🍚', imageUrl: img('rice'), color: '#FAFAFA', stockStatus: 'in_stock', brand: 'India Gate', allergens: [], tags: ['staple', 'grain'] },
  { id: 'p15', name: 'Toor Dal 1kg', category: 'Staples', price: 120, unit: 'kg', emoji: '🫘', imageUrl: img('toordal'), color: '#FFD700', stockStatus: 'in_stock', brand: 'Tata Sampann', allergens: [], tags: ['staple', 'dal'] },
  { id: 'p16', name: 'Wheat Flour 5kg', category: 'Staples', price: 195, unit: '5kg', emoji: '🌾', imageUrl: img('flour'), color: '#F5DEB3', stockStatus: 'in_stock', brand: 'Ashirvaad', allergens: ['Gluten'], tags: ['staple', 'grain'] },
  { id: 'p17', name: 'Sugar 1kg', category: 'Staples', price: 42, unit: 'kg', emoji: '🍚', imageUrl: img('sugar'), color: '#FFFFFF', stockStatus: 'in_stock', brand: 'Tata', allergens: [], tags: ['staple'] },
  { id: 'p18', name: 'Cooking Oil 1L', category: 'Staples', price: 165, unit: 'L', emoji: '🫒', imageUrl: img('oil'), color: '#FFD700', stockStatus: 'in_stock', brand: 'Fortune', allergens: [], tags: ['staple', 'oil'] },
  { id: 'p19', name: 'Salt 1kg', category: 'Staples', price: 18, unit: 'kg', emoji: '🧂', imageUrl: img('salt'), color: '#FAFAFA', stockStatus: 'in_stock', brand: 'Tata', allergens: [], tags: ['staple'] },
  { id: 'p20', name: 'Maggi Noodles 12pk', category: 'Snacks', price: 144, unit: '12pk', emoji: '🍜', imageUrl: img('maggi'), color: '#FF6600', stockStatus: 'in_stock', brand: 'Maggi', allergens: ['Gluten'], tags: ['snack', 'instant'] },
  { id: 'p21', name: 'Lays Classic Chips', category: 'Snacks', price: 20, unit: 'packet', emoji: '🥨', imageUrl: img('lays'), color: '#FFD700', stockStatus: 'in_stock', brand: 'Lays', allergens: [], tags: ['snack', 'chips'] },
  { id: 'p22', name: 'Parle-G Biscuits', category: 'Snacks', price: 30, unit: '200g', emoji: '🍪', imageUrl: img('parleg'), color: '#8B4513', stockStatus: 'in_stock', brand: 'Parle', allergens: ['Gluten'], tags: ['snack', 'biscuit'] },
  { id: 'p23', name: 'Haldiram Namkeen', category: 'Snacks', price: 45, unit: '200g', emoji: '🥜', imageUrl: img('haldiram'), color: '#FF6347', stockStatus: 'in_stock', brand: 'Haldiram', allergens: ['Peanuts'], tags: ['snack', 'savory'] },
  { id: 'p24', name: 'Cold Coffee 200ml', category: 'Beverages', price: 60, unit: '200ml', emoji: '☕', imageUrl: img('coldcoffee'), color: '#6F4E37', stockStatus: 'in_stock', brand: 'Amul', allergens: ['Dairy'], tags: ['beverage', 'cold'] },
  { id: 'p25', name: 'Coca-Cola 750ml', category: 'Beverages', price: 40, unit: '750ml', emoji: '🥤', imageUrl: img('cocacola'), color: '#FF0000', stockStatus: 'in_stock', brand: 'Coca-Cola', allergens: [], tags: ['beverage', 'cold'] },
  { id: 'p26', name: 'Sprite 750ml', category: 'Beverages', price: 40, unit: '750ml', emoji: '🥤', imageUrl: img('sprite'), color: '#00FF00', stockStatus: 'in_stock', brand: 'Sprite', allergens: [], tags: ['beverage', 'cold'] },
  { id: 'p27', name: 'Mango Juice 1L', category: 'Beverages', price: 95, unit: 'L', emoji: '🥭', imageUrl: img('mangojuice'), color: '#FFA500', stockStatus: 'in_stock', brand: 'Real', allergens: [], tags: ['beverage', 'juice'] },
  { id: 'p28', name: 'Green Tea 25 bags', category: 'Beverages', price: 125, unit: '25bags', emoji: '🍵', imageUrl: img('greentea'), color: '#90EE90', stockStatus: 'in_stock', brand: 'Tata', allergens: [], tags: ['beverage', 'tea'] },
  { id: 'p29', name: 'Chai Masala 100g', category: 'Beverages', price: 45, unit: '100g', emoji: '🧉', imageUrl: img('chai'), color: '#8B4513', stockStatus: 'in_stock', brand: 'Tata', allergens: [], tags: ['beverage', 'tea'] },
  { id: 'p30', name: 'Shampoo 200ml', category: 'Personal Care', price: 180, unit: '200ml', emoji: '🧴', imageUrl: img('shampoo'), color: '#FF69B4', stockStatus: 'in_stock', brand: 'Dove', allergens: [], tags: ['personal'] },
  { id: 'p31', name: 'Face Wash 100g', category: 'Personal Care', price: 85, unit: '100g', emoji: '🧼', imageUrl: img('facewash'), color: '#00BFFF', stockStatus: 'in_stock', brand: 'Himalaya', allergens: [], tags: ['personal'] },
  { id: 'p32', name: 'Bath Soap 3pk', category: 'Personal Care', price: 75, unit: '3pk', emoji: '🫧', imageUrl: img('soap'), color: '#FFD700', stockStatus: 'in_stock', brand: 'Dove', allergens: [], tags: ['personal'] },
  { id: 'p33', name: 'Toothpaste 100g', category: 'Personal Care', price: 95, unit: '100g', emoji: '🪥', imageUrl: img('toothpaste'), color: '#00BFFF', stockStatus: 'in_stock', brand: 'Colgate', allergens: [], tags: ['personal'] },
  { id: 'p34', name: 'Detergent 1kg', category: 'Household', price: 150, unit: 'kg', emoji: '🧺', imageUrl: img('detergent'), color: '#4169E1', stockStatus: 'in_stock', brand: 'Surf Excel', allergens: [], tags: ['household', 'laundry'] },
  { id: 'p35', name: 'Floor Cleaner 1L', category: 'Household', price: 95, unit: 'L', emoji: '🧹', imageUrl: img('floorcleaner'), color: '#00FF7F', stockStatus: 'in_stock', brand: 'Lizol', allergens: [], tags: ['household', 'cleaning'] },
  { id: 'p36', name: 'Dishwash Liquid 500ml', category: 'Household', price: 80, unit: '500ml', emoji: '🍽️', imageUrl: img('dishwash'), color: '#FFD700', stockStatus: 'in_stock', brand: 'Vim', allergens: [], tags: ['household', 'cleaning'] },
  { id: 'p37', name: 'Toilet Cleaner 500ml', category: 'Household', price: 85, unit: '500ml', emoji: '🚽', imageUrl: img('toiletcleaner'), color: '#00BFFF', stockStatus: 'in_stock', brand: 'Harpic', allergens: [], tags: ['household', 'cleaning'] },
  { id: 'p38', name: 'Turmeric Powder 100g', category: 'Staples', price: 35, unit: '100g', emoji: '🧡', imageUrl: img('turmeric'), color: '#FF8C00', stockStatus: 'in_stock', brand: 'Tata Sampann', allergens: [], tags: ['spice'] },
  { id: 'p39', name: 'Red Chilli Powder 100g', category: 'Staples', price: 40, unit: '100g', emoji: '🌶️', imageUrl: img('chilli'), color: '#DC143C', stockStatus: 'low_stock', brand: 'Tata Sampann', allergens: [], tags: ['spice'] },
  { id: 'p40', name: 'Garam Masala 50g', category: 'Staples', price: 30, unit: '50g', emoji: '🧂', imageUrl: img('garammasala'), color: '#8B4513', stockStatus: 'in_stock', brand: 'MDH', allergens: [], tags: ['spice'] },
  { id: 'p41', name: 'Chicken 500g', category: 'Staples', price: 140, unit: '500g', emoji: '🍗', imageUrl: img('chicken'), color: '#FFB6C1', stockStatus: 'in_stock', brand: 'Fresh Meat', allergens: [], tags: ['meat', 'protein', 'non-veg'] },
  { id: 'p42', name: 'Eggs 6pk', category: 'Dairy', price: 36, unit: '6pk', emoji: '🥚', imageUrl: img('eggs'), color: '#FAFAFA', stockStatus: 'in_stock', brand: 'Farm Fresh', allergens: ['Egg'], tags: ['protein', 'eggs'] },
  { id: 'p43', name: 'Peanut Butter 250g', category: 'Snacks', price: 180, unit: '250g', emoji: '🥜', imageUrl: img('peanutbutter'), color: '#D2691E', stockStatus: 'in_stock', brand: 'Myfitness', allergens: ['Peanuts'], tags: ['snack', 'protein'] },
  { id: 'p44', name: 'Corn Flakes 500g', category: 'Snacks', price: 140, unit: '500g', emoji: '🥣', imageUrl: img('cornflakes'), color: '#FFD700', stockStatus: 'in_stock', brand: 'Kellogg\'s', allergens: ['Gluten'], tags: ['breakfast'] },
];

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.tags.some(t => t.includes(q))
  );
}

export function findBestMatch(query: string): Product | undefined {
  const q = query.toLowerCase();
  const words = q.split(/\s+/);
  let best: Product | undefined;
  let bestScore = 0;
  for (const p of products) {
    let score = 0;
    const name = p.name.toLowerCase();
    for (const w of words) {
      if (w.length < 2) continue;
      if (name.includes(w)) score += 10;
      if (p.tags.some(t => t.includes(w))) score += 5;
      if (p.brand.toLowerCase().includes(w)) score += 3;
      if (p.category.toLowerCase().includes(w)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best;
}
