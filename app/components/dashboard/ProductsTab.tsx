// app/components/dashboard/ProductsTab.tsx
'use client';

import { useState } from 'react';
import { Plus, Package, Settings, Filter } from 'lucide-react';
import { DisplaySettings } from '@/lib/settings';

interface ProductsTabProps {
  products: any[];
  settings: DisplaySettings;
  onAddProduct: () => void;
  onEditProduct: (product: any) => void;
  onDeleteProduct: (id: string) => void;
  onOpenSettings: () => void;
}

export default function ProductsTab({ products, settings, onAddProduct, onEditProduct, onDeleteProduct, onOpenSettings }: ProductsTabProps) {
  const [filter, setFilter] = useState<string>('all');
  const categories = ['all', ...new Set(products.map(p => p.category || 'misc'))];
  const filteredProducts = filter === 'all' ? products : products.filter(p => (p.category || 'misc') === filter);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        {products.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap transition ${filter === cat ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onOpenSettings} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur rounded-full text-xs sm:text-sm flex items-center gap-1 text-white hover:bg-white/20 transition">
            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button onClick={onAddProduct} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur rounded-full text-xs sm:text-sm flex items-center gap-1 text-white hover:bg-white/30 transition">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Add
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center border border-white/20">
          <Package className="w-12 h-12 mx-auto mb-2 text-white/40" />
          <p className="text-white/60">No products yet</p>
          <button onClick={onAddProduct} className="mt-3 text-purple-300 underline text-sm">Add your first product</button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center border border-white/20">
          <Filter className="w-12 h-12 mx-auto mb-2 text-white/40" />
          <p className="text-white/60">No products in this category</p>
          <button onClick={() => setFilter('all')} className="mt-3 text-purple-300 underline text-sm">Show all products</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col border border-white/20">
              <div className="relative w-full aspect-square overflow-hidden bg-black/20 cursor-pointer" onClick={() => onEditProduct(product)}>
                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image'; }} />
                <button className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black/70 hover:bg-black text-white p-1 sm:p-1.5 rounded-full transition opacity-0 group-hover:opacity-100 text-xs">✏️</button>
              </div>
              <div className="p-2 flex-1">
                <h3 className="font-medium text-xs sm:text-sm truncate text-white" title={product.title}>{product.title}</h3>
                {settings.showPrices && product.price && <p className="text-xs text-green-400 font-semibold mt-0.5">{product.price}</p>}
                {settings.showDescriptions && product.description && <p className="text-xs text-white/60 line-clamp-2 mt-1">{product.description}</p>}
                <div className="flex gap-2 mt-2">
                  <a href={product.buyLink} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-300 hover:text-purple-200 transition" onClick={(e) => e.stopPropagation()}>View →</a>
                  <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${product.title}"?`)) onDeleteProduct(product.id); }} className="text-xs text-red-400 hover:text-red-300 transition">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}