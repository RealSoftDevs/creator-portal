'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Palette, Crown, ArrowLeft, Plus, Trash2, Eye, Check, X, Edit2 } from 'lucide-react';
import { getTemplateById } from '@/lib/templates/index';
import TemplateSelectorModal from '../components/TemplateSelectorModal';
import { useStudioData } from './hooks/useStudioData';
import AddLinkModal from './components/AddLinkModal';
import AddProductModal from './components/AddProductModal';
import { useBackButton } from '@/app/hooks/useBackButton';
import { Product, Link } from '@/lib/types';
import { useAuth } from '@/app/hooks/useAuth';

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

  // Public page settings
  const [publicTemplate, setPublicTemplate] = useState('template1');
  const [publicPrimaryColor, setPublicPrimaryColor] = useState('#000000');
  const [publicTextColor, setPublicTextColor] = useState('');
  const [publicFontFamily, setPublicFontFamily] = useState('font-sans');
  const [publicBackgroundType, setPublicBackgroundType] = useState('color');
  const [publicGradientStart, setPublicGradientStart] = useState('');
  const [publicGradientEnd, setPublicGradientEnd] = useState('');
  const [publicBackgroundImage, setPublicBackgroundImage] = useState('');

  // Admin display settings - initial values
  const [adminDisplayTemplate, setAdminDisplayTemplate] = useState('template1');
  const [adminDisplayPrimaryColor, setAdminDisplayPrimaryColor] = useState('#f5f5f5');
  const [adminDisplayTextColor, setAdminDisplayTextColor] = useState('');
  const [adminDisplayFontFamily, setAdminDisplayFontFamily] = useState('font-sans');
  const [adminDisplayBackgroundType, setAdminDisplayBackgroundType] = useState('image');
  const [adminDisplayGradientStart, setAdminDisplayGradientStart] = useState('');
  const [adminDisplayGradientEnd, setAdminDisplayGradientEnd] = useState('');
  const [adminDisplayBackgroundImage, setAdminDisplayBackgroundImage] = useState('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800');
  const [useSeparateAdminStyle, setUseSeparateAdminStyle] = useState(false);

  const { links, products, loading, portalSlug, addLink, addProduct, deleteLink, deleteProduct, fetchLinks, fetchProducts } = useStudioData();

  // Handle physical back button - go to dashboard
  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };
  useBackButton(handleGoToDashboard, true);

  // Main initialization
  useEffect(() => {
    if (isAuthenticated) {
      const init = async () => {
        await loadCurrentSettings();
        await fetchUserInfo();
        await checkPremiumStatus();
        await fetchLinks();
        await fetchProducts();
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

  const loadCurrentSettings = async () => {
    try {
      const res = await fetch('/api/portal/info');
      const data = await res.json();

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎨 LOADING ADMIN SETTINGS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Raw API data:', data);

      // Update public settings
      setPublicTemplate(data.templateId || 'template1');
      setPublicPrimaryColor(data.primaryColor || '#f5f5f5');
      setPublicTextColor(data.textColor || '');
      setPublicFontFamily(data.fontFamily || 'font-sans');
      setPublicBackgroundType(data.backgroundType || 'image');
      setPublicGradientStart(data.gradientStart || '');
      setPublicGradientEnd(data.gradientEnd || '');
      setPublicBackgroundImage(data.backgroundImage || '');

      // Update admin display settings - USE VALUES FROM API
      setAdminDisplayTemplate(data.templateId || 'template1');
      setAdminDisplayPrimaryColor(data.primaryColor || '#f5f5f5');
      setAdminDisplayTextColor(data.textColor || '');
      setAdminDisplayFontFamily(data.fontFamily || 'font-sans');
      setAdminDisplayBackgroundType(data.backgroundType || 'image');
      setAdminDisplayGradientStart(data.gradientStart || '');
      setAdminDisplayGradientEnd(data.gradientEnd || '');
      setAdminDisplayBackgroundImage(data.backgroundImage || '');

      console.log('✅ Updated adminDisplayBackgroundType:', data.backgroundType);
      console.log('✅ Updated adminDisplayBackgroundImage:', data.backgroundImage);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
          setPublicTemplate(config.templateId);
          setPublicPrimaryColor(config.primaryColor);
          setPublicBackgroundType(config.backgroundType);
          if (config.textColor) setPublicTextColor(config.textColor);
          if (config.fontFamily) setPublicFontFamily(config.fontFamily);
          if (config.gradientStart) setPublicGradientStart(config.gradientStart);
          if (config.gradientEnd) setPublicGradientEnd(config.gradientEnd);
          if (config.backgroundImage) setPublicBackgroundImage(config.backgroundImage);

          if (!useSeparateAdminStyle) {
            setAdminDisplayTemplate(config.templateId);
            setAdminDisplayPrimaryColor(config.primaryColor);
            setAdminDisplayBackgroundType(config.backgroundType);
            if (config.textColor) setAdminDisplayTextColor(config.textColor);
            if (config.fontFamily) setAdminDisplayFontFamily(config.fontFamily);
            if (config.gradientStart) setAdminDisplayGradientStart(config.gradientStart);
            if (config.gradientEnd) setAdminDisplayGradientEnd(config.gradientEnd);
            if (config.backgroundImage) setAdminDisplayBackgroundImage(config.backgroundImage);
          }
        } else if (config.target === 'admin') {
          setAdminDisplayTemplate(config.templateId);
          setAdminDisplayPrimaryColor(config.primaryColor);
          setAdminDisplayBackgroundType(config.backgroundType);
          if (config.textColor) setAdminDisplayTextColor(config.textColor);
          if (config.fontFamily) setAdminDisplayFontFamily(config.fontFamily);
          if (config.gradientStart) setAdminDisplayGradientStart(config.gradientStart);
          if (config.gradientEnd) setAdminDisplayGradientEnd(config.gradientEnd);
          if (config.backgroundImage) setAdminDisplayBackgroundImage(config.backgroundImage);
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

  const realProductsCount = products.filter((p: Product) => !p.isDummy).length;

  const canAddLink = () => {
    if (!isPremium && links.length >= 1) {
      alert('✨ Free users can only add 1 link. Upgrade to Premium for more links!');
      return false;
    }
    if (isPremium && links.length >= 10) {
      alert('✨ You have reached the limit of 10 links.');
      return false;
    }
    return true;
  };

  const canAddProduct = () => {
    if (!isPremium && realProductsCount >= 4) {
      alert('✨ Free users can only add 4 products. Upgrade to Premium for more!');
      return false;
    }
    if (isPremium && realProductsCount >= 50) {
      alert('✨ You have reached the limit of 50 products.');
      return false;
    }
    return true;
  };

  const handleAddLink = async (linkData: any) => {
    if (!canAddLink()) return;
    await addLink(linkData);
  };

  const handleAddProduct = async (product: any) => {
    if (!canAddProduct()) return;
    await addProduct(product);
  };

  const totalClicks = links.reduce((sum: number, link: Link) => sum + (link.clicks || 0), 0);
  const template = getTemplateById(adminDisplayTemplate);

  // Build background style for admin page
  const backgroundStyle: React.CSSProperties = {};

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎨 RENDERING ADMIN PAGE BACKGROUND');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('adminDisplayBackgroundType:', adminDisplayBackgroundType);
  console.log('adminDisplayBackgroundImage:', adminDisplayBackgroundImage);
  console.log('adminDisplayPrimaryColor:', adminDisplayPrimaryColor);

  if (adminDisplayBackgroundType === 'image' && adminDisplayBackgroundImage) {
    backgroundStyle.backgroundImage = `url(${adminDisplayBackgroundImage})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
    backgroundStyle.backgroundAttachment = 'fixed';
    backgroundStyle.minHeight = '100vh';
    backgroundStyle.backgroundRepeat = 'no-repeat';
    backgroundStyle.position = 'relative';
    backgroundStyle.zIndex = '0';
    console.log('✅ USING BACKGROUND IMAGE:', adminDisplayBackgroundImage);
  } else if (adminDisplayBackgroundType === 'gradient' && adminDisplayGradientStart && adminDisplayGradientEnd) {
    backgroundStyle.background = `linear-gradient(135deg, ${adminDisplayGradientStart}, ${adminDisplayGradientEnd})`;
    console.log('✅ USING GRADIENT');
  } else {
    backgroundStyle.backgroundColor = adminDisplayPrimaryColor || template.defaultBackground;
    console.log('✅ USING SOLID COLOR:', backgroundStyle.backgroundColor);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const textColorStyle = { color: adminDisplayTextColor || template.defaultTextColor };
  const fontClass = adminDisplayFontFamily || 'font-sans';

  const getPublicUrl = () => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;
    if (isPremium && userName && userName !== portalSlug) {
      return `${baseUrl}/view/${userName}`;
    }
    return `${baseUrl}/view?slug=${portalSlug}`;
  };

  // Show loading state
  if (authLoading || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  // If not authenticated, don't render (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className={`min-h-screen ${adminDisplayBackgroundType === 'image' ? '' : fontClass}`}
      style={backgroundStyle}
    >
      {/* Debug Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-2 z-50 font-mono">
        <details>
          <summary className="cursor-pointer">🔍 Background Debug</summary>
          <div className="mt-2 space-y-1">
            <div>backgroundType: {adminDisplayBackgroundType || '❌ not set'}</div>
            <div>backgroundImage: {adminDisplayBackgroundImage ? '✅ set' : '❌ not set'}</div>
            <div>backgroundImage URL: {adminDisplayBackgroundImage?.substring(0, 80) || 'none'}</div>
            <div>primaryColor: {adminDisplayPrimaryColor}</div>
            <div>fontClass: {fontClass}</div>
            <div className="mt-2 pt-1 border-t border-gray-700">
              <div className="font-bold">Style Applied:</div>
              <pre className="text-[10px] text-green-400">
                {JSON.stringify(backgroundStyle, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      </div>

      {/* Test image link */}
      {adminDisplayBackgroundImage && (
        <div className="fixed bottom-20 right-2 bg-black text-white text-[10px] p-1 rounded z-50">
          <a href={adminDisplayBackgroundImage} target="_blank" rel="noopener noreferrer" className="underline">
            Test Image URL
          </a>
        </div>
      )}

      {/* Overlay for better readability */}
      {adminDisplayBackgroundImage && (
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
          {/* Public Page & Custom URL */}
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
                      <input type="text" value={customUsername} onChange={(e) => setCustomUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="yourname" className="flex-1 min-w-[100px] px-2 py-0.5 rounded bg-white/20 text-white text-xs focus:outline-none focus:ring-1 focus:ring-white" autoFocus />
                      <button onClick={updateUsername} className="text-green-300 text-xs p-0.5 hover:bg-white/10 rounded"><Check className="w-3 h-3" /></button>
                      <button onClick={() => { setIsEditingUsername(false); setCustomUsername(userName); }} className="text-red-300 text-xs p-0.5 hover:bg-white/10 rounded"><X className="w-3 h-3" /></button>
                    </>
                  ) : (
                    <button onClick={() => { setCustomUsername(userName || portalSlug || ''); setIsEditingUsername(true); }} className="text-xs text-white/80 hover:text-white underline flex items-center gap-1">
                      {userName || portalSlug || 'set-custom-url'} <Edit2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] opacity-60 mt-1">{userName && userName !== portalSlug ? 'Your custom URL is active' : 'Set a custom URL (letters, numbers, underscores)'}</p>
              </div>
            ) : (
              <div className="mt-3 pt-2 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-80">✨ Custom URL</span>
                  <button onClick={() => setShowPaymentModal(true)} className="bg-yellow-500/30 text-yellow-200 text-xs px-2 py-0.5 rounded-full hover:bg-yellow-500/40 transition">Upgrade</button>
                </div>
                <p className="text-[10px] opacity-60 mt-1">Get a clean, memorable URL like /view/yourname</p>
              </div>
            )}
          </div>

          {isPremium && (
            <div className="mb-4 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium" style={textColorStyle}>Separate Admin Style</span>
                <button onClick={() => setUseSeparateAdminStyle(!useSeparateAdminStyle)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${useSeparateAdminStyle ? 'bg-green-500' : 'bg-gray-400'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${useSeparateAdminStyle ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </label>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold" style={textColorStyle}>{links.length}</div>
              <div className="text-xs opacity-70" style={textColorStyle}>Links {!isPremium ? `(${links.length}/1)` : `(${links.length}/10)`}</div>
              {!isPremium && links.length >= 1 && <div className="text-[10px] text-yellow-500 mt-1">✨ Upgrade for more</div>}
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold" style={textColorStyle}>{realProductsCount}</div>
              <div className="text-xs opacity-70" style={textColorStyle}>Products {!isPremium ? `(${realProductsCount}/4)` : `(${realProductsCount}/50)`}</div>
              {!isPremium && realProductsCount >= 4 && <div className="text-[10px] text-yellow-500 mt-1">✨ Upgrade for more</div>}
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold" style={textColorStyle}>{totalClicks}</div>
              <div className="text-xs opacity-70" style={textColorStyle}>Clicks</div>
            </div>
          </div>

          {/* Links Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={textColorStyle}>🔗 Links</h2>
              <button onClick={() => setShowAddModal(true)} disabled={!isPremium && links.length >= 1} className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 ${(!isPremium && links.length >= 1) ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white'}`}>
                <Plus className="w-4 h-4" /> Add link
              </button>
            </div>

            {links.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
                <p className="opacity-70" style={textColorStyle}>No links yet</p>
                <button onClick={() => setShowAddModal(true)} className="mt-3 text-black underline text-sm">Add your first link</button>
              </div>
            ) : (
              <div className="space-y-2">
                {links.map((link) => (
                  <div key={link.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-sm flex items-center gap-3">
                    {link.imageUrl && <img src={link.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate" style={textColorStyle}>{link.title}</h3>
                      <p className="text-xs opacity-60 truncate" style={textColorStyle}>{link.url}</p>
                      {link.clicks > 0 && <p className="text-xs text-green-600 mt-1">{link.clicks} clicks</p>}
                    </div>
                    <button onClick={() => deleteLink(link.id)} className="p-2 rounded-full hover:bg-red-500/20 transition"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gallery Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={textColorStyle}>🖼️ Gallery</h2>
              <button onClick={() => setShowAddProductModal(true)} disabled={!canAddProduct()} className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 ${!canAddProduct() ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white'}`}>
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
                <p className="opacity-70" style={textColorStyle}>No products in gallery</p>
                <button onClick={() => setShowAddProductModal(true)} className="mt-3 text-black underline text-sm">Add your first product</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <div key={product.id} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm">
                    <img src={product.imageUrl} alt={product.title} className="w-full h-32 object-cover" />
                    <div className="p-2">
                      <h3 className="font-medium text-sm truncate" style={textColorStyle}>{product.title}</h3>
                      {product.price && <p className="text-xs text-green-600">{product.price}</p>}
                      <button onClick={() => { if (confirm(`Delete "${product.title}"?`)) deleteProduct(product.id); }} className="text-xs text-red-500 mt-1 hover:text-red-700 transition">Delete</button>
                      {product.isDummy && <p className="text-xs text-gray-400 mt-1">Sample product</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <AddLinkModal onClose={() => setShowAddModal(false)} onSave={handleAddLink} />}
      {showAddProductModal && <AddProductModal onClose={() => setShowAddProductModal(false)} onSave={handleAddProduct} />}

      {showTemplateSelector && (
        <TemplateSelectorModal
          isPremium={isPremium}
          selectedTemplate={adminDisplayTemplate}
          primaryColor={adminDisplayPrimaryColor}
          textColor={adminDisplayTextColor}
          fontFamily={adminDisplayFontFamily}
          backgroundType={adminDisplayBackgroundType}
          gradientStart={adminDisplayGradientStart}
          gradientEnd={adminDisplayGradientEnd}
          backgroundImage={adminDisplayBackgroundImage}
          userName={userName}
          onClose={() => setShowTemplateSelector(false)}
          onSelectTemplate={updateTemplate}
          onUpgradeClick={handleUpgradeClick}
          onBack={() => setShowTemplateSelector(false)}
          showBack={true}
        />
      )}

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
            <button onClick={handleUpgradeClick} className="w-full bg-black text-white py-3 rounded-xl">Upgrade Now - ₹999</button>
            <button onClick={() => setShowPaymentModal(false)} className="w-full mt-2 py-2 text-gray-500">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}