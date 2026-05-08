// lib/settings.ts
export interface DisplaySettings {
  productsPerRow: number;
  imageSize: 'small' | 'medium' | 'large';
  showDescriptions: boolean;
  showPrices: boolean;
}

export const defaultSettings: DisplaySettings = {
  productsPerRow: 3,
  imageSize: 'medium',
  showDescriptions: true,
  showPrices: true,
};

export const imageSizeMap = {
  small: { width: 200, height: 200, className: 'h-32' },
  medium: { width: 300, height: 300, className: 'h-48' },
  large: { width: 400, height: 400, className: 'h-64' },
};

export const productsPerRowOptions = [2, 3, 4, 5, 6];

export function getGridClass(perRow: number): string {
  const gridMap: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };
  return gridMap[perRow] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
}