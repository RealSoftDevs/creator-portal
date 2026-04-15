
export const defaultConfig = {
  // Template defaults
  templateId: 'template1',
  primaryColor: '#f5f5f5',
  textColor: '#1a1a1a',        // Add this line
  fontFamily: 'font-sans',
  backgroundType: 'image',
  backgroundImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800',
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
    'template1': 'from-gray-100 to-white',
    'template2': 'from-gray-50 to-gray-100',
  }
};

// Template definitions with defaults
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
  category: 'Minimal',
};