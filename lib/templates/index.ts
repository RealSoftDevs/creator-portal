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
  // FREE TEMPLATES (2) - Soft pastel gradients
  {
    id: 'template1',
    name: 'Soft Morning',
    description: 'Gentle blue gradient',
    isPremium: false,
    gradient: 'from-blue-100 via-blue-50 to-indigo-100',
    textColor: 'text-gray-800',
    defaultBackground: '#dbeafe',
    defaultTextColor: '#1f2937',
    previewBadge: 'Free',
    category: 'Soft',
  },
  {
    id: 'template2',
    name: 'Peach Dream',
    description: 'Warm peach gradient',
    isPremium: false,
    gradient: 'from-orange-100 via-orange-50 to-amber-100',
    textColor: 'text-gray-800',
    defaultBackground: '#ffedd5',
    defaultTextColor: '#1f2937',
    previewBadge: 'Free',
    category: 'Warm',
  },

  // PREMIUM TEMPLATES (10) - Soft, elegant gradients
  {
    id: 'template3',
    name: 'Mint Breeze',
    description: 'Fresh mint gradient',
    isPremium: true,
    gradient: 'from-teal-100 via-teal-50 to-cyan-100',
    textColor: 'text-gray-800',
    defaultBackground: '#ccfbf1',
    defaultTextColor: '#1f2937',
    previewBadge: 'Premium',
    category: 'Fresh',
  },
  {
    id: 'template4',
    name: 'Lavender Mist',
    description: 'Calm lavender gradient',
    isPremium: true,
    gradient: 'from-purple-100 via-purple-50 to-pink-100',
    textColor: 'text-gray-800',
    defaultBackground: '#f3e8ff',
    defaultTextColor: '#1f2937',
    previewBadge: 'Premium',
    category: 'Calm',
  },
  {
    id: 'template5',
    name: 'Sage Green',
    description: 'Natural sage gradient',
    isPremium: true,
    gradient: 'from-green-100 via-green-50 to-emerald-100',
    textColor: 'text-gray-800',
    defaultBackground: '#dcfce7',
    defaultTextColor: '#1f2937',
    previewBadge: 'Premium',
    category: 'Nature',
  },
  {
    id: 'template6',
    name: 'Apricot Glow',
    description: 'Soft apricot gradient',
    isPremium: true,
    gradient: 'from-amber-100 via-amber-50 to-orange-100',
    textColor: 'text-gray-800',
    defaultBackground: '#fef3c7',
    defaultTextColor: '#1f2937',
    previewBadge: 'Premium',
    category: 'Warm',
  },
  {
    id: 'template7',
    name: 'Ocean Wave',
    description: 'Calm ocean gradient',
    isPremium: true,
    gradient: 'from-cyan-100 via-cyan-50 to-blue-100',
    textColor: 'text-gray-800',
    defaultBackground: '#cffafe',
    defaultTextColor: '#1f2937',
    previewBadge: 'Premium',
    category: 'Ocean',
  },
  {
    id: 'template8',
    name: 'Berry Sorbet',
    description: 'Sweet berry gradient',
    isPremium: true,
    gradient: 'from-rose-100 via-rose-50 to-pink-100',
    textColor: 'text-gray-800',
    defaultBackground: '#ffe4e6',
    defaultTextColor: '#1f2937',
    previewBadge: 'Premium',
    category: 'Sweet',
  },
  {
    id: 'template9',
    name: 'Honey Drizzle',
    description: 'Warm honey gradient',
    isPremium: true,
    gradient: 'from-yellow-100 via-yellow-50 to-amber-100',
    textColor: 'text-gray-800',
    defaultBackground: '#fef9c3',
    defaultTextColor: '#1f2937',
    previewBadge: 'Premium',
    category: 'Warm',
  },
  {
    id: 'template10',
    name: 'Arctic Frost',
    description: 'Cool arctic gradient',
    isPremium: true,
    gradient: 'from-blue-100 via-blue-50 to-white',
    textColor: 'text-gray-800',
    defaultBackground: '#dbeafe',
    defaultTextColor: '#1f2937',
    previewBadge: 'Premium',
    category: 'Cool',
  },
  {
    id: 'template11',
    name: 'Spring Bloom',
    description: 'Floral spring gradient',
    isPremium: true,
    gradient: 'from-pink-100 via-pink-50 to-green-100',
    textColor: 'text-gray-800',
    defaultBackground: '#fce7f3',
    defaultTextColor: '#1f2937',
    previewBadge: 'Premium',
    category: 'Floral',
  },
  {
    id: 'template12',
    name: 'Midnight Sky',
    description: 'Deep night gradient',
    isPremium: true,
    gradient: 'from-gray-800 via-gray-700 to-gray-900',
    textColor: 'text-white',
    defaultBackground: '#1f2937',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Dark',
  },
];

export const getTemplateById = (id: string): Template => {
  const template = templates.find(t => t.id === id);
  if (!template) {
    console.warn(`Template ${id} not found, using default`);
    return templates[0];
  }
  return template;
};

export const getFreeTemplates = (): Template[] => {
  return templates.filter(t => !t.isPremium);
};

export const getPremiumTemplates = (): Template[] => {
  return templates.filter(t => t.isPremium);
};