import { Recipe } from '@/types';

export const recipes: Recipe[] = [
  {
    id: 'r1',
    name: 'Butter Chicken',
    servings: 4,
    dietType: 'non-veg',
    emoji: '🍛',
    prepTime: '45 min',
    totalPrice: 485,
    ingredients: [
      { name: 'Chicken', quantity: '500g', mappedProductId: 'p41', price: 140, allergens: [] },
      { name: 'Amul Butter', quantity: '100g', mappedProductId: 'p12', price: 52, allergens: ['Dairy'] },
      { name: 'Fresh Cream', quantity: '200ml', mappedProductId: 'p13', price: 65, allergens: ['Dairy'] },
      { name: 'Onion', quantity: '3 medium', mappedProductId: 'p1', price: 38, allergens: [] },
      { name: 'Tomato', quantity: '4 medium', mappedProductId: 'p2', price: 60, allergens: [] },
      { name: 'Red Chilli Powder', quantity: '2 tsp', mappedProductId: 'p39', price: 5, allergens: [] },
      { name: 'Garam Masala', quantity: '1 tsp', mappedProductId: 'p40', price: 5, allergens: [] },
      { name: 'Cooking Oil', quantity: '2 tbsp', mappedProductId: 'p18', price: 10, allergens: [] },
    ],
  },
  {
    id: 'r2',
    name: 'Paneer Butter Masala',
    servings: 4,
    dietType: 'veg',
    emoji: '🧈',
    prepTime: '35 min',
    totalPrice: 380,
    ingredients: [
      { name: 'Amul Paneer', quantity: '200g', mappedProductId: 'p11', price: 85, allergens: ['Dairy'] },
      { name: 'Amul Butter', quantity: '50g', mappedProductId: 'p12', price: 26, allergens: ['Dairy'] },
      { name: 'Fresh Cream', quantity: '100ml', mappedProductId: 'p13', price: 33, allergens: ['Dairy'] },
      { name: 'Onion', quantity: '2 medium', mappedProductId: 'p1', price: 25, allergens: [] },
      { name: 'Tomato', quantity: '3 medium', mappedProductId: 'p2', price: 45, allergens: [] },
      { name: 'Red Chilli Powder', quantity: '1 tsp', mappedProductId: 'p39', price: 3, allergens: [] },
      { name: 'Garam Masala', quantity: '1 tsp', mappedProductId: 'p40', price: 5, allergens: [] },
    ],
  },
  {
    id: 'r3',
    name: 'Pasta Alfredo',
    servings: 2,
    dietType: 'veg',
    emoji: '🍝',
    prepTime: '25 min',
    totalPrice: 310,
    ingredients: [
      { name: 'Amul Butter', quantity: '50g', mappedProductId: 'p12', price: 26, allergens: ['Dairy'] },
      { name: 'Fresh Cream', quantity: '200ml', mappedProductId: 'p13', price: 65, allergens: ['Dairy'] },
      { name: 'Capsicum', quantity: '1 medium', mappedProductId: 'p7', price: 20, allergens: [] },
      { name: 'Tomato', quantity: '2 medium', mappedProductId: 'p2', price: 30, allergens: [] },
      { name: 'Amul Dahi', quantity: '100g', mappedProductId: 'p9', price: 10, allergens: ['Dairy'] },
      { name: 'Salt', quantity: 'to taste', mappedProductId: 'p19', price: 1, allergens: [] },
    ],
  },
  {
    id: 'r4',
    name: 'Dal Tadka',
    servings: 4,
    dietType: 'veg',
    emoji: '🫘',
    prepTime: '30 min',
    totalPrice: 205,
    ingredients: [
      { name: 'Toor Dal', quantity: '250g', mappedProductId: 'p15', price: 30, allergens: [] },
      { name: 'Onion', quantity: '1 medium', mappedProductId: 'p1', price: 13, allergens: [] },
      { name: 'Tomato', quantity: '2 medium', mappedProductId: 'p2', price: 30, allergens: [] },
      { name: 'Turmeric Powder', quantity: '1 tsp', mappedProductId: 'p38', price: 2, allergens: [] },
      { name: 'Cooking Oil', quantity: '2 tbsp', mappedProductId: 'p18', price: 10, allergens: [] },
    ],
  },
  {
    id: 'r5',
    name: 'Masala Chai',
    servings: 4,
    dietType: 'veg',
    emoji: '☕',
    prepTime: '10 min',
    totalPrice: 85,
    ingredients: [
      { name: 'Amul Milk 1L', quantity: '500ml', mappedProductId: 'p8', price: 28, allergens: ['Dairy'] },
      { name: 'Chai Masala', quantity: '2 tsp', mappedProductId: 'p29', price: 3, allergens: [] },
      { name: 'Sugar', quantity: '4 tsp', mappedProductId: 'p17', price: 2, allergens: [] },
      { name: 'Amul Dahi', quantity: '2 tbsp', mappedProductId: 'p9', price: 5, allergens: ['Dairy'] },
    ],
  },
];

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find(r => r.id === id);
}

export function scaleRecipe(recipe: Recipe, targetServings: number): Recipe {
  const scale = targetServings / recipe.servings;
  return {
    ...recipe,
    servings: targetServings,
    ingredients: recipe.ingredients.map(ing => ({
      ...ing,
      price: Math.round(ing.price * scale),
    })),
    totalPrice: Math.round(recipe.totalPrice * scale),
  };
}
