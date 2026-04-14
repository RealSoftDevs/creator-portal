export interface Template {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  gradient: string;
  textColor: string;
  defaultBackground: string;
  defaultTextColor: string;
  previewBadge: string;
  category: string;
}

export const templates: Template[] = [
  // FREE TEMPLATES (2)
  {
    id: 'template1',
    name: 'Cotton Candy',
    description: 'Soft pastel dream',
    isPremium: true,
    gradient: 'from-pink-300 via-purple-300 to-blue-300',
    textColor: 'text-gray-800',
    defaultBackground: '#f9a8d4',
    defaultTextColor: '#374151',
    previewBadge: 'Premium',
    category: 'Pastel',
  },
  {
    id: 'template2',
    name: 'Dark Mode',
    description: 'Sleek and modern',
    isPremium: false,
    gradient: 'from-gray-900 to-gray-800',
    textColor: 'text-white',
    defaultBackground: '#1a1a1a',
    defaultTextColor: '#ffffff',
    previewBadge: 'Free',
    category: 'Dark',
  },
  
  // PREMIUM TEMPLATES - Gen-Z Focused (8)
  {
    id: 'template3',
    name: 'Neon Dream',
    description: 'Vibrant neon vibes',
    isPremium: false,
    gradient: 'from-pink-500 via-purple-500 to-indigo-500',
    textColor: 'text-white',
    defaultBackground: '#8b5cf6',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Vibrant',
  },
  {
    id: 'template4',
    name: 'Sunset Haze',
    description: 'Warm sunset gradients',
    isPremium: true,
    gradient: 'from-orange-400 via-red-500 to-pink-500',
    textColor: 'text-white',
    defaultBackground: '#f97316',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Warm',
  },
  {
    id: 'template5',
    name: 'Ocean Waves',
    description: 'Calm blue vibes',
    isPremium: true,
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
    textColor: 'text-white',
    defaultBackground: '#06b6d4',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Cool',
  },
  {
    id: 'template6',
    name: 'Cotton Candy',
    description: 'Soft pastel dream',
    isPremium: true,
    gradient: 'from-pink-300 via-purple-300 to-blue-300',
    textColor: 'text-gray-800',
    defaultBackground: '#f9a8d4',
    defaultTextColor: '#374151',
    previewBadge: 'Premium',
    category: 'Pastel',
  },
  {
    id: 'template7',
    name: 'Cyber Punk',
    description: 'Edgy futuristic',
    isPremium: true,
    gradient: 'from-green-400 via-cyan-500 to-blue-600',
    textColor: 'text-white',
    defaultBackground: '#10b981',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Futuristic',
  },
  {
    id: 'template8',
    name: 'Aura Glow',
    description: 'Mystical purple aura',
    isPremium: true,
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    textColor: 'text-white',
    defaultBackground: '#7c3aed',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Mystical',
  },
  {
    id: 'template9',
    name: 'Desert Rose',
    description: 'Warm earthy tones',
    isPremium: true,
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    textColor: 'text-white',
    defaultBackground: '#f59e0b',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Warm',
  },
  {
    id: 'template10',
    name: 'Galaxy Space',
    description: 'Deep cosmic vibes',
    isPremium: true,
    gradient: 'from-indigo-900 via-purple-900 to-pink-900',
    textColor: 'text-white',
    defaultBackground: '#312e81',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Dark',
  },
  {
    id: 'template11',
    name: 'Matcha Latte',
    description: 'Green tea vibes',
    isPremium: true,
    gradient: 'from-green-400 via-emerald-500 to-teal-600',
    textColor: 'text-white',
    defaultBackground: '#22c55e',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Nature',
  },
  {
    id: 'template12',
    name: 'Strawberry Milk',
    description: 'Sweet pink delight',
    isPremium: true,
    gradient: 'from-rose-300 via-pink-400 to-red-400',
    textColor: 'text-gray-800',
    defaultBackground: '#f43f5e',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Sweet',
  },
];

export const getTemplateById = (id: string): Template => {
  // If no template or template not found, return Dark Elegance as default
  const template = templates.find(t => t.id === id);
  if (!template) {
    console.warn(`Template ${id} not found, using default Dark Elegance`);
    return templates[1]; // Dark Elegance
  }
  return template;
};
export const getFreeTemplates = (): Template[] => {
  return templates.filter(t => !t.isPremium);
};

export const getPremiumTemplates = (): Template[] => {
  return templates.filter(t => t.isPremium);
};