// app/studio/components/GallerySection.tsx
'use client';

import { Plus, Pencil, ExternalLink, Settings } from 'lucide-react';
import OptimizedImage from '@/app/components/OptimizedImage';
import { DisplaySettings, imageSizeMap, getGridClass } from '@/lib/settings';

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
  const imageSize = imageSizeMap[settings.imageSize];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2" style={textColorStyle}>
          🖼️ Gallery
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onOpenSettings}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-sm flex items-center gap-1 hover:bg-gray-200 transition"
            title="Display settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onAdd}
            className="bg-black text-white px-4 py-2 rounded-full text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Product ({realProductsCount}/50)
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
          <p className="opacity-70" style={textColorStyle}>No products in gallery</p>
          <button onClick={onAdd} className="mt-3 text-black underline text-sm">
            Add your first product
          </button>
        </div>
      ) : (
        <div className={getGridClass(settings.productsPerRow)}>
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col">
              {/* Image */}
              <div className={`relative w-full ${imageSize.className} overflow-hidden bg-gray-100 cursor-pointer`}
                   onClick={() => onEdit?.(product)}>
                <OptimizedImage
                  src={product.imageUrl}
                  alt={product.title}
                  width={imageSize.width}
                  height={imageSize.height}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(product);
                    }}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full transition opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="p-2 flex-1">
                <h3 className="font-medium text-sm truncate" style={textColorStyle}>
                  {product.title || 'Untitled'}
                </h3>

                {settings.showPrices && product.price && (
                  <p className="text-xs text-green-600 font-semibold mt-0.5">{product.price}</p>
                )}

                {settings.showDescriptions && product.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                )}

                {product.category && (
                  <p className="text-xs text-gray-400 mt-1">
                    {product.category === 'fashion' && '👕 Fashion'}
                    {product.category === 'electronics' && '📱 Electronics'}
                    {product.category === 'beauty' && '💄 Beauty'}
                    {product.category === 'misc' && '📦 Misc'}
                  </p>
                )}

                <div className="flex gap-2 mt-2">
                  <a
                    href={product.buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" /> View
                  </a>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${product.title}"?`)) {
                        onDelete(product.id);
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}