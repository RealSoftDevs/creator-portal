// app/components/dashboard/ProductsTab.tsx
'use client';

import { useState, useMemo } from 'react';
import { Plus, Package, Filter, Grid, List, Columns } from 'lucide-react';
import { DisplaySettings } from '@/lib/settings';

interface ProductsTabProps {
  products: any[];
  settings: DisplaySettings;
  onAddProduct: () => void;
  onEditProduct: (product: any) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateSettings: (settings: DisplaySettings) => void;
}

export default function ProductsTab({
  products,
  settings,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateSettings
}: ProductsTabProps) {
  const [filter, setFilter] = useState<string>('all');
  const [showFilterBar, setShowFilterBar] = useState(true);
  const [showPerRowDropdown, setShowPerRowDropdown] = useState(false);

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || 'misc'));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach(p => {
      const cat = p.category || 'misc';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = filter === 'all'
    ? products
    : products.filter(p => (p.category || 'misc') === filter);

  const getCategoryIcon = (catId: string) => {
    const icons: Record<string, string> = {
      fashion: '👕',
      electronics: '📱',
      beauty: '💄',
      home: '🏠',
      books: '📚',
      sports: '⚽',
      toys: '🎮',
      health: '💊',
      automotive: '🚗',
      misc: '📦',
      all: '🎯'
    };
    return icons[catId] || '📦';
  };

  const getCategoryName = (catId: string) => {
    const names: Record<string, string> = {
      fashion: 'Fashion',
      electronics: 'Electronics',
      beauty: 'Beauty',
      home: 'Home',
      books: 'Books',
      sports: 'Sports',
      toys: 'Toys',
      health: 'Health',
      automotive: 'Automotive',
      misc: 'Other',
      all: 'All Products'
    };
    return names[catId] || catId;
  };

  // Toggle view style
  const toggleViewStyle = () => {
    onUpdateSettings({
      ...settings,
      cardStyle: settings.cardStyle === 'grid' ? 'list' : 'grid'
    });
  };

  const perRowOptions = [2, 3, 4, 5, 6];

  return (
    <div className="space-y-4">
      {/* Header with View Toggle and Per Row selector */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-2 items-center">
          {/* View Style Toggle */}
          <div className="flex bg-white/10 rounded-lg p-0.5">
            <button
              onClick={() => onUpdateSettings({ ...settings, cardStyle: 'grid' })}
              className={`p-1.5 rounded-md transition ${settings.cardStyle === 'grid' ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, cardStyle: 'list' })}
              className={`p-1.5 rounded-md transition ${settings.cardStyle === 'list' ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Per Row Selector - Only show in Grid view */}
          {settings.cardStyle === 'grid' && (
            <div className="relative">
              <button
                onClick={() => setShowPerRowDropdown(!showPerRowDropdown)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-lg text-xs text-white hover:bg-white/20 transition"
              >
                <Columns className="w-3 h-3" />
                {settings.productsPerRow} cols
                <span className="text-xs">▼</span>
              </button>
              {showPerRowDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPerRowDropdown(false)} />
                  <div className="absolute top-full left-0 mt-1 bg-gray-800 rounded-lg shadow-lg z-50 min-w-[80px] overflow-hidden">
                    {perRowOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          onUpdateSettings({ ...settings, productsPerRow: option });
                          setShowPerRowDropdown(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs hover:bg-white/10 transition ${
                          settings.productsPerRow === option ? 'text-purple-400 bg-white/5' : 'text-white/80'
                        }`}
                      >
                        {option} columns
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilterBar(!showFilterBar)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition ${
              showFilterBar ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Filter className="w-3 h-3" />
            {showFilterBar ? 'Hide' : 'Filter'}
          </button>
        </div>

        <button onClick={onAddProduct} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur rounded-full text-xs sm:text-sm flex items-center gap-1 text-white hover:bg-white/30 transition">
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Add Product ({products.length}/50)
        </button>
      </div>

      {/* Filter Bar */}
      {showFilterBar && products.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter by Category
            </h3>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 ${
                  filter === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <span>{getCategoryIcon(cat)}</span>
                <span>{getCategoryName(cat)}</span>
                <span className={`text-xs ${filter === cat ? 'text-purple-200' : 'text-white/50'}`}>
                  ({categoryCounts[cat] || 0})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Display */}
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
        <>
          {/* Results count */}
          <div className="text-right">
            <p className="text-xs text-white/50">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          {/* LIST VIEW */}
          {settings.cardStyle === 'list' ? (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group border border-white/20">
                  <div className="flex gap-4 p-4">
                    <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 cursor-pointer" onClick={() => onEditProduct(product)}>
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/96x96?text=No+Image'; }}
                      />
                      <button className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white p-1 rounded-full transition opacity-0 group-hover:opacity-100 text-xs">
                        ✏️
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white line-clamp-1">{product.title}</h3>
                      {settings.showPrices && product.price && (
                        <p className="text-lg font-bold text-green-400 mt-1">{product.price}</p>
                      )}
                      {settings.showDescriptions && product.description && (
                        <p className="text-sm text-white/80 line-clamp-2 mt-1">{product.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          {getCategoryIcon(product.category || 'misc')}
                        </span>
                        <a
                          href={product.buyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-300 hover:text-purple-200 transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Product →
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${product.title}"?`)) onDeleteProduct(product.id);
                          }}
                          className="text-xs text-red-400 hover:text-red-300 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* GRID VIEW */
            <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${settings.productsPerRow}, minmax(0, 1fr))` }}>
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col border border-white/20">
                  <div className="relative w-full aspect-square overflow-hidden bg-black/20 cursor-pointer" onClick={() => onEditProduct(product)}>
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image'; }}
                    />
                    <button className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black/70 hover:bg-black text-white p-1 sm:p-1.5 rounded-full transition opacity-0 group-hover:opacity-100 text-xs">
                      ✏️
                    </button>
                  </div>
                  <div className="p-2 flex-1">
                    <h3 className="font-medium text-xs sm:text-sm truncate text-white" title={product.title}>
                      {product.title}
                    </h3>
                    {settings.showPrices && product.price && (
                      <p className="text-xs text-green-400 font-semibold mt-0.5">{product.price}</p>
                    )}
                    {settings.showDescriptions && product.description && (
                      <p className="text-xs text-white/60 line-clamp-2 mt-1">{product.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-white/40 flex items-center gap-1">
                        {getCategoryIcon(product.category || 'misc')}
                      </span>
                      <a
                        href={product.buyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-300 hover:text-purple-200 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View →
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${product.title}"?`)) onDeleteProduct(product.id);
                        }}
                        className="text-xs text-red-400 hover:text-red-300 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}