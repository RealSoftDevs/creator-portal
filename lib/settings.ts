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