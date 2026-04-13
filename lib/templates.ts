// Single source of truth for all templates
export interface Template {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  gradient: string;
  textColor: string;
  buttonBg: string;
  previewBadge: string;
}

export const templates: Template[] = [
  // Free Templates
  {
    id: 'template1',
    name: 'Minimal Light',
    description: 'Clean and simple design',
    isPremium: false,
    gradient: 'from-gray-50 to-gray-100',
    textColor: 'text-gray-900',
    buttonBg: 'bg-white',
    previewBadge: 'Free',
  },
  {
    id: 'template2',
    name: 'Dark Elegance',
    description: 'Sleek dark theme',
    isPremium: false,
    gradient: 'from-gray-900 to-gray-800',
    textColor: 'text-white',
    buttonBg: 'bg-gray-700',
    previewBadge: 'Free',
  },
  // Premium Templates
  {
    id: 'template3',
    name: 'Neon Vibes',
    description: 'Bold and vibrant',
    isPremium: true,
    gradient: 'from-purple-600 via-pink-500 to-red-500',
    textColor: 'text-white',
    buttonBg: 'bg-white/20',
    previewBadge: 'Premium',
  },
  {
    id: 'template4',
    name: 'Nature Fresh',
    description: 'Green and organic',
    isPremium: true,
    gradient: 'from-green-500 to-emerald-700',
    textColor: 'text-white',
    buttonBg: 'bg-white/20',
    previewBadge: 'Premium',
  },
  {
    id: 'template5',
    name: 'Ocean Blue',
    description: 'Calm and professional',
    isPremium: true,
    gradient: 'from-blue-400 to-cyan-600',
    textColor: 'text-white',
    buttonBg: 'bg-white/20',
    previewBadge: 'Premium',
  },
  {
    id: 'template6',
    name: 'Sunset Glow',
    description: 'Warm and inviting',
    isPremium: true,
    gradient: 'from-orange-400 to-red-600',
    textColor: 'text-white',
    buttonBg: 'bg-white/20',
    previewBadge: 'Premium',
  },
  {
    id: 'template7',
    name: 'Pastel Dreams',
    description: 'Soft and gentle',
    isPremium: true,
    gradient: 'from-pink-200 to-purple-300',
    textColor: 'text-gray-800',
    buttonBg: 'bg-white/60',
    previewBadge: 'Premium',
  },
  {
    id: 'template8',
    name: 'Tech Future',
    description: 'Modern and sleek',
    isPremium: true,
    gradient: 'from-cyan-500 to-blue-700',
    textColor: 'text-white',
    buttonBg: 'bg-white/20',
    previewBadge: 'Premium',
  },
  {
    id: 'template9',
    name: 'Luxury Gold',
    description: 'Premium and elegant',
    isPremium: true,
    gradient: 'from-yellow-400 to-amber-700',
    textColor: 'text-gray-900',
    buttonBg: 'bg-white/80',
    previewBadge: 'Premium',
  },
  {
    id: 'template10',
    name: 'Midnight Purple',
    description: 'Mysterious and deep',
    isPremium: true,
    gradient: 'from-purple-900 to-indigo-900',
    textColor: 'text-white',
    buttonBg: 'bg-white/20',
    previewBadge: 'Premium',
  },
];

export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(t => t.id === id);
};

export const getFreeTemplates = (): Template[] => {
  return templates.filter(t => !t.isPremium);
};

export const getPremiumTemplates = (): Template[] => {
  return templates.filter(t => t.isPremium);
};