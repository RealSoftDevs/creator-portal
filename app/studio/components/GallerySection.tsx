'use client';

import { Plus } from 'lucide-react';
import { Product } from '@/lib/types';

interface GallerySectionProps {
  products: Product[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  textColorStyle: React.CSSProperties;
}

export default function GallerySection({ products, onAdd, onDelete, textColorStyle }: GallerySectionProps) {
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
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm">
              <img src={product.imageUrl} alt={product.title} className="w-full h-32 object-cover" />
              <div className="p-2">
                <h3 className="font-medium text-sm truncate" style={textColorStyle}>{product.title}</h3>
                {product.price && <p className="text-xs text-green-600">{product.price}</p>}
                <button
                  onClick={() => onDelete(product.id)}
                  className="text-xs text-red-500 mt-1 hover:text-red-700 transition"
                >
                  Delete
                </button>
                {product.isDummy && (
                  <p className="text-xs text-gray-400 mt-1">Sample product</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}