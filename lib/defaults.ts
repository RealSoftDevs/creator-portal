// lib/defaults.ts
export const defaultConfig = {
  // Template defaults
  templateId: 'template1',
  primaryColor: '#f5f5f5',
  textColor: '#1a1a1a',
  fontFamily: 'font-sans',
  backgroundType: 'image',  // Use image as default
  backgroundImage: '/images/default-bg.jpg',  // Path to image in public folder
  gradientStart: '#fb923c',
  gradientEnd: '#fde047',
  defaultBackground: '#f5f5f5',
  defaultTextColor: '#1a1a1a',

  // Portal defaults
  title: 'My Creator Portal',
  bio: '',

  // Limits
  freeLinksLimit: 1,
  freeProductsLimit: 4,
  premiumLinksLimit: 10,
  premiumProductsLimit: 50,

  // Template gradients mapping
  gradients: {
    'template1': 'from-orange-400 via-orange-300 to-yellow-200',
    'template2': 'from-blue-600 via-blue-500 to-cyan-300',
  }
};

export const defaultTemplate = {
  id: defaultConfig.templateId,
  name: 'Minimal Light',
  description: 'Clean and simple design',
  isPremium: false,
  gradient: defaultConfig.gradients.template1,
  textColor: 'text-gray-800',
  defaultBackground: defaultConfig.primaryColor,
  defaultTextColor: defaultConfig.textColor,
  previewBadge: 'Free',
  category: 'Light',
  gradientColors: {
    start: defaultConfig.gradientStart,
    end: defaultConfig.gradientEnd
  }
};