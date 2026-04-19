// lib/templates/index.ts
import { defaultConfig, defaultTemplate } from '@/lib/defaults';

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
  gradientColors: {
    start: string;
    end: string;
  };
}

export const templates: Template[] = [
  // FREE TEMPLATES (4) - Beautiful, visible gradients
  {
    id: 'template1',
    name: 'Sunrise Morning',
    description: 'Warm orange to soft yellow gradient',
    isPremium: false,
    gradient: 'from-orange-400 via-orange-300 to-yellow-200',
    textColor: 'text-gray-800',
    defaultBackground: '#fb923c',
    defaultTextColor: '#1f2937',
    previewBadge: 'Free',
    category: 'Warm',
    gradientColors: { start: '#fb923c', end: '#fde047' }
  },
  {
    id: 'template2',
    name: 'Ocean Breeze',
    description: 'Deep blue to soft cyan gradient',
    isPremium: false,
    gradient: 'from-blue-600 via-blue-500 to-cyan-300',
    textColor: 'text-white',
    defaultBackground: '#2563eb',
    defaultTextColor: '#ffffff',
    previewBadge: 'Free',
    category: 'Cool',
    gradientColors: { start: '#2563eb', end: '#67e8f9' }
  },
  {
    id: 'template3',
    name: 'Purple Dream',
    description: 'Rich purple to soft pink gradient',
    isPremium: false,
    gradient: 'from-purple-600 via-purple-500 to-pink-400',
    textColor: 'text-white',
    defaultBackground: '#9333ea',
    defaultTextColor: '#ffffff',
    previewBadge: 'Free',
    category: 'Vibrant',
    gradientColors: { start: '#9333ea', end: '#f472b6' }
  },
  {
    id: 'template4',
    name: 'Forest Walk',
    description: 'Fresh green to mint gradient',
    isPremium: false,
    gradient: 'from-green-600 via-green-500 to-emerald-300',
    textColor: 'text-white',
    defaultBackground: '#16a34a',
    defaultTextColor: '#ffffff',
    previewBadge: 'Free',
    category: 'Nature',
    gradientColors: { start: '#16a34a', end: '#6ee7b7' }
  },

  // PREMIUM TEMPLATES (10) - Stunning, eye-catching gradients
  {
    id: 'template5',
    name: 'Midnight Aurora',
    description: 'Deep night sky with aurora vibes',
    isPremium: true,
    gradient: 'from-gray-900 via-purple-900 to-indigo-800',
    textColor: 'text-white',
    defaultBackground: '#111827',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Dark',
    gradientColors: { start: '#111827', end: '#1e1b4b' }
  },
  {
    id: 'template6',
    name: 'Sunset Paradise',
    description: 'Vibrant sunset colors',
    isPremium: true,
    gradient: 'from-rose-600 via-orange-500 to-yellow-400',
    textColor: 'text-white',
    defaultBackground: '#e11d48',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Sunset',
    gradientColors: { start: '#e11d48', end: '#facc15' }
  },
  {
    id: 'template7',
    name: 'Neon Vibes',
    description: 'Electric neon gradient',
    isPremium: true,
    gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    textColor: 'text-white',
    defaultBackground: '#22d3ee',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Neon',
    gradientColors: { start: '#22d3ee', end: '#7c3aed' }
  },
  {
    id: 'template8',
    name: 'Berry Smoothie',
    description: 'Sweet berry blend',
    isPremium: true,
    gradient: 'from-pink-500 via-rose-400 to-red-400',
    textColor: 'text-white',
    defaultBackground: '#ec4899',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Sweet',
    gradientColors: { start: '#ec4899', end: '#f87171' }
  },
  {
    id: 'template9',
    name: 'Tropical Lagoon',
    description: 'Turquoise to teal paradise',
    isPremium: true,
    gradient: 'from-teal-400 via-cyan-500 to-blue-500',
    textColor: 'text-white',
    defaultBackground: '#2dd4bf',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Tropical',
    gradientColors: { start: '#2dd4bf', end: '#3b82f6' }
  },
  {
    id: 'template10',
    name: 'Golden Hour',
    description: 'Warm golden gradient',
    isPremium: true,
    gradient: 'from-amber-400 via-yellow-500 to-orange-500',
    textColor: 'text-gray-800',
    defaultBackground: '#fbbf24',
    defaultTextColor: '#1f2937',
    previewBadge: 'Premium',
    category: 'Golden',
    gradientColors: { start: '#fbbf24', end: '#f97316' }
  },
  {
    id: 'template11',
    name: 'Cosmic Space',
    description: 'Deep space galaxy gradient',
    isPremium: true,
    gradient: 'from-indigo-900 via-purple-900 to-pink-900',
    textColor: 'text-white',
    defaultBackground: '#312e81',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Cosmic',
    gradientColors: { start: '#312e81', end: '#831843' }
  },
  {
    id: 'template12',
    name: 'Minty Fresh',
    description: 'Cool mint to fresh green',
    isPremium: true,
    gradient: 'from-emerald-400 via-green-400 to-teal-400',
    textColor: 'text-gray-800',
    defaultBackground: '#34d399',
    defaultTextColor: '#1f2937',
    previewBadge: 'Premium',
    category: 'Fresh',
    gradientColors: { start: '#34d399', end: '#2dd4bf' }
  },
  {
    id: 'template13',
    name: 'Lavender Fields',
    description: 'Soft lavender to purple',
    isPremium: true,
    gradient: 'from-purple-300 via-purple-400 to-indigo-400',
    textColor: 'text-gray-800',
    defaultBackground: '#d8b4fe',
    defaultTextColor: '#1f2937',
    previewBadge: 'Premium',
    category: 'Calm',
    gradientColors: { start: '#d8b4fe', end: '#818cf8' }
  },
  {
    id: 'template14',
    name: 'Fire & Ice',
    description: 'Contrasting hot and cool',
    isPremium: true,
    gradient: 'from-red-500 via-orange-500 to-blue-500',
    textColor: 'text-white',
    defaultBackground: '#ef4444',
    defaultTextColor: '#ffffff',
    previewBadge: 'Premium',
    category: 'Contrast',
    gradientColors: { start: '#ef4444', end: '#3b82f6' }
  },
];

export const getTemplateById = (id: string): Template => {
  console.log(`🔍 Looking for template: ${id}`);

  const template = templates.find(t => t.id === id);
  if (!template) {
    console.warn(`⚠️ Template ${id} not found, using default`);
    const defaultTemplate = templates[0];
    console.log(`📌 Using default template: ${defaultTemplate.id} - ${defaultTemplate.name}`);
    return defaultTemplate;
  }

  console.log(`✅ Found template: ${template.id} - ${template.name}`);
  return template;
};

export const getFreeTemplates = (): Template[] => {
  return templates.filter(t => !t.isPremium);
};

export const getPremiumTemplates = (): Template[] => {
  return templates.filter(t => t.isPremium);
};