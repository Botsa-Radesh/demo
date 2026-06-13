export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  unit: string;
  emoji: string;
  imageUrl: string;
  color: string;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  brand: string;
  allergens: Allergen[];
  tags: string[];
}

export type Category = 'Fruits & Vegetables' | 'Dairy' | 'Staples' | 'Snacks' | 'Beverages' | 'Personal Care' | 'Household';

export type Allergen = 'Peanuts' | 'Dairy' | 'Gluten' | 'Soy' | 'Egg' | 'Tree Nuts' | 'Seafood';

export type DietType = 'veg' | 'non-veg' | 'vegan';

export type SplitMode = 'family' | 'auto' | 'equal' | 'custom';

export type PaymentMethod = 'amazon_pay' | 'phonepay' | 'paytm' | 'gpay' | 'card';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered';

export type MicStatus = 'idle' | 'listening' | 'processing' | 'speaking';

export interface Member {
  id: string;
  name: string;
  avatar: string;
  role: 'creator' | 'member';
  diet: DietType;
  allergies: Allergen[];
  favoriteBrands: string[];
  dislikes: string[];
  isOnline: boolean;
  isTyping: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedBy: string;
  isShared: boolean;
  checked: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  servings: number;
  dietType: DietType;
  ingredients: RecipeIngredient[];
  totalPrice: number;
  prepTime: string;
  emoji: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  mappedProductId: string;
  price: number;
  allergens: Allergen[];
}

export interface Template {
  id: string;
  name: string;
  items: { productId: string; quantity: number }[];
  totalItems: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  splitMode: SplitMode;
  memberPayments: MemberPayment[];
  deliverySlot: string;
  status: OrderStatus;
  coinsEarned: number;
}

export interface MemberPayment {
  memberId: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'paid';
  coinsEarned: number;
}

export interface DeliverySlot {
  id: string;
  time: string;
  date: string;
  votes: string[];
  isWinner: boolean;
}

export interface VoiceCommandResult {
  intent: 'ADD_ITEM' | 'REMOVE_ITEM' | 'RECIPE' | 'BUDGET' | 'TEMPLATE' | 'SUMMARY' | 'CHECKOUT' | 'MARK_SHARED' | 'HIGHLIGHT' | 'REORDER' | 'UNKNOWN';
  params: Record<string, string>;
  originalText: string;
  response: string;
}

export interface CoinTransaction {
  id: string;
  amount: number;
  type: 'earned' | 'redeemed';
  reason: string;
  date: string;
}

export type { Category as CategoryType, Allergen as AllergenType, DietType as DietTypeEnum };
