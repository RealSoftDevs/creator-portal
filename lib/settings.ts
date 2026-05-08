// lib/settings.ts
export interface DisplaySettings {
  productsPerRow: number;
  cardStyle: 'grid' | 'list';
  showDescriptions: boolean;
  showPrices: boolean;
}

export const defaultSettings: DisplaySettings = {
  productsPerRow: 4,
  cardStyle: 'grid',
  showDescriptions: true,
  showPrices: true,
};

export const productsPerRowOptions = [2, 3, 4, 5, 6];

export function getGridColumns(perRow: number): string {
  return `repeat(${perRow}, minmax(0, 1fr))`;
}

// Add missing exports that were being imported
export const imageSizeMap = {
  sm: 100,
  md: 200,
  lg: 300,
  xl: 400,
  '2xl': 600,
};

export const imageSizeOptions = [
  { value: 'sm', label: 'Small (100px)' },
  { value: 'md', label: 'Medium (200px)' },
  { value: 'lg', label: 'Large (300px)' },
  { value: 'xl', label: 'Extra Large (400px)' },
  { value: '2xl', label: '2X Large (600px)' },
];

export function getGridClass(perRow: number): string {
  const gridClasses: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };
  return gridClasses[perRow] || 'grid-cols-4';
}