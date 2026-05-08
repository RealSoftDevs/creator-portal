// app/view/[username]/page.tsx - Complete public view with same filter bar as dashboard
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTemplateById } from '@/lib/templates/index';
import PlatformIcon from '@/app/components/PlatformIcon';
import OptimizedImage from '@/app/components/OptimizedImage';
import { getCategoryById } from '@/lib/categories';
import { DisplaySettings, defaultSettings } from '@/lib/settings';
import { Settings, Grid, List, Columns, Filter, X, Eye, EyeOff } from 'lucide-react';

interface SocialLink {
  id: string;
  title: string;
  url: string;
  platform?: string;
  iconUrl?: string;
}

interface Product {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  buyLink: string;
  price: string;
  platform: string;
  category?: string;
}

interface PortalData {
  title: string;
  bio: string;
  userName: string;
  displayName?: string;
  avatarUrl?: string;
  slug: string;
  links: SocialLink[];
  products: Product[];
  templateId?: string;
  primaryColor?: string;
  backgroundImage?: string;
  backgroundType?: string;
  gradientStart?: string;
  gradientEnd?: string;
  textColor?: string;
  fontFamily?: string;
  isPremium?: boolean;
  customUsername?: string | null;
}

// Display Settings Modal
function PublicDisplaySettingsModal({ settings, onSave, onClose }: { settings: DisplaySettings; onSave: (s: DisplaySettings) => void; onClose: () => void }) {
  const [localSettings, setLocalSettings] = useState<DisplaySettings>(settings);

  const updateSetting = <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSave(newSettings);
  };

  const perRowOptions = [2, 3, 4, 5, 6];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Display Settings</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <span className="text-2xl">×</span>
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* View Style */}
          <div>
            <label className="block text-sm font-medium mb-3">View Style</label>
            <div className="flex gap-3">
              <button onClick={() => updateSetting('cardStyle', 'grid')} className={`flex-1 py-3 rounded-lg border transition flex items-center justify-center gap-2 ${localSettings.cardStyle === 'grid' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                <Grid className="w-4 h-4" /> Grid View
              </button>
              <button onClick={() => updateSetting('cardStyle', 'list')} className={`flex-1 py-3 rounded-lg border transition flex items-center justify-center gap-2 ${localSettings.cardStyle === 'list' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                <List className="w-4 h-4" /> List View
              </button>
            </div>
          </div>

          {/* Products Per Row - Only for Grid view */}
          {localSettings.cardStyle === 'grid' && (
            <div>
              <label className="block text-sm font-medium mb-3 flex items-center gap-2">Products Per Row ({localSettings.productsPerRow})</label>
              <div className="grid grid-cols-3 gap-2">
                {perRowOptions.map(option => (
                  <button key={option} onClick={() => updateSetting('productsPerRow', option)} className={`py-2 rounded-lg border transition ${localSettings.productsPerRow === option ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                    {option} columns
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toggle Options */}
          <div className="space-y-3">
            <button onClick={() => updateSetting('showDescriptions', !localSettings.showDescriptions)} className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-2">{localSettings.showDescriptions ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}<span>Show Descriptions</span></div>
              <div className={`w-10 h-5 rounded-full transition ${localSettings.showDescriptions ? 'bg-black' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition transform ${localSettings.showDescriptions ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
              </div>
            </button>
            <button onClick={() => updateSetting('showPrices', !localSettings.showPrices)} className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-2">{localSettings.showPrices ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}<span>Show Prices</span></div>
              <div className={`w-10 h-5 rounded-full transition ${localSettings.showPrices ? 'bg-black' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition transform ${localSettings.showPrices ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
              </div>
            </button>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white p-4 border-t">
          <button onClick={onClose} className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800">Done</button>
        </div>
      </div>
    </div>
  );
}

const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500', youtube: 'bg-red-600', tiktok: 'bg-black', facebook: 'bg-blue-600',
    twitter: 'bg-blue-400', linkedin: 'bg-blue-700', github: 'bg-gray-800', twitch: 'bg-purple-600', discord: 'bg-indigo-500',
    whatsapp: 'bg-green-500', telegram: 'bg-blue-500', amazon: 'bg-orange-500', myntra: 'bg-pink-600', flipkart: 'bg-blue-800',
    spotify: 'bg-green-600', apple: 'bg-black', snapchat: 'bg-yellow-400', pinterest: 'bg-red-700', reddit: 'bg-orange-600',
    email: 'bg-gray-500', phone: 'bg-green-500', website: 'bg-gray-600', linktree: 'bg-green-600'
  };
  return colors[platform.toLowerCase()] || 'bg-gray-600';
};

const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < 768) setDeviceType('mobile');
      else if (width < 1024) setDeviceType('tablet');
      else setDeviceType('desktop');
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  return deviceType;
};

export default function UserViewPage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  const [portal, setPortal] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [showPerRowDropdown, setShowPerRowDropdown] = useState(false);
  const [settings, setSettings] = useState<DisplaySettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  // Load saved settings or set defaults based on device
  useEffect(() => {
    const savedSettings = localStorage.getItem('public_view_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {}
    } else {
      // Set default based on device - list view for mobile, grid for desktop with 6 columns
      setSettings({
        productsPerRow: 6,
        cardStyle: isMobile ? 'list' : 'grid',
        showDescriptions: true,
        showPrices: true
      });
    }
  }, [isMobile]);

  const saveSettings = (newSettings: DisplaySettings) => {
    setSettings(newSettings);
    localStorage.setItem('public_view_settings', JSON.stringify(newSettings));
    setShowSettings(false);
  };

  useEffect(() => {
    if (!username) { setError(true); setLoading(false); return; }
    fetch(`/api/portal/public?username=${encodeURIComponent(username)}`)
      .then(res => res.json())
      .then(data => { if (data.error) setError(true); else setPortal(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [username]);

  // Get unique categories and their counts
  const availableCategories = useMemo(() => {
    if (!portal?.products) return [];
    const cats = new Set(portal.products.map(p => p.category || 'misc'));
    return ['all', ...Array.from(cats)];
  }, [portal?.products]);

  const categoryCounts = useMemo(() => {
    if (!portal?.products) return {};
    const counts: Record<string, number> = { all: portal.products.length };
    portal.products.forEach(p => {
      const cat = p.category || 'misc';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [portal?.products]);

  const filteredProducts = useMemo(() => {
    if (!portal?.products) return [];
    if (activeCategory === 'all') return portal.products;
    return portal.products.filter(p => (p.category || 'misc') === activeCategory);
  }, [portal?.products, activeCategory]);

  const toggleDescription = (productId: string) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) newSet.delete(productId);
      else newSet.add(productId);
      return newSet;
    });
  };

  const getCategoryIcon = (catId: string) => {
    const icons: Record<string, string> = {
      fashion: '👕', electronics: '📱', beauty: '💄', home: '🏠',
      books: '📚', sports: '⚽', toys: '🎮', health: '💊',
      automotive: '🚗', misc: '📦', all: '🎯'
    };
    return icons[catId] || '📦';
  };

  const getCategoryName = (catId: string) => {
    const names: Record<string, string> = {
      fashion: 'Fashion', electronics: 'Electronics', beauty: 'Beauty',
      home: 'Home', books: 'Books', sports: 'Sports', toys: 'Toys',
      health: 'Health', automotive: 'Automotive', misc: 'Other', all: 'All Products'
    };
    return names[catId] || catId;
  };

  const perRowOptions = [2, 3, 4, 5, 6];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div><p className="text-gray-500">Loading...</p></div></div>;
  }

  if (error || !portal) {
    return <div className="min-h-screen flex items-center justify-center text-center"><div><h1 className="text-2xl font-bold text-gray-800">Page Not Found</h1><p className="text-gray-500 mt-2">This creator page doesn't exist</p></div></div>;
  }

  const template = getTemplateById(portal.templateId || 'template1');
  const fontFamilyClass = portal.fontFamily || 'font-sans';

  const backgroundStyle: React.CSSProperties = {};
  let backgroundImageUrl = portal.backgroundImage;
  if (backgroundImageUrl && !backgroundImageUrl.startsWith('http') && !backgroundImageUrl.startsWith('/')) backgroundImageUrl = `/${backgroundImageUrl}`;

  if (portal.backgroundType === 'image' && backgroundImageUrl) {
    backgroundStyle.backgroundImage = `url(${backgroundImageUrl})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
    backgroundStyle.backgroundAttachment = isMobile ? 'scroll' : 'fixed';
    backgroundStyle.minHeight = '100vh';
  } else if (portal.backgroundType === 'gradient' && portal.gradientStart && portal.gradientEnd) {
    backgroundStyle.background = `linear-gradient(135deg, ${portal.gradientStart}, ${portal.gradientEnd})`;
    backgroundStyle.minHeight = '100vh';
  } else {
    backgroundStyle.backgroundColor = portal.primaryColor || template.defaultBackground;
    backgroundStyle.minHeight = '100vh';
  }

  const displayTitle = portal.displayName || (portal.title && portal.title !== 'My Creator Portal' ? portal.title : portal.userName);
  const displayBio = portal.bio || '';
  const displayTextColor = portal.textColor || template.defaultTextColor;
  const customTextColorStyle = { color: displayTextColor };
  const socialAccounts = portal.links || [];
  const maxWidth = isMobile ? 'max-w-md' : 'max-w-7xl';
  const hasCategories = availableCategories.length > 1;
  const showOverlay = portal.backgroundType === 'image' && backgroundImageUrl;

  return (
    <div className={`min-h-screen ${fontFamilyClass}`} style={backgroundStyle}>
      {showOverlay && <div className="fixed inset-0 bg-black/40 pointer-events-none" />}

      {/* Settings Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button onClick={() => setShowSettings(true)} className="bg-black/80 backdrop-blur-sm text-white p-3 rounded-full shadow-lg hover:bg-black transition">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className={`relative z-10 ${maxWidth} mx-auto px-4 py-8 ${isMobile ? '' : 'px-6'}`}>
        {/* Profile Section */}
        <div className="text-center mb-10" style={customTextColorStyle}>
          <div className="relative inline-block">
            {portal.avatarUrl ? (
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden ring-4 ring-white/20 shadow-lg">
                <img src={portal.avatarUrl} alt={displayTitle} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
            ) : (
              <div className="w-28 h-28 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl shadow-lg">
                {displayTitle?.charAt(0).toUpperCase() || '👤'}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold mt-4 mb-2">{displayTitle}</h1>
          {displayBio && <div className="mt-3 max-w-lg mx-auto"><p className="text-base opacity-85 whitespace-pre-wrap leading-relaxed">{displayBio}</p></div>}
        </div>

        {/* Social Links */}
        {socialAccounts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 justify-center" style={customTextColorStyle}>
              <span className="text-xl">🔗</span> Connect With Me <span className="text-xs opacity-60">({socialAccounts.length})</span>
            </h2>
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
              {socialAccounts.map((link) => {
                const platform = link.title?.toLowerCase() || '';
                const bgColor = getPlatformColor(platform);
                return (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className={`${bgColor} rounded-xl p-4 text-white flex items-center gap-3 hover:scale-[1.02] transition-transform shadow-sm group`}>
                    <PlatformIcon platform={platform} customIconUrl={link.iconUrl} className="w-6 h-6" />
                    <span className="flex-1 font-medium">{link.title}</span>
                    <span className="text-white/70 group-hover:translate-x-1 transition text-lg">→</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Products Section */}
        {portal.products.length > 0 && (
          <div className="mb-10">
            {/* Header with Controls - Same as dashboard */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold flex items-center gap-2" style={customTextColorStyle}>
                  <span className="text-xl">🛍️</span> My Products
                  <span className="text-xs opacity-60">({filteredProducts.length})</span>
                </h2>
                {/* Filter Button - Toggles filter bar */}
                <button
                  onClick={() => setShowFilterBar(!showFilterBar)}
                  className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 transition ${showFilterBar ? 'bg-black text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  style={showFilterBar ? {} : customTextColorStyle}
                >
                  <Filter className="w-3 h-3" />
                  {showFilterBar ? 'Hide' : 'Filter'}
                </button>
              </div>

              {/* View Controls */}
              <div className="flex gap-2 items-center">
                {/* View Style Toggle */}
                <div className="flex bg-white/20 backdrop-blur-sm rounded-lg p-0.5">
                  <button
                    onClick={() => saveSettings({ ...settings, cardStyle: 'grid' })}
                    className={`p-1.5 rounded-md transition ${settings.cardStyle === 'grid' ? 'bg-black text-white' : 'text-white/60 hover:text-white'}`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => saveSettings({ ...settings, cardStyle: 'list' })}
                    className={`p-1.5 rounded-md transition ${settings.cardStyle === 'list' ? 'bg-black text-white' : 'text-white/60 hover:text-white'}`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Per Row Selector - Only in Grid view */}
                {settings.cardStyle === 'grid' && (
                  <div className="relative">
                    <button
                      onClick={() => setShowPerRowDropdown(!showPerRowDropdown)}
                      className="flex items-center gap-1 px-2 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs text-white hover:bg-white/30 transition"
                    >
                      <Columns className="w-3 h-3" />
                      {settings.productsPerRow} cols
                      <span className="text-xs">▼</span>
                    </button>
                    {showPerRowDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowPerRowDropdown(false)} />
                        <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg z-50 min-w-[80px] overflow-hidden">
                          {perRowOptions.map(option => (
                            <button
                              key={option}
                              onClick={() => {
                                saveSettings({ ...settings, productsPerRow: option });
                                setShowPerRowDropdown(false);
                              }}
                              className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-100 transition ${
                                settings.productsPerRow === option ? 'text-purple-600 bg-gray-50' : 'text-gray-700'
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
              </div>
            </div>

            {/* Filter Bar - Same as dashboard */}
            {showFilterBar && hasCategories && (
              <div className="mb-4 p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filter by Category
                  </h3>
                  {activeCategory !== 'all' && (
                    <button
                      onClick={() => setActiveCategory('all')}
                      className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map(cat => {
                    const category = getCategoryById(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 ${
                          activeCategory === cat
                            ? 'bg-black text-white'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        <span>{category?.icon || getCategoryIcon(cat)}</span>
                        <span>{category?.name || getCategoryName(cat)}</span>
                        <span className={`text-xs ${activeCategory === cat ? 'text-white/70' : 'text-white/50'}`}>
                          ({categoryCounts[cat] || 0})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Products Display */}
            <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/60">No products in this category</p>
                </div>
              ) : settings.cardStyle === 'list' ? (
                /* LIST VIEW */
                <div className="space-y-3">
                  {filteredProducts.map((product) => {
                    let imageUrl = product.imageUrl;
                    if (imageUrl && imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
                    const isExpanded = expandedProducts.has(product.id);
                    const hasLongDescription = (product.description?.length || 0) > 100;
                    return (
                      <div key={product.id} className="bg-white/20 backdrop-blur-sm rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
                        <div className="flex gap-4 p-4">
                          <a href={product.buyLink} target="_blank" rel="noopener noreferrer" className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            <OptimizedImage src={imageUrl} alt={product.title} width={96} height={96} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" quality={75} />
                          </a>
                          <div className="flex-1 min-w-0">
                            <a href={product.buyLink} target="_blank" rel="noopener noreferrer">
                              <h3 className="font-semibold text-white line-clamp-1 hover:underline transition">{product.title}</h3>
                            </a>
                            {settings.showPrices && product.price && (
                              <p className="text-lg font-bold text-green-400 mt-1">{product.price}</p>
                            )}
                            {settings.showDescriptions && product.description && (
                              <div className="mt-1">
                                <p className={`text-sm text-white/80 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>{product.description}</p>
                                {hasLongDescription && (
                                  <button onClick={() => toggleDescription(product.id)} className="text-xs text-purple-300 hover:text-purple-200 mt-1 font-medium">
                                    {isExpanded ? 'Show less ↑' : 'Read more ↓'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <a href={product.buyLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-white/30 hover:bg-white/40 text-white text-sm font-medium rounded-lg transition-all duration-300">
                              Shop Now →
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* GRID VIEW */
                <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${settings.productsPerRow}, minmax(0, 1fr))` }}>
                  {filteredProducts.map((product) => {
                    let imageUrl = product.imageUrl;
                    if (imageUrl && imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
                    return (
                      <div key={product.id} className="bg-white/20 backdrop-blur-sm rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group">
                        <a href={product.buyLink} target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden">
                          <div className="relative w-full aspect-square bg-gray-100">
                            <OptimizedImage src={imageUrl} alt={product.title} width={300} height={300} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" quality={75} />
                          </div>
                        </a>
                        <div className="p-3 flex-1 flex flex-col">
                          <a href={product.buyLink} target="_blank" rel="noopener noreferrer">
                            <h3 className="font-semibold text-sm text-white line-clamp-2 hover:underline transition">{product.title}</h3>
                          </a>
                          {settings.showPrices && product.price && (
                            <p className="text-lg font-bold text-green-400 mt-1">{product.price}</p>
                          )}
                          {settings.showDescriptions && product.description && (
                            <div className="mt-2">
                              <p className="text-xs text-white/70 leading-relaxed line-clamp-3">{product.description}</p>
                            </div>
                          )}
                          <div className="mt-3">
                            <a href={product.buyLink} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white/30 hover:bg-white/40 text-white text-sm font-medium py-2 rounded-lg transition-all duration-300">
                              Shop Now →
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-6 border-t border-white/20 text-xs opacity-60" style={customTextColorStyle}>
          <p>© {new Date().getFullYear()} {displayTitle} • Powered by CreatorPortal</p>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && <PublicDisplaySettingsModal settings={settings} onSave={saveSettings} onClose={() => setShowSettings(false)} />}
    </div>
  );
}