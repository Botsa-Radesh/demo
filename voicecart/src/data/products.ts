import { Product } from '@/types';

function img(id: string): string {
  const queries: Record<string, string> = {
    onion: 'onion vegetable',
    tomato: 'tomato vegetable',
    potato: 'potato vegetable',
    banana: 'banana fruit bunch',
    apple: 'red apple fruit',
    spinach: 'spinach leaves green',
    capsicum: 'capsicum bell pepper',
    milk: 'milk glass bottle dairy',
    milk2: 'milk glass',
    curd: 'yogurt curd bowl',
    paneer: 'paneer indian cheese',
    butter: 'butter golden block',
    cream: 'fresh cream dairy',
    rice: 'rice grains white',
    toordal: 'toor dal lentils yellow',
    flour: 'wheat flour atta',
    sugar: 'sugar white granules',
    oil: 'cooking oil bottle',
    salt: 'salt white crystals',
    maggi: 'maggi noodles pack',
    lays: 'lays potato chips',
    parleg: 'parle glucose biscuit',
    haldiram: 'namkeen snack mixture',
    coldcoffee: 'cold coffee glass',
    cocacola: 'coca cola can',
    sprite: 'sprite lemon soda',
    mangojuice: 'mango juice glass',
    greentea: 'green tea cup',
    chai: 'chai masala tea',
    shampoo: 'shampoo bottle',
    facewash: 'face wash tube',
    soap: 'bath soap bar',
    toothpaste: 'toothpaste tube',
    detergent: 'detergent powder laundry',
    floorcleaner: 'floor cleaner bottle',
    dishwash: 'dish soap liquid',
    toiletcleaner: 'toilet cleaner bottle',
    turmeric: 'turmeric powder spice',
    chilli: 'red chilli powder spice',
    garammasala: 'garam masala powder',
    chicken: 'raw chicken meat',
    eggs: 'eggs white brown',
    peanutbutter: 'peanut butter jar',
    cornflakes: 'corn flakes cereal',
    carrot: 'carrot orange vegetable',
    cucumber: 'cucumber green vegetable',
    garlic: 'garlic cloves white',
    ginger: 'ginger root fresh',
    lemon: 'lemon yellow citrus',
    grapes: 'grapes purple bunch',
    orange: 'orange citrus fruit',
    moongdal: 'moong dal green lentils',
    channadal: 'chana dal chickpea lentil',
    mustardoil: 'mustard oil yellow bottle',
    ghee: 'ghee golden jar',
    coffee: 'instant coffee jar',
    bournvita: 'bournvita health drink',
    chips: 'potato chips crispy',
    oreo: 'oreo chocolate biscuit',
    bread: 'white bread loaf',
    poha: 'poha flattened rice',
    semolina: 'semolina rava white',
    coriander: 'coriander powder green',
    yogurt: 'flavored yogurt cup',
    panipuri: 'pani puri golgappa',
    fish: 'fresh fish seafood',
    mutton: 'mutton meat fresh',
    cheeseSlice: 'cheese slices pack',
    condensedmilk: 'condensed milk tin',
    handwash: 'hand wash bottle',
    sanitizer: 'hand sanitizer bottle',
    tissuepaper: 'tissue paper roll',
    mosquitorep: 'mosquito repellent coil',
  };
  const q = encodeURIComponent(queries[id] || id);
  return `https://source.unsplash.com/200x200/?${q}`;
}

export const products: Product[] = [
  // ── Fruits & Vegetables ──────────────────────────────────────────────────────
  { id: 'p1',      name: 'Onion',       category: 'Fruits & Vegetables', price: 25,  unit: '1kg',    emoji: '🧅', imageUrl: img('onion'),   color: '#C4A35A', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['staple', 'vegetable'], trending: true },
  { id: 'p1_500g', name: 'Onion',       category: 'Fruits & Vegetables', price: 13,  unit: '500g',   emoji: '🧅', imageUrl: img('onion'),   color: '#C4A35A', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['staple', 'vegetable'], trending: false },
  { id: 'p2',      name: 'Tomato',      category: 'Fruits & Vegetables', price: 30,  unit: '1kg',    emoji: '🍅', imageUrl: img('tomato'),  color: '#FF4444', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['staple', 'vegetable'], trending: true },
  { id: 'p2_500g', name: 'Tomato',      category: 'Fruits & Vegetables', price: 15,  unit: '500g',   emoji: '🍅', imageUrl: img('tomato'),  color: '#FF4444', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['staple', 'vegetable'], trending: false },
  { id: 'p3',      name: 'Potato',      category: 'Fruits & Vegetables', price: 20,  unit: '1kg',    emoji: '🥔', imageUrl: img('potato'),  color: '#C4A35A', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['staple', 'vegetable'], trending: true },
  { id: 'p3_500g', name: 'Potato',      category: 'Fruits & Vegetables', price: 10,  unit: '500g',   emoji: '🥔', imageUrl: img('potato'),  color: '#C4A35A', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['staple', 'vegetable'], trending: false },
  { id: 'p4',      name: 'Banana',      category: 'Fruits & Vegetables', price: 40,  unit: 'dozen',  emoji: '🍌', imageUrl: img('banana'),  color: '#FFE135', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['fruit'],               trending: true },
  { id: 'p5',      name: 'Apple',       category: 'Fruits & Vegetables', price: 120, unit: '1kg',    emoji: '🍎', imageUrl: img('apple'),   color: '#FF0000', stockStatus: 'in_stock', brand: 'Kashmir Valley',allergens: [],         tags: ['fruit'],               trending: true },
  { id: 'p5_500g', name: 'Apple',       category: 'Fruits & Vegetables', price: 60,  unit: '500g',   emoji: '🍎', imageUrl: img('apple'),   color: '#FF0000', stockStatus: 'in_stock', brand: 'Kashmir Valley',allergens: [],         tags: ['fruit'],               trending: false },
  { id: 'p6',      name: 'Spinach',     category: 'Fruits & Vegetables', price: 15,  unit: 'bunch',  emoji: '🥬', imageUrl: img('spinach'), color: '#2E7D32', stockStatus: 'low_stock',brand: 'Green Leaf',    allergens: [],         tags: ['vegetable', 'green'],  trending: true },
  { id: 'p7',      name: 'Capsicum',    category: 'Fruits & Vegetables', price: 40,  unit: '1kg',    emoji: '🫑', imageUrl: img('capsicum'),color: '#4CAF50', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['vegetable'],           trending: true },
  { id: 'p7_500g', name: 'Capsicum',    category: 'Fruits & Vegetables', price: 20,  unit: '500g',   emoji: '🫑', imageUrl: img('capsicum'),color: '#4CAF50', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['vegetable'],           trending: false },
  { id: 'p45',     name: 'Carrot',      category: 'Fruits & Vegetables', price: 30,  unit: '500g',   emoji: '🥕', imageUrl: img('carrot'),  color: '#FF8C00', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['vegetable'],           trending: true },
  { id: 'p46',     name: 'Cucumber',    category: 'Fruits & Vegetables', price: 18,  unit: '500g',   emoji: '🥒', imageUrl: img('cucumber'),color: '#228B22', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['vegetable'],           trending: true },
  { id: 'p47',     name: 'Garlic',      category: 'Fruits & Vegetables', price: 35,  unit: '250g',   emoji: '🧄', imageUrl: img('garlic'),  color: '#FFFACD', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['vegetable', 'staple'], trending: true },
  { id: 'p48',     name: 'Ginger',      category: 'Fruits & Vegetables', price: 25,  unit: '250g',   emoji: '🫚', imageUrl: img('ginger'),  color: '#D2691E', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['vegetable', 'staple'], trending: true },
  { id: 'p49',     name: 'Lemon',       category: 'Fruits & Vegetables', price: 20,  unit: '6pcs',   emoji: '🍋', imageUrl: img('lemon'),   color: '#FFD700', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['fruit'],               trending: true },
  { id: 'p50',     name: 'Grapes',      category: 'Fruits & Vegetables', price: 80,  unit: '500g',   emoji: '🍇', imageUrl: img('grapes'),  color: '#800080', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['fruit'],               trending: true },
  { id: 'p51',     name: 'Orange',      category: 'Fruits & Vegetables', price: 60,  unit: '4pcs',   emoji: '🍊', imageUrl: img('orange'),  color: '#FFA500', stockStatus: 'in_stock', brand: 'Fresh Farms',   allergens: [],         tags: ['fruit'],               trending: true },

  // ── Dairy ────────────────────────────────────────────────────────────────────
  { id: 'p8',  name: 'Amul Milk 1L',       category: 'Dairy', price: 56,  unit: '1L',    emoji: '🥛', imageUrl: img('milk'),          color: '#FFFFFF', stockStatus: 'in_stock', brand: 'Amul',        allergens: ['Dairy'], tags: ['dairy', 'staple'],  trending: true },
  { id: 'p9',  name: 'Amul Dahi 400g',     category: 'Dairy', price: 40,  unit: '400g',  emoji: '🫗', imageUrl: img('curd'),          color: '#FAFAFA', stockStatus: 'in_stock', brand: 'Amul',        allergens: ['Dairy'], tags: ['dairy'],             trending: true },
  { id: 'p10', name: 'Mother Dairy Milk 1L',category: 'Dairy', price: 58,  unit: '1L',    emoji: '🥛', imageUrl: img('milk2'),         color: '#E8E8E8', stockStatus: 'in_stock', brand: 'Mother Dairy',allergens: ['Dairy'], tags: ['dairy', 'staple'],  trending: true },
  { id: 'p11', name: 'Amul Paneer 200g',   category: 'Dairy', price: 85,  unit: '200g',  emoji: '🧀', imageUrl: img('paneer'),        color: '#FFFACD', stockStatus: 'in_stock', brand: 'Amul',        allergens: ['Dairy'], tags: ['dairy', 'protein'], trending: true },
  { id: 'p12', name: 'Amul Butter 100g',   category: 'Dairy', price: 52,  unit: '100g',  emoji: '🧈', imageUrl: img('butter'),        color: '#FFD700', stockStatus: 'in_stock', brand: 'Amul',        allergens: ['Dairy'], tags: ['dairy'],             trending: true },
  { id: 'p13', name: 'Fresh Cream 200ml',  category: 'Dairy', price: 65,  unit: '200ml', emoji: '🥛', imageUrl: img('cream'),         color: '#FFF8E1', stockStatus: 'in_stock', brand: 'Amul',        allergens: ['Dairy'], tags: ['dairy'],             trending: true },
  { id: 'p42', name: 'Eggs 6pk',           category: 'Dairy', price: 36,  unit: '6pk',   emoji: '🥚', imageUrl: img('eggs'),          color: '#FAFAFA', stockStatus: 'in_stock', brand: 'Farm Fresh',  allergens: ['Egg'],   tags: ['protein', 'eggs'],  trending: true },
  { id: 'p52', name: 'Amul Ghee 500ml',    category: 'Dairy', price: 290, unit: '500ml', emoji: '🧈', imageUrl: img('ghee'),          color: '#FFD700', stockStatus: 'in_stock', brand: 'Amul',        allergens: ['Dairy'], tags: ['dairy', 'staple'],  trending: true },
  { id: 'p53', name: 'Cheese Slices 10pk', category: 'Dairy', price: 110, unit: '10pk',  emoji: '🧀', imageUrl: img('cheeseSlice'),   color: '#FFD700', stockStatus: 'in_stock', brand: 'Amul',        allergens: ['Dairy'], tags: ['dairy'],             trending: true },
  { id: 'p54', name: 'Strawberry Yogurt',  category: 'Dairy', price: 30,  unit: '100g',  emoji: '🍓', imageUrl: img('yogurt'),        color: '#FF69B4', stockStatus: 'in_stock', brand: 'Epigamia',    allergens: ['Dairy'], tags: ['dairy'],             trending: true },

  // ── Staples ──────────────────────────────────────────────────────────────────
  { id: 'p14',     name: 'Rice',              category: 'Staples', price: 45,  unit: '1kg',   emoji: '🍚', imageUrl: img('rice'),       color: '#FAFAFA', stockStatus: 'in_stock', brand: 'India Gate',   allergens: [],         tags: ['staple', 'grain'], trending: true },
  { id: 'p14_500g',name: 'Rice',              category: 'Staples', price: 23,  unit: '500g',  emoji: '🍚', imageUrl: img('rice'),       color: '#FAFAFA', stockStatus: 'in_stock', brand: 'India Gate',   allergens: [],         tags: ['staple', 'grain'], trending: false },
  { id: 'p15',     name: 'Toor Dal 1kg',      category: 'Staples', price: 120, unit: '1kg',   emoji: '🫘', imageUrl: img('toordal'),    color: '#FFD700', stockStatus: 'in_stock', brand: 'Tata Sampann', allergens: [],         tags: ['staple', 'dal'],   trending: true },
  { id: 'p16',     name: 'Wheat Flour 1kg',   category: 'Staples', price: 42,  unit: '1kg',   emoji: '🌾', imageUrl: img('flour'),      color: '#F5DEB3', stockStatus: 'in_stock', brand: 'Ashirvaad',    allergens: ['Gluten'], tags: ['staple', 'grain'], trending: true },
  { id: 'p16_5kg', name: 'Wheat Flour 5kg',   category: 'Staples', price: 195, unit: '5kg',   emoji: '🌾', imageUrl: img('flour'),      color: '#F5DEB3', stockStatus: 'in_stock', brand: 'Ashirvaad',    allergens: ['Gluten'], tags: ['staple', 'grain'], trending: false },
  { id: 'p17',     name: 'Sugar 1kg',          category: 'Staples', price: 42,  unit: '1kg',   emoji: '🍚', imageUrl: img('sugar'),      color: '#FFFFFF', stockStatus: 'in_stock', brand: 'Tata',         allergens: [],         tags: ['staple'],           trending: true },
  { id: 'p18',     name: 'Cooking Oil 1L',     category: 'Staples', price: 165, unit: '1L',    emoji: '🫒', imageUrl: img('oil'),        color: '#FFD700', stockStatus: 'in_stock', brand: 'Fortune',      allergens: [],         tags: ['staple', 'oil'],   trending: true },
  { id: 'p19',     name: 'Salt 1kg',            category: 'Staples', price: 18,  unit: '1kg',   emoji: '🧂', imageUrl: img('salt'),       color: '#FAFAFA', stockStatus: 'in_stock', brand: 'Tata',         allergens: [],         tags: ['staple'],           trending: true },
  { id: 'p38',     name: 'Turmeric Powder 100g',category: 'Staples', price: 35,  unit: '100g',  emoji: '🧡', imageUrl: img('turmeric'),   color: '#FF8C00', stockStatus: 'in_stock', brand: 'Tata Sampann', allergens: [],         tags: ['spice'],            trending: true },
  { id: 'p39',     name: 'Red Chilli Powder',   category: 'Staples', price: 40,  unit: '100g',  emoji: '🌶️', imageUrl: img('chilli'),    color: '#DC143C', stockStatus: 'low_stock',brand: 'Tata Sampann', allergens: [],         tags: ['spice'],            trending: true },
  { id: 'p40',     name: 'Garam Masala 50g',    category: 'Staples', price: 30,  unit: '50g',   emoji: '🧂', imageUrl: img('garammasala'),color: '#8B4513', stockStatus: 'in_stock', brand: 'MDH',          allergens: [],         tags: ['spice'],            trending: true },
  { id: 'p41',     name: 'Chicken 500g',        category: 'Staples', price: 140, unit: '500g',  emoji: '🍗', imageUrl: img('chicken'),    color: '#FFB6C1', stockStatus: 'in_stock', brand: 'Fresh Meat',   allergens: [],         tags: ['meat', 'protein', 'non-veg'], trending: true },
  { id: 'p55',     name: 'Moong Dal 500g',      category: 'Staples', price: 65,  unit: '500g',  emoji: '🫘', imageUrl: img('moongdal'),   color: '#9ACD32', stockStatus: 'in_stock', brand: 'Tata Sampann', allergens: [],         tags: ['staple', 'dal'],   trending: true },
  { id: 'p56',     name: 'Chana Dal 500g',      category: 'Staples', price: 70,  unit: '500g',  emoji: '🫘', imageUrl: img('channadal'),  color: '#DAA520', stockStatus: 'in_stock', brand: 'Tata Sampann', allergens: [],         tags: ['staple', 'dal'],   trending: true },
  { id: 'p57',     name: 'Mustard Oil 1L',      category: 'Staples', price: 180, unit: '1L',    emoji: '🫒', imageUrl: img('mustardoil'), color: '#FFD700', stockStatus: 'in_stock', brand: 'Patanjali',    allergens: [],         tags: ['staple', 'oil'],   trending: true },
  { id: 'p58',     name: 'Poha 500g',           category: 'Staples', price: 35,  unit: '500g',  emoji: '🍽️', imageUrl: img('poha'),      color: '#FFFACD', stockStatus: 'in_stock', brand: 'Tata',         allergens: [],         tags: ['staple', 'grain'], trending: true },
  { id: 'p59',     name: 'Sooji / Rava 500g',   category: 'Staples', price: 30,  unit: '500g',  emoji: '🌾', imageUrl: img('semolina'),   color: '#FAEBD7', stockStatus: 'in_stock', brand: 'MTR',          allergens: ['Gluten'], tags: ['staple', 'grain'], trending: true },
  { id: 'p60',     name: 'Coriander Powder 100g',category: 'Staples', price: 25,  unit: '100g', emoji: '🌿', imageUrl: img('coriander'),  color: '#228B22', stockStatus: 'in_stock', brand: 'Tata Sampann', allergens: [],         tags: ['spice'],            trending: true },
  { id: 'p61',     name: 'Fish 500g',           category: 'Staples', price: 160, unit: '500g',  emoji: '🐟', imageUrl: img('fish'),       color: '#87CEEB', stockStatus: 'in_stock', brand: 'Fresh Catch',  allergens: ['Fish'],   tags: ['seafood', 'protein', 'non-veg'], trending: true },
  { id: 'p62',     name: 'Mutton 500g',         category: 'Staples', price: 320, unit: '500g',  emoji: '🥩', imageUrl: img('mutton'),     color: '#8B0000', stockStatus: 'in_stock', brand: 'Fresh Meat',   allergens: [],         tags: ['meat', 'protein', 'non-veg'], trending: true },
  { id: 'p63',     name: 'Bread',               category: 'Staples', price: 35,  unit: 'loaf',  emoji: '🍞', imageUrl: img('bread'),      color: '#DEB887', stockStatus: 'in_stock', brand: 'Britannia',    allergens: ['Gluten'], tags: ['staple', 'grain'], trending: true },

  // ── Snacks ───────────────────────────────────────────────────────────────────
  { id: 'p20', name: 'Maggi Noodles 12pk',category: 'Snacks', price: 144, unit: '12pk',  emoji: '🍜', imageUrl: img('maggi'),        color: '#FF6600', stockStatus: 'in_stock', brand: 'Maggi',       allergens: ['Gluten'],   tags: ['snack', 'instant'],   trending: true },
  { id: 'p21', name: 'Lays Classic Chips', category: 'Snacks', price: 20,  unit: 'packet',emoji: '🥨', imageUrl: img('lays'),        color: '#FFD700', stockStatus: 'in_stock', brand: 'Lays',        allergens: [],           tags: ['snack', 'chips'],     trending: true },
  { id: 'p22', name: 'Parle-G Biscuits',  category: 'Snacks', price: 30,  unit: '200g',  emoji: '🍪', imageUrl: img('parleg'),       color: '#8B4513', stockStatus: 'in_stock', brand: 'Parle',       allergens: ['Gluten'],   tags: ['snack', 'biscuit'],   trending: true },
  { id: 'p23', name: 'Haldiram Namkeen',  category: 'Snacks', price: 45,  unit: '200g',  emoji: '🥜', imageUrl: img('haldiram'),     color: '#FF6347', stockStatus: 'in_stock', brand: 'Haldiram',    allergens: ['Peanuts'],  tags: ['snack', 'savory'],    trending: true },
  { id: 'p43', name: 'Peanut Butter 250g',category: 'Snacks', price: 180, unit: '250g',  emoji: '🥜', imageUrl: img('peanutbutter'), color: '#D2691E', stockStatus: 'in_stock', brand: 'Myfitness',   allergens: ['Peanuts'],  tags: ['snack', 'protein'],   trending: true },
  { id: 'p44', name: 'Corn Flakes 500g',  category: 'Snacks', price: 140, unit: '500g',  emoji: '🥣', imageUrl: img('cornflakes'),   color: '#FFD700', stockStatus: 'in_stock', brand: "Kellogg's",   allergens: ['Gluten'],   tags: ['breakfast'],          trending: true },
  { id: 'p64', name: 'Oreo Biscuits',     category: 'Snacks', price: 35,  unit: '120g',  emoji: '🍪', imageUrl: img('oreo'),         color: '#1a1a1a', stockStatus: 'in_stock', brand: 'Oreo',        allergens: ['Gluten', 'Dairy'], tags: ['snack', 'biscuit'], trending: true },
  { id: 'p65', name: 'Cream Biscuits',    category: 'Snacks', price: 25,  unit: '120g',  emoji: '🍪', imageUrl: img('chips'),        color: '#DEB887', stockStatus: 'in_stock', brand: 'Britannia',   allergens: ['Gluten'],   tags: ['snack', 'biscuit'],   trending: true },
 

  // ── Beverages ────────────────────────────────────────────────────────────────
  { id: 'p24', name: 'Cold Coffee 200ml', category: 'Beverages', price: 60,  unit: '200ml',  emoji: '☕', imageUrl: img('coldcoffee'), color: '#6F4E37', stockStatus: 'in_stock', brand: 'Amul',      allergens: ['Dairy'], tags: ['beverage', 'cold'],  trending: true },
  { id: 'p25', name: 'Coca-Cola 750ml',   category: 'Beverages', price: 40,  unit: '750ml',  emoji: '🥤', imageUrl: img('cocacola'),   color: '#FF0000', stockStatus: 'in_stock', brand: 'Coca-Cola', allergens: [],        tags: ['beverage', 'cold'],  trending: true },
  { id: 'p26', name: 'Sprite 750ml',      category: 'Beverages', price: 40,  unit: '750ml',  emoji: '🥤', imageUrl: img('sprite'),     color: '#00FF00', stockStatus: 'in_stock', brand: 'Sprite',    allergens: [],        tags: ['beverage', 'cold'],  trending: true },
  { id: 'p27', name: 'Mango Juice 1L',    category: 'Beverages', price: 95,  unit: '1L',     emoji: '🥭', imageUrl: img('mangojuice'), color: '#FFA500', stockStatus: 'in_stock', brand: 'Real',      allergens: [],        tags: ['beverage', 'juice'], trending: true },
  { id: 'p28', name: 'Green Tea 25 bags', category: 'Beverages', price: 125, unit: '25bags', emoji: '🍵', imageUrl: img('greentea'),   color: '#90EE90', stockStatus: 'in_stock', brand: 'Tata',      allergens: [],        tags: ['beverage', 'tea'],   trending: true },
  { id: 'p29', name: 'Chai Masala 100g',  category: 'Beverages', price: 45,  unit: '100g',   emoji: '🧉', imageUrl: img('chai'),       color: '#8B4513', stockStatus: 'in_stock', brand: 'Tata',      allergens: [],        tags: ['beverage', 'tea'],   trending: true },
  { id: 'p68', name: 'Nescafe Coffee 50g',category: 'Beverages', price: 145, unit: '50g',    emoji: '☕', imageUrl: img('coffee'),     color: '#6F4E37', stockStatus: 'in_stock', brand: 'Nescafe',   allergens: [],        tags: ['beverage', 'coffee'],trending: true },
  { id: 'p69', name: 'Bournvita 500g',    category: 'Beverages', price: 270, unit: '500g',   emoji: '🥛', imageUrl: img('bournvita'),  color: '#8B4513', stockStatus: 'in_stock', brand: 'Cadbury',   allergens: ['Dairy'], tags: ['beverage', 'health'],trending: true },

  // ── Personal Care ─────────────────────────────────────────────────────────────
  { id: 'p30', name: 'Shampoo 200ml',     category: 'Personal Care', price: 180, unit: '200ml', emoji: '🧴', imageUrl: img('shampoo'),     color: '#FF69B4', stockStatus: 'in_stock', brand: 'Dove',      allergens: [], tags: ['personal'], trending: true },
  { id: 'p31', name: 'Face Wash 100g',    category: 'Personal Care', price: 85,  unit: '100g',  emoji: '🧼', imageUrl: img('facewash'),    color: '#00BFFF', stockStatus: 'in_stock', brand: 'Himalaya',  allergens: [], tags: ['personal'], trending: true },
  { id: 'p32', name: 'Bath Soap 3pk',     category: 'Personal Care', price: 75,  unit: '3pk',   emoji: '🫧', imageUrl: img('soap'),        color: '#FFD700', stockStatus: 'in_stock', brand: 'Dove',      allergens: [], tags: ['personal'], trending: true },
  { id: 'p33', name: 'Toothpaste 100g',   category: 'Personal Care', price: 95,  unit: '100g',  emoji: '🪥', imageUrl: img('toothpaste'),  color: '#00BFFF', stockStatus: 'in_stock', brand: 'Colgate',   allergens: [], tags: ['personal'], trending: true },
  { id: 'p70', name: 'Hand Wash 200ml',   category: 'Personal Care', price: 65,  unit: '200ml', emoji: '🧴', imageUrl: img('handwash'),    color: '#98FB98', stockStatus: 'in_stock', brand: 'Dettol',    allergens: [], tags: ['personal'], trending: true },
  { id: 'p71', name: 'Hand Sanitizer 100ml',category: 'Personal Care', price: 55, unit: '100ml',emoji: '🖐️', imageUrl: img('sanitizer'),  color: '#00CED1', stockStatus: 'in_stock', brand: 'Dettol',    allergens: [], tags: ['personal'], trending: true },

  // ── Household ─────────────────────────────────────────────────────────────────
  { id: 'p34', name: 'Detergent 1kg',         category: 'Household', price: 150, unit: '1kg',   emoji: '🧺', imageUrl: img('detergent'),     color: '#4169E1', stockStatus: 'in_stock', brand: 'Surf Excel', allergens: [], tags: ['household', 'laundry'],  trending: true },
  { id: 'p35', name: 'Floor Cleaner 1L',       category: 'Household', price: 95,  unit: '1L',    emoji: '🧹', imageUrl: img('floorcleaner'),  color: '#00FF7F', stockStatus: 'in_stock', brand: 'Lizol',      allergens: [], tags: ['household', 'cleaning'], trending: true },
  { id: 'p36', name: 'Dishwash Liquid 500ml',  category: 'Household', price: 80,  unit: '500ml', emoji: '🍽️', imageUrl: img('dishwash'),     color: '#FFD700', stockStatus: 'in_stock', brand: 'Vim',        allergens: [], tags: ['household', 'cleaning'], trending: true },
  { id: 'p37', name: 'Toilet Cleaner 500ml',   category: 'Household', price: 85,  unit: '500ml', emoji: '🚽', imageUrl: img('toiletcleaner'), color: '#00BFFF', stockStatus: 'in_stock', brand: 'Harpic',     allergens: [], tags: ['household', 'cleaning'], trending: true },
  { id: 'p72', name: 'Tissue Paper 100 sheets',category: 'Household', price: 70,  unit: '100pcs',emoji: '🧻', imageUrl: img('tissuepaper'),   color: '#FFFAFA', stockStatus: 'in_stock', brand: 'Kleenex',    allergens: [], tags: ['household'],            trending: true },
  { id: 'p73', name: 'Mosquito Repellent',     category: 'Household', price: 45,  unit: '10coils',emoji: '🪰',imageUrl: img('mosquitorep'),   color: '#556B2F', stockStatus: 'in_stock', brand: 'Good Night', allergens: [], tags: ['household'],            trending: true },
];

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

// Synonym map — common alternate terms that map to searchable keywords
const SYNONYMS: Record<string, string[]> = {
  veggies: ['vegetable', 'vegetables'],
  veggie: ['vegetable'],
  veg: ['vegetable', 'vegetables'],
  sabzi: ['vegetable'],
  sabji: ['vegetable'],
  greens: ['vegetable', 'green'],
  fruits: ['fruit'],
  dairy: ['dairy', 'milk'],
  drinks: ['beverage'],
  bevs: ['beverage'],
  soda: ['beverage', 'cold'],
  juice: ['juice', 'beverage'],
  tea: ['tea', 'beverage'],
  coffee: ['coffee', 'beverage'],
  dal: ['dal', 'lentil'],
  lentils: ['dal'],
  pulses: ['dal'],
  grain: ['grain', 'staple'],
  grains: ['grain', 'staple'],
  atta: ['flour', 'wheat'],
  flour: ['flour', 'wheat'],
  masala: ['spice', 'masala'],
  spices: ['spice'],
  oil: ['oil', 'cooking'],
  oils: ['oil'],
  snack: ['snack'],
  snacks: ['snack'],
  chips: ['chips', 'snack'],
  biscuit: ['biscuit', 'snack'],
  biscuits: ['biscuit', 'snack'],
  cookies: ['biscuit'],
  soap: ['personal', 'soap'],
  cleaning: ['cleaning', 'household'],
  laundry: ['laundry', 'household'],
  meat: ['meat', 'protein', 'non-veg'],
  nonveg: ['non-veg', 'meat'],
  protein: ['protein'],
  breakfast: ['breakfast'],
  cereal: ['breakfast', 'cereal'],
  noodles: ['instant', 'snack'],
  pasta: ['instant'],
  butter: ['butter', 'dairy'],
  cheese: ['dairy', 'cheese'],
  paneer: ['dairy', 'protein'],
  ghee: ['dairy', 'staple'],
  curd: ['dairy'],
  dahi: ['dairy'],
  yogurt: ['dairy'],
  eggs: ['eggs', 'protein'],
  egg: ['eggs', 'protein'],
  chicken: ['meat', 'protein', 'non-veg'],
  fish: ['seafood', 'protein', 'non-veg'],
  mutton: ['meat', 'protein', 'non-veg'],
};

function scoreProduct(product: Product, words: string[]): number {
  let score = 0;
  const name = product.name.toLowerCase();
  const brand = product.brand.toLowerCase();
  const cat = product.category.toLowerCase();
  const unit = product.unit.toLowerCase();

  for (const w of words) {
    if (w.length < 2) continue;

    // Exact full name match — highest priority
    if (name === w) score += 100;
    // Name starts with the word
    else if (name.startsWith(w)) score += 60;
    // Name contains the word
    else if (name.includes(w)) score += 40;

    // Brand match
    if (brand === w) score += 30;
    else if (brand.includes(w)) score += 15;

    // Tag match
    if (product.tags.some(t => t === w)) score += 25;
    else if (product.tags.some(t => t.includes(w))) score += 12;

    // Category match
    if (cat.includes(w)) score += 10;

    // Unit match (e.g. "1kg", "500g")
    if (unit.includes(w)) score += 5;
  }

  return score;
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  // Expand query words with synonyms
  const rawWords = q.split(/\s+/);
  const expandedWords = new Set<string>(rawWords);
  for (const w of rawWords) {
    (SYNONYMS[w] || []).forEach(s => expandedWords.add(s));
  }
  const words = Array.from(expandedWords);

  // Score every product
  const scored = products.map(p => ({ p, score: scoreProduct(p, words) }));

  // Keep products with any score > 0, sorted best first
  const matched = scored
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.p);

  // If we have good exact/near matches (score ≥ 40), also pull in related
  // products from the same category to pad results (like Amazon's "related" section)
  if (matched.length > 0) {
    const topScore = scored.filter(x => x.score > 0)[0]?.score ?? 0;
    if (topScore >= 40) {
      const topCategories = new Set(matched.slice(0, 3).map(p => p.category));
      const related = products.filter(p =>
        !matched.includes(p) &&
        topCategories.has(p.category)
      );
      return [...matched, ...related];
    }
  }

  return matched;
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
