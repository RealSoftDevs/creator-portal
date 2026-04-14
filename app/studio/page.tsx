'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Palette, Crown, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { getTemplateById } from '@/lib/templates/index';
import TemplateSelectorModal from '../components/TemplateSelectorModal';
import { useStudioData } from './hooks/useStudioData';
import PreviewCard from './components/PreviewCard';
import AddLinkModal from './components/AddLinkModal';
import AddProductModal from './components/AddProductModal';
import { useBackButton } from '@/app/hooks/useBackButton';
import { Product, Link } from '@/lib/types';

export default function StudioDashboard() {
  const [isPremium, setIsPremium] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [userName, setUserName] = useState('');

  // Public page settings
  const [publicTemplate, setPublicTemplate] = useState('template1');
  const [publicPrimaryColor, setPublicPrimaryColor] = useState('#000000');
  const [publicTextColor, setPublicTextColor] = useState('');
  const [publicFontFamily, setPublicFontFamily] = useState('font-sans');
  const [publicBackgroundType, setPublicBackgroundType] = useState('color');
  const [publicGradientStart, setPublicGradientStart] = useState('');
  const [publicGradientEnd, setPublicGradientEnd] = useState('');
  const [publicBackgroundImage, setPublicBackgroundImage] = useState('');

  // Admin display settings
  const [adminDisplayTemplate, setAdminDisplayTemplate] = useState('template2');
  const [adminDisplayPrimaryColor, setAdminDisplayPrimaryColor] = useState('#1a1a1a');
  const [adminDisplayTextColor, setAdminDisplayTextColor] = useState('');
  const [adminDisplayFontFamily, setAdminDisplayFontFamily] = useState('font-sans');
  const [adminDisplayBackgroundType, setAdminDisplayBackgroundType] = useState('color');
  const [adminDisplayGradientStart, setAdminDisplayGradientStart] = useState('');
  const [adminDisplayGradientEnd, setAdminDisplayGradientEnd] = useState('');
  const [adminDisplayBackgroundImage, setAdminDisplayBackgroundImage] = useState('');
  const [useSeparateAdminStyle, setUseSeparateAdminStyle] = useState(false);

  const router = useRouter();
  const { links, products, loading, portalSlug, addLink, addProduct, deleteLink, deleteProduct, fetchLinks, fetchProducts } = useStudioData();

  // Handle physical back button - go to dashboard
  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };
  useBackButton(handleGoToDashboard, true);

  useEffect(() => {
    checkPremiumStatus();
    loadCurrentSettings();
    fetchUserInfo();
  }, []);

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
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const loadCurrentSettings = async () => {
    try {
      const res = await fetch('/api/portal/info');
      const data = await res.json();

      setPublicTemplate(data.templateId || 'template1');
      setPublicPrimaryColor(data.primaryColor || '#000000');
      setPublicTextColor(data.textColor || '');
      setPublicFontFamily(data.fontFamily || 'font-sans');
      setPublicBackgroundType(data.backgroundType || 'color');
      setPublicGradientStart(data.gradientStart || '');
      setPublicGradientEnd(data.gradientEnd || '');
      setPublicBackgroundImage(data.backgroundImage || '');

      // Set admin display
      setAdminDisplayTemplate(data.templateId || 'template2');
      setAdminDisplayPrimaryColor(data.primaryColor || '#1a1a1a');
      setAdminDisplayTextColor(data.textColor || '');
      setAdminDisplayFontFamily(data.fontFamily || 'font-sans');
      setAdminDisplayBackgroundType(data.backgroundType || 'color');
      setAdminDisplayGradientStart(data.gradientStart || '');
      setAdminDisplayGradientEnd(data.gradientEnd || '');
      setAdminDisplayBackgroundImage(data.backgroundImage || '');

      if (data.adminTemplateId) {
        setUseSeparateAdminStyle(true);
        setAdminDisplayTemplate(data.adminTemplateId);
        setAdminDisplayPrimaryColor(data.adminPrimaryColor || data.primaryColor);
        setAdminDisplayTextColor(data.adminTextColor || data.textColor);
        setAdminDisplayFontFamily(data.adminFontFamily || data.fontFamily);
        setAdminDisplayBackgroundType(data.adminBackgroundType || data.backgroundType);
        setAdminDisplayGradientStart(data.adminGradientStart || data.gradientStart);
        setAdminDisplayGradientEnd(data.adminGradientEnd || data.gradientEnd);
        setAdminDisplayBackgroundImage(data.adminBackgroundImage || data.backgroundImage);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
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

  // Count only real products (not dummy)
  const realProductsCount = products.filter((p: Product) => !p.isDummy).length;

  // Limit checks
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
  const backgroundStyle: React.CSSProperties = {};

  if (adminDisplayBackgroundType === 'gradient' && adminDisplayGradientStart && adminDisplayGradientEnd) {
    backgroundStyle.background = `linear-gradient(135deg, ${adminDisplayGradientStart}, ${adminDisplayGradientEnd})`;
  } else if (adminDisplayBackgroundType === 'image' && adminDisplayBackgroundImage) {
    backgroundStyle.backgroundImage = `url(${adminDisplayBackgroundImage})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
  } else {
    backgroundStyle.backgroundColor = adminDisplayPrimaryColor || template.defaultBackground;
  }

  const textColorStyle = { color: adminDisplayTextColor || template.defaultTextColor };
  const fontClass = adminDisplayFontFamily || 'font-sans';

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className={`min-h-screen ${fontClass}`} style={backgroundStyle}>
      {adminDisplayBackgroundImage && <div className="fixed inset-0 bg-black/40 pointer-events-none" />}

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleGoToDashboard}
                className="p-1 rounded-full hover:bg-white/20 transition"
                title="Dashboard"
              >
                <ArrowLeft className="w-5 h-5" style={textColorStyle} />
              </button>
              <h1 className="text-xl font-bold" style={textColorStyle}>Creator Studio</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="p-2 rounded-full hover:bg-white/20 transition"
                title="Customize Theme"
              >
                <Palette className="w-5 h-5" style={textColorStyle} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-white/20 transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" style={textColorStyle} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          <PreviewCard portalSlug={portalSlug} />

          {isPremium && (
            <div className="mb-4 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium" style={textColorStyle}>Separate Admin Style</span>
                <button
                  onClick={() => setUseSeparateAdminStyle(!useSeparateAdminStyle)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    useSeparateAdminStyle ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    useSeparateAdminStyle ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </label>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold" style={textColorStyle}>{links.length}</div>
              <div className="text-xs opacity-70" style={textColorStyle}>
                Links {!isPremium ? `(${links.length}/1)` : `(${links.length}/10)`}
              </div>
              {!isPremium && links.length >= 1 && (
                <div className="text-[10px] text-yellow-500 mt-1">✨ Upgrade for more</div>
              )}
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold" style={textColorStyle}>{realProductsCount}</div>
              <div className="text-xs opacity-70" style={textColorStyle}>
                Products {!isPremium ? `(${realProductsCount}/4)` : `(${realProductsCount}/50)`}
              </div>
              {!isPremium && realProductsCount >= 4 && (
                <div className="text-[10px] text-yellow-500 mt-1">✨ Upgrade for more</div>
              )}
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
              </h2>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={!isPremium && links.length >= 1}
                className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 ${
                  (!isPremium && links.length >= 1)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-black text-white'
                }`}
                title={!isPremium && links.length >= 1 ? 'Upgrade to add more links' : ''}
              >
                <Plus className="w-4 h-4" /> Add link
              </button>
            </div>

            {links.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
                <p className="opacity-70" style={textColorStyle}>No links yet</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-3 text-black underline text-sm"
                >
                  Add your first link
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {links.map((link) => (
                  <div key={link.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-sm flex items-center gap-3">
                    {link.imageUrl && (
                      <img src={link.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate" style={textColorStyle}>{link.title}</h3>
                      <p className="text-xs opacity-60 truncate" style={textColorStyle}>{link.url}</p>
                      {link.clicks > 0 && (
                        <p className="text-xs text-green-600 mt-1">{link.clicks} clicks</p>
                      )}
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
              </h2>
              <button
                onClick={() => setShowAddProductModal(true)}
                disabled={!canAddProduct()}
                className={`px-4 py-2 rounded-full text-sm flex items-center gap-1 ${
                  !canAddProduct()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-black text-white'
                }`}
                title={!canAddProduct() ? 'Upgrade to add more products' : ''}
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
                <p className="opacity-70" style={textColorStyle}>No products in gallery</p>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="mt-3 text-black underline text-sm"
                >
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
                        onClick={() => {
                          if (confirm(`Delete "${product.title}"?`)) {
                            deleteProduct(product.id);
                          }
                        }}
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
            <p className="text-gray-600 mb-4">Get access to premium templates, unlimited links, and more!</p>
            <ul className="text-left text-sm space-y-2 mb-4">
              <li>✓ 10+ Premium Templates</li>
              <li>✓ Up to 10 Links</li>
              <li>✓ Up to 50 Products</li>
              <li>✓ Custom Colors & Gradients</li>
              <li>✓ Separate Admin Styling</li>
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