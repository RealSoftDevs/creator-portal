// app/studio/page.tsx (Complete updated version)

'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Palette, Crown, ArrowLeft, Plus, Trash2, Eye, Check, X, Edit2, Loader2, Layers } from 'lucide-react';
import { getTemplateById } from '@/lib/templates/index';
import { useStudioData } from './hooks/useStudioData';
import { useBackButton } from '@/app/hooks/useBackButton';
import { useAuth } from '@/app/hooks/useAuth';
import CloudinaryImage from '@/app/components/CloudinaryImage';

// Lazy load heavy components
const TemplateSelectorModal = lazy(() => import('../components/TemplateSelectorModal'));
const AddLinkModal = lazy(() => import('./components/AddLinkModal'));
const AddProductModal = lazy(() => import('./components/AddProductModal'));

export default function StudioDashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth('/login');
  const [isPremium, setIsPremium] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // NEW: Separate state for Public and Admin
  const [publicSettings, setPublicSettings] = useState({
    templateId: 'template1',
    primaryColor: '#f5f5f5',
    textColor: '',
    fontFamily: 'font-sans',
    backgroundType: 'image',
    gradientStart: '',
    gradientEnd: '',
    backgroundImage: '/images/default-bg.jpg'
  });

  const [adminSettings, setAdminSettings] = useState({
    templateId: 'template1',
    primaryColor: '#f5f5f5',
    textColor: '',
    fontFamily: 'font-sans',
    backgroundType: 'image',
    gradientStart: '',
    gradientEnd: '',
    backgroundImage: '/images/default-bg.jpg'
  });

  // NEW: Flag to use separate admin styling
  const [useSeparateAdminStyle, setUseSeparateAdminStyle] = useState(false);

  const { links, products, loading, portalSlug, addLink, addProduct, deleteLink, deleteProduct, fetchLinks, fetchProducts } = useStudioData();

  const handleGoToDashboard = () => router.push('/dashboard');
  useBackButton(handleGoToDashboard, true);

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

  const checkPremiumStatus = async () => {
    try {
      const res = await fetch('/api/user/status');
      const data = await res.json();
      setIsPremium(data.isPremium);
    } catch (error) {
      console.error('Failed to check premium status:', error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const res = await fetch('/api/portal/info');
      const data = await res.json();
      if (data.userName) {
        setUserName(data.userName);
        setCustomUsername(data.userName);
      } else if (data.slug) {
        setUserName(data.slug);
        setCustomUsername(data.slug);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

 // app/studio/page.tsx - Update the loadCurrentSettings function

 // In app/studio/page.tsx - ensure loadCurrentSettings is correct
 const loadCurrentSettings = async () => {
   try {
     const res = await fetch('/api/portal/info');
     const data = await res.json();

     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
     console.log('🎨 STUDIO - Loading Settings');
     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
     console.log('MAIN backgroundType:', data.backgroundType);
     console.log('MAIN backgroundImage:', data.backgroundImage);
     console.log('ADMIN backgroundType:', data.adminBackgroundType);
     console.log('ADMIN backgroundImage:', data.adminBackgroundImage);
     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

     // Load Public settings (MAIN fields)
     setPublicSettings({
       templateId: data.templateId || 'template1',
       primaryColor: data.primaryColor || '#f5f5f5',
       textColor: data.textColor || '#1a1a1a',
       fontFamily: data.fontFamily || 'font-sans',
       backgroundType: data.backgroundType || 'image',
       gradientStart: data.gradientStart || '#fb923c',
       gradientEnd: data.gradientEnd || '#fde047',
       backgroundImage: data.backgroundImage || '/images/default-bg.jpg'
     });

     // Load Admin settings - USE ADMIN FIELDS FIRST
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
 };
  const updateUsername = async () => {
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
  };

  // FIXED: Update only the target (public OR admin, not both)
  const updateTemplate = async (config: any) => {
    try {
      const response = await fetch('/api/portal/update-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();

      if (data.success) {
        if (config.target === 'public') {
          // Update ONLY public settings
          setPublicSettings({
            templateId: config.templateId,
            primaryColor: config.primaryColor,
            textColor: config.textColor || '',
            fontFamily: config.fontFamily || 'font-sans',
            backgroundType: config.backgroundType,
            gradientStart: config.gradientStart || '',
            gradientEnd: config.gradientEnd || '',
            backgroundImage: config.backgroundImage || '/images/default-bg.jpg'
          });

          // If not using separate admin style, also update admin to match
          if (!useSeparateAdminStyle) {
            setAdminSettings({
              templateId: config.templateId,
              primaryColor: config.primaryColor,
              textColor: config.textColor || '',
              fontFamily: config.fontFamily || 'font-sans',
              backgroundType: config.backgroundType,
              gradientStart: config.gradientStart || '',
              gradientEnd: config.gradientEnd || '',
              backgroundImage: config.backgroundImage || '/images/default-bg.jpg'
            });
          }
          console.log('✅ Updated PUBLIC settings only');

        } else if (config.target === 'admin') {
          // Update ONLY admin settings
          setAdminSettings({
            templateId: config.templateId,
            primaryColor: config.primaryColor,
            textColor: config.textColor || '',
            fontFamily: config.fontFamily || 'font-sans',
            backgroundType: config.backgroundType,
            gradientStart: config.gradientStart || '',
            gradientEnd: config.gradientEnd || '',
            backgroundImage: config.backgroundImage || '/images/default-bg.jpg'
          });
          setUseSeparateAdminStyle(true);
          console.log('✅ Updated ADMIN settings only');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating template:', error);
      return false;
    }
  };

  const handleUpgradeClick = () => setShowPaymentModal(true);
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const realProductsCount = products.filter((p: any) => !p.isDummy).length;
  const canAddLink = () => !(!isPremium && links.length >= 1);
  const canAddProduct = () => !(!isPremium && realProductsCount >= 4);

  const handleAddLink = async (linkData: any) => {
    if (!canAddLink()) {
      alert('✨ Free users can only add 1 link. Upgrade to Premium for more links!');
      return;
    }
    await addLink(linkData);
  };

  const handleAddProduct = async (product: any) => {
    if (!canAddProduct()) {
      alert('✨ Free users can only add 4 products. Upgrade to Premium for more!');
      return;
    }
    await addProduct(product);
  };

  const totalClicks = links.reduce((sum: number, link: any) => sum + (link.clicks || 0), 0);
  const template = getTemplateById(adminSettings.templateId);

  // Build background style for ADMIN page (studio display)
  const backgroundStyle: React.CSSProperties = {};

  let bgImageUrl = adminSettings.backgroundImage;
  if (bgImageUrl && !bgImageUrl.startsWith('http') && !bgImageUrl.startsWith('/')) {
    bgImageUrl = `/${bgImageUrl}`;
  }

  if (adminSettings.backgroundType === 'image' && bgImageUrl) {
    backgroundStyle.backgroundImage = `url(${bgImageUrl})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
    backgroundStyle.backgroundAttachment = 'fixed';
    backgroundStyle.minHeight = '100vh';
  } else if (adminSettings.backgroundType === 'gradient' && adminSettings.gradientStart && adminSettings.gradientEnd) {
    backgroundStyle.background = `linear-gradient(135deg, ${adminSettings.gradientStart}, ${adminSettings.gradientEnd})`;
  } else {
    backgroundStyle.backgroundColor = adminSettings.primaryColor || template.defaultBackground;
  }

  const textColorStyle = { color: adminSettings.textColor || template.defaultTextColor };
  const fontClass = adminSettings.fontFamily || 'font-sans';


const getPublicUrl = () => {
  if (typeof window === 'undefined') return '';
  const baseUrl = window.location.origin;

  // Premium users with custom username - ONLY show custom URL
  if (isPremium && userName && userName !== portalSlug) {
    return `${baseUrl}/view/${userName}`;
  }

  // Free users or premium without custom name - show slug URL
  return `${baseUrl}/view?slug=${portalSlug}`;
};

// For the preview button - use the same logic
const getPreviewUrl = () => {
  if (typeof window === 'undefined') return '';
  const baseUrl = window.location.origin;

  if (isPremium && userName && userName !== portalSlug) {
    return `${baseUrl}/view/${userName}`;
  }
  return `${baseUrl}/view?slug=${portalSlug}`;
};

  // Loading state
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

  // Determine which settings to show in template selector
  const templateSelectorSettings = useSeparateAdminStyle ? adminSettings : publicSettings;

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

          {/* Public Page Card */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">Your public page</p>
              <button onClick={() => window.open(getPublicUrl(), '_blank')} className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-white/30 transition">
                <Eye className="w-4 h-4" /> Preview
              </button>
            </div>
            <p className="font-mono text-xs break-all">{getPublicUrl()}</p>

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
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold" style={textColorStyle}>{links.length}</div>
              <div className="text-xs opacity-70" style={textColorStyle}>Links {!isPremium ? `(1/1)` : `(${links.length}/10)`}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold" style={textColorStyle}>{realProductsCount}</div>
              <div className="text-xs opacity-70" style={textColorStyle}>Products {!isPremium ? `(${realProductsCount}/4)` : `(${realProductsCount}/50)`}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold" style={textColorStyle}>{totalClicks}</div>
              <div className="text-xs opacity-70" style={textColorStyle}>Clicks</div>
            </div>
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
                  <div key={link.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-sm flex items-center gap-3">
                    {link.imageUrl && (
                      <CloudinaryImage
                        src={link.imageUrl}
                        alt=""
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate" style={textColorStyle}>{link.title}</h3>
                      <p className="text-xs opacity-60 truncate" style={textColorStyle}>{link.url}</p>
                      {link.clicks > 0 && <p className="text-xs text-green-600 mt-1">{link.clicks} clicks</p>}
                    </div>
                    <button onClick={() => deleteLink(link.id)} className="p-2 rounded-full hover:bg-red-500/20 transition">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gallery Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={textColorStyle}>
                🖼️ Gallery
                <span className="text-xs opacity-60">({realProductsCount}/50)</span>
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
                  <div key={product.id} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm">
                    <CloudinaryImage
                      src={product.imageUrl}
                      alt={product.title}
                      width={400}
                      height={400}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-2">
                      <h3 className="font-medium text-sm truncate" style={textColorStyle}>{product.title}</h3>
                      {product.price && <p className="text-xs text-green-600">{product.price}</p>}
                      <button
                        onClick={() => { if (confirm(`Delete "${product.title}"?`)) deleteProduct(product.id); }}
                        className="text-xs text-red-500 mt-1 hover:text-red-700 transition"
                      >
                        Delete
                      </button>
                      {product.isDummy && <p className="text-xs text-gray-400 mt-1">Sample product</p>}
                    </div>
                  </div>
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
        {showTemplateSelector && (
          <TemplateSelectorModal
            isPremium={isPremium}
            selectedTemplate={templateSelectorSettings.templateId}
            primaryColor={templateSelectorSettings.primaryColor}
            textColor={templateSelectorSettings.textColor}
            fontFamily={templateSelectorSettings.fontFamily}
            backgroundType={templateSelectorSettings.backgroundType}
            gradientStart={templateSelectorSettings.gradientStart}
            gradientEnd={templateSelectorSettings.gradientEnd}
            backgroundImage={templateSelectorSettings.backgroundImage}
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