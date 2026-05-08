// app/studio/components/GallerySection.tsx
'use client';

import { Plus, Pencil, ExternalLink, Settings } from 'lucide-react';
import OptimizedImage from '@/app/components/OptimizedImage';
import { DisplaySettings } from '@/lib/settings';

interface Product {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  buyLink: string;
  price?: string | null;
  platform?: string;
  category?: string;
  isDummy?: boolean;
}

interface GallerySectionProps {
  products: Product[];
  onAdd: () => void;
  onEdit?: (product: Product) => void;
  onDelete: (id: string) => void;
  onOpenSettings?: () => void;
  settings: DisplaySettings;
  textColorStyle: React.CSSProperties;
}

export default function GallerySection({
  products,
  onAdd,
  onEdit,
  onDelete,
  onOpenSettings,
  settings,
  textColorStyle
}: GallerySectionProps) {
  const realProductsCount = products.filter(p => !p.isDummy).length;

  // List View
  if (settings.cardStyle === 'list') {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={textColorStyle}>
            🖼️ Gallery
            <span className="text-sm opacity-60">({realProductsCount} products)</span>
          </h2>
          <div className="flex gap-2">
            <button onClick={onOpenSettings} className="bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-sm flex items-center gap-1 hover:bg-gray-200 transition">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={onAdd} className="bg-black text-white px-4 py-2 rounded-full text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Product ({realProductsCount}/50)
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
            <p className="opacity-70" style={textColorStyle}>No products in gallery</p>
            <button onClick={onAdd} className="mt-3 text-black underline text-sm">Add your first product</button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group">
                <div className="flex gap-4 p-3">
                  <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden bg-gray-100 rounded-lg cursor-pointer" onClick={() => onEdit?.(product)}>
                    <OptimizedImage src={product.imageUrl} alt={product.title} width={96} height={96} className="w-full h-full object-cover" />
                    {onEdit && (
                      <button onClick={(e) => { e.stopPropagation(); onEdit(product); }} className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white p-1 rounded-full transition opacity-0 group-hover:opacity-100">
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title || 'Untitled'}</h3>
                        {product.category && <p className="text-xs text-gray-500 mt-0.5">
                          {product.category === 'fashion' && '👕 Fashion'}
                          {product.category === 'electronics' && '📱 Electronics'}
                          {product.category === 'beauty' && '💄 Beauty'}
                          {product.category === 'misc' && '📦 Misc'}
                        </p>}
                      </div>
                      <div className="flex gap-2">
                        <a href={product.buyLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600"><ExternalLink className="w-4 h-4" /></a>
                        <button onClick={() => { if (confirm(`Delete "${product.title}"?`)) onDelete(product.id); }} className="text-gray-400 hover:text-red-500 text-xs">Delete</button>
                      </div>
                    </div>
                    {settings.showDescriptions && product.description && <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      {settings.showPrices && product.price && <p className="text-lg font-bold text-green-600">{product.price}</p>}
                      {product.platform && <span className="text-xs text-gray-400 capitalize">{product.platform}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Grid View
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2" style={textColorStyle}>
          🖼️ Gallery
          <span className="text-sm opacity-60">({realProductsCount} products)</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={onOpenSettings} className="bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-sm flex items-center gap-1 hover:bg-gray-200 transition">
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={onAdd} className="bg-black text-white px-4 py-2 rounded-full text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Product ({realProductsCount}/50)
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
          <p className="opacity-70" style={textColorStyle}>No products in gallery</p>
          <button onClick={onAdd} className="mt-3 text-black underline text-sm">Add your first product</button>
        </div>
      ) : (
        <div className="max-h-[600px] overflow-y-auto pr-2">
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${settings.productsPerRow}, minmax(0, 1fr))`
            }}
          >
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col min-w-0">
                <div className="relative w-full aspect-square overflow-hidden bg-gray-100 cursor-pointer" onClick={() => onEdit?.(product)}>
                  <OptimizedImage
                    src={product.imageUrl}
                    alt={product.title}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {onEdit && (
                    <button onClick={(e) => { e.stopPropagation(); onEdit(product); }} className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full transition opacity-0 group-hover:opacity-100">
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="p-2 flex-1">
                  <h3 className="font-medium text-sm truncate" style={textColorStyle}>{product.title || 'Untitled'}</h3>
                  {settings.showPrices && product.price && <p className="text-xs text-green-600 font-semibold mt-0.5">{product.price}</p>}
                  {settings.showDescriptions && product.description && <p className="text-xs text-gray-500 line-clamp-2 mt-1">{product.description}</p>}
                  {product.category && <p className="text-xs text-gray-400 mt-1">
                    {product.category === 'fashion' && '👕 Fashion'}
                    {product.category === 'electronics' && '📱 Electronics'}
                    {product.category === 'beauty' && '💄 Beauty'}
                    {product.category === 'misc' && '📦 Misc'}
                  </p>}
                  <div className="flex gap-2 mt-2">
                    <a href={product.buyLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink className="w-3 h-3" /> View
                    </a>
                    <button onClick={() => { if (confirm(`Delete "${product.title}"?`)) onDelete(product.id); }} className="text-xs text-red-500 hover:text-red-700 transition">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}