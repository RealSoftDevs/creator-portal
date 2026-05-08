// app/studio/components/GallerySection.tsx
'use client';

import { Plus, Pencil, ExternalLink } from 'lucide-react';
import CloudinaryImage from '@/app/components/CloudinaryImage';

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
  order?: number;
}

interface GallerySectionProps {
  products: Product[];
  onAdd: () => void;
  onEdit?: (product: Product) => void;
  onDelete: (id: string) => void;
  textColorStyle: React.CSSProperties;
}

export default function GallerySection({ products, onAdd, onEdit, onDelete, textColorStyle }: GallerySectionProps) {
  const realProductsCount = products.filter(p => !p.isDummy).length;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2" style={textColorStyle}>
          🖼️ Gallery
        </h2>
        <button
          onClick={onAdd}
          className="bg-black text-white px-4 py-2 rounded-full text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Product ({realProductsCount}/4)
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
          <p className="opacity-70" style={textColorStyle}>No products in gallery</p>
          <button onClick={onAdd} className="mt-3 text-black underline text-sm">
            Add your first product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group">
              {/* Image */}
              <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                <CloudinaryImage
                  src={product.imageUrl}
                  alt={product.title}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                {/* Edit button */}
                {onEdit && (
                  <button
                    onClick={() => onEdit(product)}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                  {product.title || 'Untitled Product'}
                </h3>

                {product.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  {product.price && (
                    <p className="text-lg font-bold text-green-600">
                      {product.price}
                    </p>
                  )}

                  {product.platform && (
                    <span className="text-xs text-gray-400 capitalize">
                      {product.platform}
                    </span>
                  )}
                </div>

                {product.category && (
                  <div className="mt-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {product.category === 'fashion' && '👕 Fashion'}
                      {product.category === 'electronics' && '📱 Electronics'}
                      {product.category === 'beauty' && '💄 Beauty'}
                      {product.category === 'home' && '🏠 Home'}
                      {product.category === 'books' && '📚 Books'}
                      {product.category === 'sports' && '⚽ Sports'}
                      {product.category === 'toys' && '🎮 Toys'}
                      {product.category === 'misc' && '📦 Misc'}
                    </span>
                  </div>
                )}

                <div className="flex gap-3 mt-3 pt-2 border-t">
                  <a
                    href={product.buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                  >
                    View Product <ExternalLink className="w-3 h-3" />
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
                  {onEdit && (
                    <button
                      onClick={() => onEdit(product)}
                      className="text-xs text-gray-500 hover:text-gray-700 transition"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}