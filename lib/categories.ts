// lib/categories.ts (Complete file)
export interface SubCategory {
  id: string;
  name: string;
  parentId: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: SubCategory[];
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'fashion',
    name: 'Fashion',
    icon: '👕',
    subcategories: [
      { id: 'mens_clothing', name: "Men's Clothing", parentId: 'fashion' },
      { id: 'womens_clothing', name: "Women's Clothing", parentId: 'fashion' },
      { id: 'kids_clothing', name: "Kids' Clothing", parentId: 'fashion' },
      { id: 'footwear', name: 'Footwear', parentId: 'fashion' },
      { id: 'accessories', name: 'Accessories', parentId: 'fashion' },
      { id: 'traditional_wear', name: 'Traditional Wear', parentId: 'fashion' },
      { id: 'sportswear', name: 'Sportswear', parentId: 'fashion' },
    ]
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '📱',
    subcategories: [
      { id: 'smartphones', name: 'Smartphones', parentId: 'electronics' },
      { id: 'laptops', name: 'Laptops & Computers', parentId: 'electronics' },
      { id: 'audio', name: 'Audio (Headphones/Speakers)', parentId: 'electronics' },
      { id: 'gaming', name: 'Gaming', parentId: 'electronics' },
      { id: 'smartwatches', name: 'Smartwatches', parentId: 'electronics' },
      { id: 'cameras', name: 'Cameras', parentId: 'electronics' },
      { id: 'tv_home_theater', name: 'TV & Home Theater', parentId: 'electronics' },
      { id: 'accessories', name: 'Accessories', parentId: 'electronics' },
    ]
  },
  {
    id: 'beauty',
    name: 'Beauty & Makeup',
    icon: '💄',
    subcategories: [
      { id: 'makeup', name: 'Makeup', parentId: 'beauty' },
      { id: 'skincare', name: 'Skincare', parentId: 'beauty' },
      { id: 'haircare', name: 'Haircare', parentId: 'beauty' },
      { id: 'fragrance', name: 'Fragrance', parentId: 'beauty' },
      { id: 'personal_care', name: 'Personal Care', parentId: 'beauty' },
      { id: 'mens_grooming', name: "Men's Grooming", parentId: 'beauty' },
    ]
  },
  {
    id: 'home',
    name: 'Home & Living',
    icon: '🏠',
    subcategories: [
      { id: 'home_decor', name: 'Home Decor', parentId: 'home' },
      { id: 'furniture', name: 'Furniture', parentId: 'home' },
      { id: 'kitchen_dining', name: 'Kitchen & Dining', parentId: 'home' },
      { id: 'bedding_bath', name: 'Bedding & Bath', parentId: 'home' },
      { id: 'lighting', name: 'Lighting', parentId: 'home' },
      { id: 'storage', name: 'Storage & Organization', parentId: 'home' },
    ]
  },
  {
    id: 'books',
    name: 'Books & Media',
    icon: '📚',
    subcategories: [
      { id: 'fiction', name: 'Fiction', parentId: 'books' },
      { id: 'nonfiction', name: 'Non-Fiction', parentId: 'books' },
      { id: 'audiobooks', name: 'Audiobooks', parentId: 'books' },
      { id: 'ebooks', name: 'E-books', parentId: 'books' },
      { id: 'comics_manga', name: 'Comics & Manga', parentId: 'books' },
      { id: 'educational', name: 'Educational', parentId: 'books' },
    ]
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    icon: '⚽',
    subcategories: [
      { id: 'fitness', name: 'Fitness Equipment', parentId: 'sports' },
      { id: 'outdoor', name: 'Outdoor Recreation', parentId: 'sports' },
      { id: 'team_sports', name: 'Team Sports', parentId: 'sports' },
      { id: 'cycling', name: 'Cycling', parentId: 'sports' },
      { id: 'camping_hiking', name: 'Camping & Hiking', parentId: 'sports' },
    ]
  },
  {
    id: 'toys',
    name: 'Toys & Games',
    icon: '🎮',
    subcategories: [
      { id: 'board_games', name: 'Board Games', parentId: 'toys' },
      { id: 'educational', name: 'Educational Toys', parentId: 'toys' },
      { id: 'action_figures', name: 'Action Figures', parentId: 'toys' },
      { id: 'dolls', name: 'Dolls & Accessories', parentId: 'toys' },
      { id: 'video_games', name: 'Video Games', parentId: 'toys' },
      { id: 'puzzles', name: 'Puzzles', parentId: 'toys' },
    ]
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    icon: '💊',
    subcategories: [
      { id: 'supplements', name: 'Supplements', parentId: 'health' },
      { id: 'fitness_trackers', name: 'Fitness Trackers', parentId: 'health' },
      { id: 'medical', name: 'Medical Equipment', parentId: 'health' },
      { id: 'wellness', name: 'Wellness Products', parentId: 'health' },
    ]
  },
  {
    id: 'automotive',
    name: 'Automotive',
    icon: '🚗',
    subcategories: [
      { id: 'car_accessories', name: 'Car Accessories', parentId: 'automotive' },
      { id: 'tools', name: 'Tools & Equipment', parentId: 'automotive' },
      { id: 'motorcycle', name: 'Motorcycle', parentId: 'automotive' },
    ]
  },
  {
    id: 'misc',
    name: 'Miscellaneous',
    icon: '📦',
    subcategories: []
  }
];

export const getCategoryById = (id: string): ProductCategory | undefined => {
  return PRODUCT_CATEGORIES.find(cat => cat.id === id);
};

export const getSubcategoryById = (id: string): SubCategory | undefined => {
  for (const category of PRODUCT_CATEGORIES) {
    const sub = category.subcategories.find(sub => sub.id === id);
    if (sub) return sub;
  }
  return undefined;
};

export const detectCategoryFromUrl = (url: string, title: string): string => {
  const urlLower = url.toLowerCase();
  const titleLower = title.toLowerCase();

  const keywordMap: Record<string, string> = {
    // Fashion
    'shirt': 'fashion', 'dress': 'fashion', 'jeans': 'fashion', 'pant': 'fashion',
    'jacket': 'fashion', 'coat': 'fashion', 'sweater': 'fashion', 'hoodie': 'fashion',
    'shoe': 'fashion', 'boot': 'fashion', 'sneaker': 'fashion', 'sandal': 'fashion',
    'bag': 'fashion', 'wallet': 'fashion', 'belt': 'fashion', 'hat': 'fashion',
    't-shirt': 'fashion', 'tshirt': 'fashion', 'saree': 'fashion', 'kurta': 'fashion',
    'lehenga': 'fashion', 'ethnic': 'fashion', 'traditional': 'fashion',

    // Electronics
    'phone': 'electronics', 'mobile': 'electronics', 'smartphone': 'electronics',
    'laptop': 'electronics', 'computer': 'electronics', 'macbook': 'electronics',
    'headphone': 'electronics', 'earphone': 'electronics', 'speaker': 'electronics',
    'tv': 'electronics', 'television': 'electronics', 'monitor': 'electronics',
    'camera': 'electronics', 'drone': 'electronics', 'watch': 'electronics',
    'tablet': 'electronics', 'ipad': 'electronics', 'charger': 'electronics',
    'powerbank': 'electronics', 'earbuds': 'electronics', 'airpods': 'electronics',

    // Beauty
    'lipstick': 'beauty', 'foundation': 'beauty', 'mascara': 'beauty', 'eyeshadow': 'beauty',
    'cream': 'beauty', 'serum': 'beauty', 'moisturizer': 'beauty', 'lotion': 'beauty',
    'shampoo': 'beauty', 'conditioner': 'beauty', 'hair': 'beauty', 'perfume': 'beauty',
    'deodorant': 'beauty', 'makeup': 'beauty', 'cosmetic': 'beauty', 'skincare': 'beauty',

    // Home
    'chair': 'home', 'table': 'home', 'desk': 'home', 'sofa': 'home', 'couch': 'home',
    'lamp': 'home', 'light': 'home', 'curtain': 'home', 'rug': 'home', 'carpet': 'home',
    'pan': 'home', 'pot': 'home', 'utensil': 'home', 'dish': 'home', 'decor': 'home',
    'furniture': 'home', 'bedding': 'home', 'pillow': 'home', 'blanket': 'home',

    // Books
    'book': 'books', 'novel': 'books', 'kindle': 'books', 'audiobook': 'books',
    'textbook': 'books', 'guide': 'books', 'magazine': 'books', 'comic': 'books',

    // Sports
    'ball': 'sports', 'bat': 'sports', 'racket': 'sports', 'gym': 'sports',
    'yoga': 'sports', 'fitness': 'sports', 'exercise': 'sports', 'sport': 'sports',
    'camping': 'sports', 'hiking': 'sports', 'cycle': 'sports', 'bicycle': 'sports',

    // Toys
    'toy': 'toys', 'game': 'toys', 'puzzle': 'toys', 'lego': 'toys', 'action figure': 'toys',
    'doll': 'toys', 'board game': 'toys', 'video game': 'toys', 'play': 'toys',

    // Health
    'vitamin': 'health', 'supplement': 'health', 'protein': 'health', 'fitness tracker': 'health',
    'massager': 'health', 'brace': 'health', 'medical': 'health',

    // Automotive
    'car': 'automotive', 'bike': 'automotive', 'motorcycle': 'automotive', 'tire': 'automotive',
    'wheel': 'automotive', 'engine': 'automotive', 'auto': 'automotive',
  };

  // Check keywords in URL and title with priority for more specific matches
  let bestMatch = 'misc';
  let bestMatchScore = 0;

  for (const [keyword, category] of Object.entries(keywordMap)) {
    const urlMatch = urlLower.includes(keyword);
    const titleMatch = titleLower.includes(keyword);
    let score = 0;

    if (urlMatch) score += 2;
    if (titleMatch) score += 1;

    // Extra weight for exact word boundaries
    if (new RegExp(`\\b${keyword}\\b`).test(titleLower)) score += 2;

    if (score > bestMatchScore && score > 0) {
      bestMatchScore = score;
      bestMatch = category;
    }
  }

  // Check for platform-specific patterns
  if (urlLower.includes('myntra') || (urlLower.includes('amazon') && urlLower.includes('fashion'))) {
    return 'fashion';
  }
  if (urlLower.includes('flipkart')) {
    if (urlLower.includes('mobile') || urlLower.includes('electronics')) return 'electronics';
    if (urlLower.includes('fashion')) return 'fashion';
  }
  if (urlLower.includes('nykaa')) return 'beauty';

  return bestMatch !== 'misc' ? bestMatch : 'misc';
};

export const getAllCategories = (): ProductCategory[] => {
  return PRODUCT_CATEGORIES;
};

export const getCategoryIcon = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.icon || '📦';
};

export const getCategoryName = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.name || 'Miscellaneous';
};