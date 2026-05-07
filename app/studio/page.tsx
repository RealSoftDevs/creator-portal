// app/studio/page.tsx
'use client';

import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, Palette, Crown, ArrowLeft, Plus, Trash2, Eye, Check, X, Edit2, Loader2, Layers, ExternalLink
} from 'lucide-react';
import { getTemplateById } from '@/lib/templates/index';
import { useStudioData } from './hooks/useStudioData';
import { useBackButton } from '@/app/hooks/useBackButton';
import { useAuth } from '@/app/hooks/useAuth';
import ProductImage from './components/ProductImage';
import EditProductModal from './components/EditProductModal';

// Lazy load heavy components
const TemplateSelectorModal = lazy(() => import('../components/TemplateSelectorModal'));
const AddLinkModal = lazy(() => import('./components/AddLinkModal'));
const AddProductModal = lazy(() => import('./components/AddProductModal'));

// Memoized stat card component for performance
const StatCard = ({ value, label, limit, isPremium, textColorStyle }: any) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center shadow-sm">
    <div className="text-2xl font-bold" style={textColorStyle}>{value}</div>
    <div className="text-xs opacity-70" style={textColorStyle}>
      {label} {limit && `(${value}/${limit})`}
    </div>
    {!isPremium && value >= (limit || 0) && (
      <div className="text-[10px] text-yellow-500 mt-1">✨ Upgrade for more</div>
    )}
  </div>
);

// Memoized link item component
const LinkItem = ({ link, textColorStyle, onDelete }: any) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-sm flex items-center gap-3 group">
    {link.imageUrl && link.imageUrl !== '' && (
      <ProductImage src={link.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
    )}
    <div className="flex-1 min-w-0">
      <h3 className="font-medium truncate" style={textColorStyle}>{link.title}</h3>
      <p className="text-xs opacity-60 truncate" style={textColorStyle}>{link.url}</p>
      {link.clicks > 0 && <p className="text-xs text-green-600 mt-1">{link.clicks} clicks</p>}
    </div>
    <button onClick={() => onDelete(link.id)} className="p-2 rounded-full hover:bg-red-500/20 transition opacity-0 group-hover:opacity-100">
      <Trash2 className="w-4 h-4 text-red-500" />
    </button>
  </div>
);

// Memoized product item component with edit functionality
const ProductItem = ({ product, textColorStyle, onDelete, onEdit }: any) => {
  const hasValidImage = product.imageUrl &&
                        product.imageUrl !== '' &&
                        product.imageUrl !== 'null' &&
                        product.imageUrl !== 'undefined';

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm group">
      <div className="relative w-full h-32">
        {hasValidImage ? (
          <ProductImage src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl">🛍️</div>
              <p className="text-xs text-gray-400">No image</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="font-medium text-sm truncate" style={textColorStyle} title={product.title}>
          {product.title}
        </h3>
        {product.price && <p className="text-xs text-green-600">{product.price}</p>}
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mt-1" title={product.description}>
            {product.description}
          </p>
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onEdit(product)}
            className="text-xs text-blue-500 hover:text-blue-700 transition"
          >
            Edit
          </button>
          <button
            onClick={() => { if (confirm(`Delete "${product.title}"?`)) onDelete(product.id); }}
            className="text-xs text-red-500 hover:text-red-700 transition"
          >
            Delete
          </button>
          {product.buyLink && (
            <a
              href={product.buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700 transition flex items-center gap-1"
            >
              View <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        {product.isDummy && <p className="text-xs text-gray-400 mt-1">Sample product</p>}
      </div>
    </div>
  );
};

export default function StudioDashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth('/login');
  const [isPremium, setIsPremium] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const [adminSettings, setAdminSettings] = useState({
    templateId: 'template1',
    primaryColor: '#f5f5f5',
    textColor: '#1a1a1a',
    fontFamily: 'font-sans',
    backgroundType: 'image',
    gradientStart: '#fb923c',
    gradientEnd: '#fde047',
    backgroundImage: '/images/default-bg.jpg'
  });

  const [useSeparateAdminStyle, setUseSeparateAdminStyle] = useState(false);

  // Destructure all needed functions from useStudioData
  const {
    links,
    products,
    loading,
    portalSlug,
    addLink,
    addProduct,
    updateProduct,
    deleteLink,
    deleteProduct,
    fetchLinks,
    fetchProducts
  } = useStudioData();

  const handleGoToDashboard = useCallback(() => router.push('/dashboard'), [router]);
  useBackButton(handleGoToDashboard, true);

  // Calculate stats with useMemo for performance
  const stats = useMemo(() => {
    const realProductsCount = products.filter((p: any) => !p.isDummy).length;
    const totalClicks = links.reduce((sum: number, link: any) => sum + (link.clicks || 0), 0);
    return { realProductsCount, totalClicks };
  }, [products, links]);

  useEffect(() => {
    if (isAuthenticated) {
      const init = async () => {
        setIsLoadingSettings(true);
        await Promise.all([
          loadCurrentSettings(),
          fetchUserInfo(),
          checkPremiumStatus(),
          fetchLinks(),
          fetchProducts()
        ]);
        setIsLoadingSettings(false);
      };
      init();
    }
  }, [isAuthenticated]);

  const checkPremiumStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/user/status');
      const data = await res.json();
      setIsPremium(data.isPremium);
    } catch (error) {
      console.error('Failed to check premium status:', error);
    }
  }, []);

  const fetchUserInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/portal/info');
      const data = await res.json();
      if (data.userName) setUserName(data.userName);
      else if (data.slug) setUserName(data.slug);
      setCustomUsername(data.userName || data.slug);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  }, []);

  const loadCurrentSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/portal/info');
      const data = await res.json();

      const hasSeparateAdmin = data.adminTemplateId !== null && data.adminTemplateId !== undefined;
      setUseSeparateAdminStyle(hasSeparateAdmin);

      setAdminSettings({
        templateId: data.adminTemplateId || data.templateId || 'template1',
        primaryColor: data.adminPrimaryColor || data.primaryColor || '#f5f5f5',
        textColor: data.adminTextColor || data.textColor || '#1a1a1a',
        fontFamily: data.adminFontFamily || data.fontFamily || 'font-sans',
        backgroundType: data.adminBackgroundType || data.backgroundType || 'image',
        gradientStart: data.adminGradientStart || data.gradientStart || '#fb923c',
        gradientEnd: data.adminGradientEnd || data.gradientEnd || '#fde047',
        backgroundImage: data.adminBackgroundImage || data.backgroundImage || '/images/default-bg.jpg'
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  const updateUsername = useCallback(async () => {
    if (!isPremium) {
      alert('✨ Custom URL is a premium feature. Please upgrade to use it!');
      setIsEditingUsername(false);
      return;
    }

    if (!customUsername.trim() || customUsername.trim().length < 3) {
      alert('Username must be at least 3 characters');
      return;
    }

    const validUsername = customUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (validUsername !== customUsername.toLowerCase()) {
      alert('Username can only contain letters, numbers, and underscores');
      setCustomUsername(validUsername);
      return;
    }

    try {
      const res = await fetch('/api/portal/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: validUsername })
      });

      const data = await res.json();
      if (data.success) {
        setUserName(validUsername);
        setIsEditingUsername(false);
        alert(`Your page is now at: ${window.location.origin}/view/${validUsername}`);
      } else {
        alert(data.error || 'Username already taken');
      }
    } catch (error) {
      console.error('Failed to update username:', error);
      alert('Failed to update username');
    }
  }, [isPremium, customUsername]);

  const updateTemplate = useCallback(async (config: any) => {
    try {
      const response = await fetch('/api/portal/update-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();

      if (data.success && config.target === 'admin') {
        setAdminSettings(prev => ({
          ...prev,
          templateId: config.templateId,
          primaryColor: config.primaryColor,
          textColor: config.textColor || '',
          fontFamily: config.fontFamily || 'font-sans',
          backgroundType: config.backgroundType,
          gradientStart: config.gradientStart || '',
          gradientEnd: config.gradientEnd || '',
          backgroundImage: config.backgroundImage || '/images/default-bg.jpg'
        }));
        setUseSeparateAdminStyle(true);
      }
      return data.success;
    } catch (error) {
      console.error('Error updating template:', error);
      return false;
    }
  }, []);

  const handleUpgradeClick = useCallback(() => setShowPaymentModal(true), []);
  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }, [router]);

  const canAddLink = useCallback(() => !(!isPremium && links.length >= 1), [isPremium, links.length]);
  const canAddProduct = useCallback(() => !(!isPremium && stats.realProductsCount >= 4), [isPremium, stats.realProductsCount]);

  const handleAddLink = useCallback(async (linkData: any) => {
    if (!canAddLink()) {
      alert('✨ Free users can only add 1 link. Upgrade to Premium for more links!');
      return;
    }
    await addLink(linkData);
  }, [canAddLink, addLink]);

  const handleAddProduct = useCallback(async (product: any) => {
    if (!canAddProduct()) {
      alert('✨ Free users can only add 4 products. Upgrade to Premium for more!');
      return;
    }
    await addProduct(product);
  }, [canAddProduct, addProduct]);

  const handleEditProduct = useCallback((product: any) => {
    setEditingProduct(product);
    setShowEditProductModal(true);
  }, []);

  const handleUpdateProduct = useCallback(async (id: string, updates: any) => {
    await updateProduct(id, updates);
  }, [updateProduct]);

  const getPublicUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;

    if (isPremium && userName && userName !== portalSlug) {
      return `${baseUrl}/view/${userName}`;
    }

    return `${baseUrl}/view?slug=${portalSlug}`;
  }, [isPremium, userName, portalSlug]);

  const template = getTemplateById(adminSettings.templateId);

  const backgroundStyle = useMemo(() => {
    const style: React.CSSProperties = {};
    let bgImageUrl = adminSettings.backgroundImage;

    if (bgImageUrl && !bgImageUrl.startsWith('http') && !bgImageUrl.startsWith('/')) {
      bgImageUrl = `/${bgImageUrl}`;
    }

    if (adminSettings.backgroundType === 'image' && bgImageUrl) {
      style.backgroundImage = `url(${bgImageUrl})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
      style.backgroundAttachment = 'fixed';
      style.minHeight = '100vh';
    } else if (adminSettings.backgroundType === 'gradient' && adminSettings.gradientStart && adminSettings.gradientEnd) {
      style.background = `linear-gradient(135deg, ${adminSettings.gradientStart}, ${adminSettings.gradientEnd})`;
    } else {
      style.backgroundColor = adminSettings.primaryColor || template.defaultBackground;
    }
    return style;
  }, [adminSettings.backgroundType, adminSettings.backgroundImage, adminSettings.gradientStart,
      adminSettings.gradientEnd, adminSettings.primaryColor, template.defaultBackground]);

  const textColorStyle = useMemo(() => ({ color: adminSettings.textColor || template.defaultTextColor }),
    [adminSettings.textColor, template.defaultTextColor]);
  const fontClass = adminSettings.fontFamily || 'font-sans';

  if (authLoading || isLoadingSettings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading your studio...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={`min-h-screen ${fontClass}`} style={backgroundStyle}>
      {adminSettings.backgroundType === 'image' && adminSettings.backgroundImage && (
        <div className="fixed inset-0 bg-black/20 pointer-events-none" />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={handleGoToDashboard} className="p-1 rounded-full hover:bg-white/20 transition">
                <ArrowLeft className="w-5 h-5" style={textColorStyle} />
              </button>
              <h1 className="text-xl font-bold" style={textColorStyle}>Creator Studio</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowTemplateSelector(true)} className="p-2 rounded-full hover:bg-white/20 transition">
                <Palette className="w-5 h-5" style={textColorStyle} />
              </button>
              <button onClick={handleLogout} className="p-2 rounded-full hover:bg-white/20 transition">
                <LogOut className="w-5 h-5" style={textColorStyle} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          {/* Style Mode Toggle */}
          {isPremium && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" style={textColorStyle} />
                  <span className="text-sm" style={textColorStyle}>Style Mode</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseSeparateAdminStyle(false)}
                    className={`px-3 py-1 rounded-lg text-xs transition ${
                      !useSeparateAdminStyle ? 'bg-black text-white' : 'bg-white/20 text-white/70 hover:bg-white/30'
                    }`}
                  >
                    Same for both
                  </button>
                  <button
                    onClick={() => setUseSeparateAdminStyle(true)}
                    className={`px-3 py-1 rounded-lg text-xs transition ${
                      useSeparateAdminStyle ? 'bg-black text-white' : 'bg-white/20 text-white/70 hover:bg-white/30'
                    }`}
                  >
                    Different styles
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Public Page Card */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">Your public page</p>
              <button onClick={() => window.open(getPublicUrl(), '_blank')} className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-white/30 transition">
                <Eye className="w-4 h-4" /> Preview
              </button>
            </div>

            {isPremium && userName && userName !== portalSlug ? (
              <>
                <p className="font-mono text-xs break-all">
                  {typeof window !== 'undefined' && window.location.origin}/view/{userName}
                </p>
                <p className="text-[10px] opacity-60 mt-1">
                  ℹ️ Old URL still works: {typeof window !== 'undefined' && window.location.origin}/view?slug={portalSlug}
                </p>
              </>
            ) : (
              <p className="font-mono text-xs break-all">{getPublicUrl()}</p>
            )}

            {isPremium ? (
              <div className="mt-3 pt-2 border-t border-white/20">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs opacity-80">✨ Custom URL:</span>
                  <span className="text-xs opacity-60">{typeof window !== 'undefined' && window.location.origin}/view/</span>
                  {isEditingUsername ? (
                    <>
                      <input
                        type="text"
                        value={customUsername}
                        onChange={(e) => setCustomUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="yourname"
                        className="flex-1 min-w-[100px] px-2 py-0.5 rounded bg-white/20 text-white text-xs focus:outline-none focus:ring-1 focus:ring-white"
                        autoFocus
                      />
                      <button onClick={updateUsername} className="text-green-300 text-xs p-0.5 hover:bg-white/10 rounded">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={() => { setIsEditingUsername(false); setCustomUsername(userName); }} className="text-red-300 text-xs p-0.5 hover:bg-white/10 rounded">
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { setCustomUsername(userName || portalSlug || ''); setIsEditingUsername(true); }} className="text-xs text-white/80 hover:text-white underline flex items-center gap-1">
                      {userName || portalSlug || 'set-custom-url'} <Edit2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-3 pt-2 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-80">✨ Custom URL</span>
                  <button onClick={() => setShowPaymentModal(true)} className="bg-yellow-500/30 text-yellow-200 text-xs px-2 py-0.5 rounded-full hover:bg-yellow-500/40 transition">
                    Upgrade
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard value={links.length} label="Links" limit={isPremium ? 10 : 1} isPremium={isPremium} textColorStyle={textColorStyle} />
            <StatCard value={stats.realProductsCount} label="Products" limit={isPremium ? 50 : 4} isPremium={isPremium} textColorStyle={textColorStyle} />
            <StatCard value={stats.totalClicks} label="Clicks" limit={null} isPremium={true} textColorStyle={textColorStyle} />
          </div>

          {/* Links Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={textColorStyle}>
                🔗 Links
                <span className="text-xs opacity-60">({links.length}/10)</span>
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={!isPremium && links.length >= 1}
                className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 transition ${
                  (!isPremium && links.length >= 1)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                <Plus className="w-4 h-4" /> Add link
              </button>
            </div>

            {links.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
                <p className="opacity-70" style={textColorStyle}>No links yet</p>
                <button onClick={() => setShowAddModal(true)} className="mt-3 text-black underline text-sm">
                  Add your first link
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {links.map((link: any) => (
                  <LinkItem key={link.id} link={link} textColorStyle={textColorStyle} onDelete={deleteLink} />
                ))}
              </div>
            )}
          </div>

          {/* Gallery Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={textColorStyle}>
                🖼️ Gallery
                <span className="text-xs opacity-60">({stats.realProductsCount}/50)</span>
              </h2>
              <button
                onClick={() => setShowAddProductModal(true)}
                disabled={!canAddProduct()}
                className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 transition ${
                  !canAddProduct() ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
                <p className="opacity-70" style={textColorStyle}>No products in gallery</p>
                <button onClick={() => setShowAddProductModal(true)} className="mt-3 text-black underline text-sm">
                  Add your first product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {products.map((product: any) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    textColorStyle={textColorStyle}
                    onDelete={deleteProduct}
                    onEdit={handleEditProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals with lazy loading */}
      <Suspense fallback={null}>
        {showAddModal && <AddLinkModal onClose={() => setShowAddModal(false)} onSave={handleAddLink} />}
        {showAddProductModal && <AddProductModal onClose={() => setShowAddProductModal(false)} onSave={handleAddProduct} />}
        {showEditProductModal && editingProduct && (
          <EditProductModal
            product={editingProduct}
            onClose={() => {
              setShowEditProductModal(false);
              setEditingProduct(null);
            }}
            onSave={handleUpdateProduct}
            onDelete={deleteProduct}
          />
        )}
        {showTemplateSelector && (
          <TemplateSelectorModal
            isPremium={isPremium}
            selectedTemplate={adminSettings.templateId}
            primaryColor={adminSettings.primaryColor}
            textColor={adminSettings.textColor}
            fontFamily={adminSettings.fontFamily}
            backgroundType={adminSettings.backgroundType}
            gradientStart={adminSettings.gradientStart}
            gradientEnd={adminSettings.gradientEnd}
            backgroundImage={adminSettings.backgroundImage}
            userName={userName}
            onClose={() => setShowTemplateSelector(false)}
            onSelectTemplate={updateTemplate}
            onUpgradeClick={handleUpgradeClick}
            onBack={() => setShowTemplateSelector(false)}
            showBack={true}
            useSeparateStyle={useSeparateAdminStyle}
            onStyleModeChange={setUseSeparateAdminStyle}
          />
        )}
      </Suspense>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Upgrade to Premium</h3>
            <p className="text-gray-600 mb-4">Get access to premium features!</p>
            <ul className="text-left text-sm space-y-2 mb-4">
              <li>✓ 10+ Premium Templates</li>
              <li>✓ Up to 10 Links</li>
              <li>✓ Up to 50 Products</li>
              <li>✓ Custom Colors & Gradients</li>
              <li>✓ Separate Admin Styling</li>
              <li>✓ ✨ Custom Page URL (/view/yourname)</li>
            </ul>
            <button onClick={handleUpgradeClick} className="w-full bg-black text-white py-3 rounded-xl">
              Upgrade Now - ₹999
            </button>
            <button onClick={() => setShowPaymentModal(false)} className="w-full mt-2 py-2 text-gray-500">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}