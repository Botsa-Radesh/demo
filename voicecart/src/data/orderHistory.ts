import { Order } from '@/types';

const img = (id: string) => `https://picsum.photos/seed/${id}/200/200`;

export const orderHistory: Order[] = [
  {
    id: 'o1',
    date: '2026-06-10',
    items: [
      { id: 'ci1', product: { id: 'p8', name: 'Amul Milk 1L', category: 'Dairy', price: 56, unit: 'L', emoji: '🥛', imageUrl: img('milk'), color: '#FFFFFF', stockStatus: 'in_stock', brand: 'Amul', allergens: ['Dairy'], tags: ['dairy', 'staple'] }, quantity: 2, addedBy: 'm1', isShared: true, checked: false },
      { id: 'ci2', product: { id: 'p1', name: 'Onion', category: 'Fruits & Vegetables', price: 25, unit: 'kg', emoji: '🧅', imageUrl: img('onion'), color: '#C4A35A', stockStatus: 'in_stock', brand: 'Fresh Farms', allergens: [], tags: ['staple', 'vegetable'] }, quantity: 1, addedBy: 'm2', isShared: true, checked: false },
      { id: 'ci3', product: { id: 'p21', name: 'Lays Classic Chips', category: 'Snacks', price: 20, unit: 'packet', emoji: '🥨', imageUrl: img('lays'), color: '#FFD700', stockStatus: 'in_stock', brand: 'Lays', allergens: [], tags: ['snack', 'chips'] }, quantity: 3, addedBy: 'm3', isShared: false, checked: false },
    ],
    totalAmount: 227,
    splitMode: 'auto',
    memberPayments: [
      { memberId: 'm1', amount: 86, method: 'amazon_pay', status: 'paid', coinsEarned: 10 },
      { memberId: 'm2', amount: 70, method: 'amazon_pay', status: 'paid', coinsEarned: 8 },
      { memberId: 'm3', amount: 71, method: 'phonepay', status: 'paid', coinsEarned: 3 },
    ],
    deliverySlot: '7-9 AM',
    status: 'delivered',
    coinsEarned: 21,
  },
  {
    id: 'o2',
    date: '2026-06-07',
    items: [
      { id: 'ci4', product: { id: 'p14', name: 'Rice 5kg', category: 'Staples', price: 225, unit: '5kg', emoji: '🍚', imageUrl: img('rice'), color: '#FAFAFA', stockStatus: 'in_stock', brand: 'India Gate', allergens: [], tags: ['staple', 'grain'] }, quantity: 1, addedBy: 'm1', isShared: true, checked: false },
      { id: 'ci5', product: { id: 'p15', name: 'Toor Dal 1kg', category: 'Staples', price: 120, unit: 'kg', emoji: '🫘', imageUrl: img('toordal'), color: '#FFD700', stockStatus: 'in_stock', brand: 'Tata Sampann', allergens: [], tags: ['staple', 'dal'] }, quantity: 1, addedBy: 'm1', isShared: true, checked: false },
      { id: 'ci6', product: { id: 'p20', name: 'Maggi Noodles 12pk', category: 'Snacks', price: 144, unit: '12pk', emoji: '🍜', imageUrl: img('maggi'), color: '#FF6600', stockStatus: 'in_stock', brand: 'Maggi', allergens: ['Gluten'], tags: ['snack', 'instant'] }, quantity: 1, addedBy: 'm3', isShared: false, checked: false },
    ],
    totalAmount: 489,
    splitMode: 'auto',
    memberPayments: [
      { memberId: 'm1', amount: 250, method: 'amazon_pay', status: 'paid', coinsEarned: 28 },
      { memberId: 'm2', amount: 115, method: 'amazon_pay', status: 'paid', coinsEarned: 13 },
      { memberId: 'm3', amount: 124, method: 'gpay', status: 'paid', coinsEarned: 0 },
    ],
    deliverySlot: '7-9 AM',
    status: 'delivered',
    coinsEarned: 41,
  },
  {
    id: 'o3',
    date: '2026-06-04',
    items: [
      { id: 'ci7', product: { id: 'p10', name: 'Mother Dairy Milk 1L', category: 'Dairy', price: 58, unit: 'L', emoji: '🥛', imageUrl: img('milk2'), color: '#E8E8E8', stockStatus: 'in_stock', brand: 'Mother Dairy', allergens: ['Dairy'], tags: ['dairy', 'staple'] }, quantity: 1, addedBy: 'm2', isShared: false, checked: false },
      { id: 'ci8', product: { id: 'p4', name: 'Banana', category: 'Fruits & Vegetables', price: 40, unit: 'dozen', emoji: '🍌', imageUrl: img('banana'), color: '#FFE135', stockStatus: 'in_stock', brand: 'Fresh Farms', allergens: [], tags: ['fruit'] }, quantity: 1, addedBy: 'm1', isShared: true, checked: false },
    ],
    totalAmount: 170,
    splitMode: 'equal',
    memberPayments: [
      { memberId: 'm1', amount: 57, method: 'amazon_pay', status: 'paid', coinsEarned: 7 },
      { memberId: 'm2', amount: 57, method: 'amazon_pay', status: 'paid', coinsEarned: 7 },
      { memberId: 'm3', amount: 56, method: 'amazon_pay', status: 'paid', coinsEarned: 7 },
    ],
    deliverySlot: '10-12 PM',
    status: 'delivered',
    coinsEarned: 21,
  },
  {
    id: 'o4',
    date: '2026-06-01',
    items: [
      { id: 'ci9', product: { id: 'p25', name: 'Coca-Cola 750ml', category: 'Beverages', price: 40, unit: '750ml', emoji: '🥤', imageUrl: img('cocacola'), color: '#FF0000', stockStatus: 'in_stock', brand: 'Coca-Cola', allergens: [], tags: ['beverage', 'cold'] }, quantity: 4, addedBy: 'm3', isShared: true, checked: false },
      { id: 'ci10', product: { id: 'p21', name: 'Lays Classic Chips', category: 'Snacks', price: 20, unit: 'packet', emoji: '🥨', imageUrl: img('lays'), color: '#FFD700', stockStatus: 'in_stock', brand: 'Lays', allergens: [], tags: ['snack', 'chips'] }, quantity: 5, addedBy: 'm3', isShared: false, checked: false },
    ],
    totalAmount: 260,
    splitMode: 'custom',
    memberPayments: [
      { memberId: 'm1', amount: 80, method: 'amazon_pay', status: 'paid', coinsEarned: 10 },
      { memberId: 'm2', amount: 80, method: 'paytm', status: 'paid', coinsEarned: 0 },
      { memberId: 'm3', amount: 100, method: 'amazon_pay', status: 'paid', coinsEarned: 12 },
    ],
    deliverySlot: '7-9 AM',
    status: 'delivered',
    coinsEarned: 22,
  },
  {
    id: 'o5',
    date: '2026-05-28',
    items: [
      { id: 'ci11', product: { id: 'p18', name: 'Cooking Oil 1L', category: 'Staples', price: 165, unit: 'L', emoji: '🫒', imageUrl: img('oil'), color: '#FFD700', stockStatus: 'in_stock', brand: 'Fortune', allergens: [], tags: ['staple', 'oil'] }, quantity: 1, addedBy: 'm1', isShared: true, checked: false },
      { id: 'ci12', product: { id: 'p42', name: 'Eggs 6pk', category: 'Dairy', price: 36, unit: '6pk', emoji: '🥚', imageUrl: img('eggs'), color: '#FAFAFA', stockStatus: 'in_stock', brand: 'Farm Fresh', allergens: ['Egg'], tags: ['protein', 'eggs'] }, quantity: 2, addedBy: 'm1', isShared: false, checked: false },
    ],
    totalAmount: 237,
    splitMode: 'auto',
    memberPayments: [
      { memberId: 'm1', amount: 107, method: 'amazon_pay', status: 'paid', coinsEarned: 13 },
      { memberId: 'm2', amount: 55, method: 'amazon_pay', status: 'paid', coinsEarned: 7 },
      { memberId: 'm3', amount: 75, method: 'amazon_pay', status: 'paid', coinsEarned: 9 },
    ],
    deliverySlot: '7-9 AM',
    status: 'delivered',
    coinsEarned: 29,
  },
  {
    id: 'o6',
    date: '2026-05-25',
    items: [
      { id: 'ci13', product: { id: 'p30', name: 'Shampoo 200ml', category: 'Personal Care', price: 180, unit: '200ml', emoji: '🧴', imageUrl: img('shampoo'), color: '#FF69B4', stockStatus: 'in_stock', brand: 'Dove', allergens: [], tags: ['personal'] }, quantity: 1, addedBy: 'm2', isShared: false, checked: false },
    ],
    totalAmount: 180,
    splitMode: 'family',
    memberPayments: [
      { memberId: 'm2', amount: 180, method: 'amazon_pay', status: 'paid', coinsEarned: 22 },
      { memberId: 'm1', amount: 0, method: 'amazon_pay', status: 'paid', coinsEarned: 0 },
      { memberId: 'm3', amount: 0, method: 'amazon_pay', status: 'paid', coinsEarned: 0 },
    ],
    deliverySlot: '10-12 PM',
    status: 'delivered',
    coinsEarned: 22,
  },
  {
    id: 'o7',
    date: '2026-05-22',
    items: [
      { id: 'ci14', product: { id: 'p3', name: 'Potato', category: 'Fruits & Vegetables', price: 20, unit: 'kg', emoji: '🥔', imageUrl: img('potato'), color: '#C4A35A', stockStatus: 'in_stock', brand: 'Fresh Farms', allergens: [], tags: ['staple', 'vegetable'] }, quantity: 2, addedBy: 'm1', isShared: true, checked: false },
      { id: 'ci15', product: { id: 'p2', name: 'Tomato', category: 'Fruits & Vegetables', price: 30, unit: 'kg', emoji: '🍅', imageUrl: img('tomato'), color: '#FF4444', stockStatus: 'in_stock', brand: 'Fresh Farms', allergens: [], tags: ['staple', 'vegetable'] }, quantity: 1, addedBy: 'm2', isShared: true, checked: false },
    ],
    totalAmount: 70,
    splitMode: 'auto',
    memberPayments: [
      { memberId: 'm1', amount: 30, method: 'amazon_pay', status: 'paid', coinsEarned: 4 },
      { memberId: 'm2', amount: 20, method: 'amazon_pay', status: 'paid', coinsEarned: 3 },
      { memberId: 'm3', amount: 20, method: 'amazon_pay', status: 'paid', coinsEarned: 3 },
    ],
    deliverySlot: '7-9 AM',
    status: 'delivered',
    coinsEarned: 10,
  },
  {
    id: 'o8',
    date: '2026-05-19',
    items: [
      { id: 'ci16', product: { id: 'p11', name: 'Amul Paneer 200g', category: 'Dairy', price: 85, unit: '200g', emoji: '🧀', imageUrl: img('paneer'), color: '#FFFACD', stockStatus: 'in_stock', brand: 'Amul', allergens: ['Dairy'], tags: ['dairy', 'protein'] }, quantity: 2, addedBy: 'm2', isShared: false, checked: false },
      { id: 'ci17', product: { id: 'p12', name: 'Amul Butter 100g', category: 'Dairy', price: 52, unit: '100g', emoji: '🧈', imageUrl: img('butter'), color: '#FFD700', stockStatus: 'in_stock', brand: 'Amul', allergens: ['Dairy'], tags: ['dairy'] }, quantity: 1, addedBy: 'm1', isShared: true, checked: false },
    ],
    totalAmount: 222,
    splitMode: 'equal',
    memberPayments: [
      { memberId: 'm1', amount: 74, method: 'amazon_pay', status: 'paid', coinsEarned: 9 },
      { memberId: 'm2', amount: 74, method: 'amazon_pay', status: 'paid', coinsEarned: 9 },
      { memberId: 'm3', amount: 74, method: 'amazon_pay', status: 'paid', coinsEarned: 9 },
    ],
    deliverySlot: '7-9 AM',
    status: 'delivered',
    coinsEarned: 27,
  },
];
