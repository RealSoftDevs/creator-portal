// app/studio/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, User, LogOut, Layout, Palette, Link2, Package, Sparkles, Eye, Save, RefreshCw, X, Upload, Crown, Check, Type, Image as ImageIcon } from 'lucide-react';
import { useStudioData } from './hooks/useStudioData';
import LinksSection from './components/LinksSection';
import GallerySection from './components/GallerySection';
import AddLinkModal from './components/AddLinkModal';
import AddProductModal from './components/AddProductModal';
import EditProductModal from './components/EditProductModal';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import StatsCard from './components/StatsCard';
import PreviewCard from './components/PreviewCard';
import LoadingSkeleton from './components/LoadingSkeleton';
import DisplaySettingsModal from './components/DisplaySettingsModal';
import MobileSidebar from './components/MobileSidebar';
import { DisplaySettings, defaultSettings } from '@/lib/settings';
import { templates } from '@/lib/templates/index';

interface PortalData {
  id: string;
  slug: string;
  title: string;
  bio: string;
  displayName?: string;
  avatarUrl?: string;
  userName: string;
  templateId: string;
  primaryColor: string;
  backgroundImage?: string;
  backgroundType?: string;
  gradientStart?: string;
  gradientEnd?: string;
  textColor?: string;
  fontFamily?: string;
  isPremium?: boolean;
  customUsername?: string | null;
  adminTemplateId?: string;
  adminPrimaryColor?: string;
  adminBackgroundType?: string;
  adminGradientStart?: string;
  adminGradientEnd?: string;
  adminBackgroundImage?: string;
  adminTextColor?: string;
  adminFontFamily?: string;
}

export default function StudioPage() {
  const router = useRouter();
  const { links, products, loading, portalSlug, addLink, addProduct, deleteLink, updateProduct, deleteProduct } = useStudioData();
  const [portal, setPortal] = useState<PortalData | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'links' | 'products' | 'appearance'>('links');
  const [showAddLink, setShowAddLink] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Appearance states
  const [templateId, setTemplateId] = useState('template1');
  const [primaryColor, setPrimaryColor] = useState('#f5f5f5');
  const [textColor, setTextColor] = useState('#1a1a1a');
  const [fontFamily, setFontFamily] = useState('font-sans');
  const [backgroundType, setBackgroundType] = useState<'color' | 'gradient' | 'image'>('image');
  const [gradientStart, setGradientStart] = useState('#fb923c');
  const [gradientEnd, setGradientEnd] = useState('#fde047');
  const [backgroundImage, setBackgroundImage] = useState('/images/default-bg.jpg');
  const [savingAppearance, setSavingAppearance] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [applyTarget, setApplyTarget] = useState<'public' | 'admin'>('public');

  // Display settings
  const [adminDisplaySettings, setAdminDisplaySettings] = useState<DisplaySettings>(defaultSettings);

  // Random image URLs
  const randomImages = [
    'https://picsum.photos/id/104/1920/1080',
    'https://picsum.photos/id/15/1920/1080',
    'https://picsum.photos/id/30/1920/1080',
    'https://picsum.photos/id/96/1920/1080',
    'https://picsum.photos/id/42/1920/1080',
    'https://picsum.photos/id/20/1920/1080',
    'https://picsum.photos/id/0/1920/1080',
    'https://picsum.photos/id/18/1920/1080',
    'https://picsum.photos/id/29/1920/1080',
    'https://picsum.photos/id/39/1920/1080',
  ];

  const quickColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c'
  ];

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load display settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin_display_settings');
    if (saved) {
      try { setAdminDisplaySettings(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveAdminDisplaySettings = (settings: DisplaySettings) => {
    setAdminDisplaySettings(settings);
    localStorage.setItem('admin_display_settings', JSON.stringify(settings));
    setShowDisplaySettings(false);
  };

  // Fetch portal info on mount
  useEffect(() => {
    fetchPortalInfo();
  }, []);

  // Update settings when applyTarget changes
  useEffect(() => {
    if (portal) {
      loadSettingsForTarget(applyTarget);
    }
  }, [applyTarget, portal]);

  const loadSettingsForTarget = (target: 'public' | 'admin') => {
    if (!portal) return;

    if (target === 'admin') {
      setTemplateId(portal.adminTemplateId || portal.templateId || 'template1');
      setPrimaryColor(portal.adminPrimaryColor || portal.primaryColor || '#f5f5f5');
      setTextColor(portal.adminTextColor || portal.textColor || '#1a1a1a');
      setFontFamily(portal.adminFontFamily || portal.fontFamily || 'font-sans');
      setBackgroundType((portal.adminBackgroundType || portal.backgroundType || 'image') as any);
      setGradientStart(portal.adminGradientStart || portal.gradientStart || '#fb923c');
      setGradientEnd(portal.adminGradientEnd || portal.gradientEnd || '#fde047');
      setBackgroundImage(portal.adminBackgroundImage || portal.backgroundImage || '/images/default-bg.jpg');
    } else {
      setTemplateId(portal.templateId || 'template1');
      setPrimaryColor(portal.primaryColor || '#f5f5f5');
      setTextColor(portal.textColor || '#1a1a1a');
      setFontFamily(portal.fontFamily || 'font-sans');
      setBackgroundType((portal.backgroundType || 'image') as any);
      setGradientStart(portal.gradientStart || '#fb923c');
      setGradientEnd(portal.gradientEnd || '#fde047');
      setBackgroundImage(portal.backgroundImage || '/images/default-bg.jpg');
    }
  };

  const fetchPortalInfo = async () => {
    try {
      const res = await fetch('/api/portal/info');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setPortal(data);
      loadSettingsForTarget(applyTarget);
    } catch (error) {
      console.error('Failed to fetch portal info:', error);
    }
  };

  const handleUpdateProfile = async (updates: any) => {
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await fetchPortalInfo();
        alert('Profile updated successfully!');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update profile');
    }
  };

  const handleSaveAppearance = async () => {
    setSavingAppearance(true);
    try {
      const res = await fetch('/api/portal/appearance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: applyTarget,
          templateId,
          primaryColor,
          textColor,
          fontFamily,
          backgroundType,
          gradientStart,
          gradientEnd,
          backgroundImage,
        })
      });

      if (res.ok) {
        await fetchPortalInfo();
        alert(`Theme applied to ${applyTarget} page successfully!`);
      } else if (res.status === 403) {
        alert('Premium feature. Please upgrade to apply theme to admin panel.');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save appearance');
    } finally {
      setSavingAppearance(false);
    }
  };

  const handleBackgroundImageUpload = async (file: File) => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        let imageUrl = data.url;
        if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
        setBackgroundImage(imageUrl);
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  const textColorStyle = { color: textColor };
  if (loading) return <LoadingSkeleton />;

  const realProducts = products.filter((p: any) => !p.isDummy);
  const hasProducts = realProducts.length > 0;
  const canAddMoreLinks = portal?.isPremium ? links.length < 10 : links.length < 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobile && (
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          onOpen={() => setIsMobileSidebarOpen(true)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          linksCount={links.length}
          productsCount={realProducts.length}
          isPremium={portal?.isPremium || false}
          onProfileSettings={() => setShowProfileSettings(true)}
          onLogout={handleLogout}
        />
      )}

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white border-r fixed h-full overflow-y-auto">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">CreatorPortal</h1>
              <p className="text-xs text-gray-500 mt-1">Studio Dashboard</p>
            </div>
            {portal?.isPremium && (
              <div className="mb-6 p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center gap-2">
                <Crown className="w-5 h-5 text-white" />
                <div><p className="text-white font-semibold text-sm">Premium User</p><p className="text-white/80 text-xs">Unlimited links & products</p></div>
              </div>
            )}
            <nav className="space-y-2">
              <button onClick={() => setActiveTab('links')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === 'links' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Link2 className="w-5 h-5" /><span>Links</span>{links.length > 0 && <span className={`ml-auto text-xs ${activeTab === 'links' ? 'text-white/80' : 'text-gray-400'}`}>{links.length}</span>}
              </button>
              <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === 'products' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Package className="w-5 h-5" /><span>Products</span>{realProducts.length > 0 && <span className={`ml-auto text-xs ${activeTab === 'products' ? 'text-white/80' : 'text-gray-400'}`}>{realProducts.length}</span>}
              </button>
              <button onClick={() => setActiveTab('appearance')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === 'appearance' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Palette className="w-5 h-5" /><span>Appearance</span>
              </button>
            </nav>
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <button onClick={() => setShowProfileSettings(true)} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"><User className="w-5 h-5" /><span>Profile Settings</span></button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"><LogOut className="w-5 h-5" /><span>Logout</span></button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{activeTab === 'links' && 'Manage Links'}{activeTab === 'products' && 'Product Gallery'}{activeTab === 'appearance' && 'Customize Appearance'}</h1>
                <p className="text-sm text-gray-500 mt-1">{activeTab === 'links' && 'Add and manage your social media links'}{activeTab === 'products' && 'Showcase your products and affiliate items'}{activeTab === 'appearance' && 'Customize how your page looks'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => window.open(`/view/${portal?.customUsername || portalSlug}`, '_blank')} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition flex items-center gap-2"><Eye className="w-4 h-4" /><span className="hidden sm:inline">Preview</span></button>
                {portal?.isPremium && <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"><span className="text-xs font-semibold text-white">Premium</span></div>}
              </div>
            </div>

            <StatsCard linksCount={links.length} productsCount={realProducts.length} totalClicks={links.reduce((sum, link) => sum + (link.clicks || 0), 0)} textColorStyle={textColorStyle} isPremium={portal?.isPremium || false} />
            {portal && <PreviewCard portalSlug={portalSlug} customUsername={portal.customUsername || undefined} isPremium={portal.isPremium} />}

            {activeTab === 'links' && (
              <LinksSection links={links} onAdd={() => setShowAddLink(true)} onDelete={deleteLink} textColorStyle={textColorStyle} isAddDisabled={!canAddMoreLinks} limit={portal?.isPremium ? 10 : 1} />
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <GallerySection products={products} onAdd={() => setShowAddProduct(true)} onEdit={(product) => setEditingProduct(product)} onDelete={deleteProduct} onOpenSettings={() => setShowDisplaySettings(true)} settings={adminDisplaySettings} textColorStyle={textColorStyle} />
                {hasProducts && (<div className="bg-blue-50 rounded-xl p-4"><h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" />Pro Tip</h3><p className="text-sm text-blue-800">Click on any product to edit its details. Use the settings button to customize how products are displayed.</p></div>)}
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Theme Customizer
                  </h3>

                  <div className="space-y-6">
                    {/* Apply Target Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apply Theme To</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setApplyTarget('public')}
                          className={`flex-1 py-2 rounded-lg border transition ${
                            applyTarget === 'public'
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          🌐 Public Page
                        </button>
                        <button
                          onClick={() => setApplyTarget('admin')}
                          disabled={!portal?.isPremium}
                          className={`flex-1 py-2 rounded-lg border transition ${
                            applyTarget === 'admin' && portal?.isPremium
                              ? 'bg-purple-600 text-white border-purple-600'
                              : portal?.isPremium
                                ? 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          🛠️ Admin Panel {!portal?.isPremium && '🔒'}
                        </button>
                      </div>
                      {!portal?.isPremium && applyTarget === 'admin' && (
                        <p className="text-xs text-yellow-600 mt-1">✨ Upgrade to Premium to customize admin panel</p>
                      )}
                    </div>
                    {/* Template Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Layout className="w-4 h-4" />
                        Template Style
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {templates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => {
                              setTemplateId(template.id);
                              setGradientStart(template.gradientColors.start);
                              setGradientEnd(template.gradientColors.end);
                              setTextColor(template.defaultTextColor);
                              setBackgroundType('gradient');
                            }}
                            className={`relative rounded-lg overflow-hidden border-2 transition ${
                              templateId === template.id ? 'border-black ring-2 ring-black/20' : 'border-gray-200 hover:border-gray-400'
                            } ${template.isPremium && !portal?.isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={template.isPremium && !portal?.isPremium}
                          >
                            <div className={`h-16 bg-gradient-to-r ${template.gradient}`} />
                            <div className="p-2 text-left">
                              <p className="text-xs font-medium truncate">{template.name}</p>
                              <p className="text-[10px] text-gray-400">{template.category}</p>
                            </div>
                            {template.isPremium && (
                              <div className="absolute top-1 right-1">
                                <Crown className="w-3 h-3 text-yellow-500" />
                              </div>
                            )}
                            {templateId === template.id && (
                              <div className="absolute top-1 left-1 bg-black text-white rounded-full p-0.5">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Colors
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border" />
                            <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border" />
                            <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quick Colors</label>
                        <div className="flex gap-2 flex-wrap">
                          {quickColors.map(color => (
                            <button key={color} onClick={() => setPrimaryColor(color)} className="w-6 h-6 rounded-full shadow-sm hover:scale-110 transition" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {backgroundType === 'image' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={backgroundImage}
                            onChange={(e) => setBackgroundImage(e.target.value)}
                            placeholder="/images/bg.jpg or https://example.com/image.jpg"
                            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const categories = [
                                { name: 'Nature', ids: [15, 104, 29, 42, 96, 116] },
                                { name: 'City', ids: [20, 23, 91, 101, 105, 106, 107] },
                                { name: 'Technology', ids: [0, 25, 37, 48, 57, 59, 69, 77] },
                                { name: 'People', ids: [2, 4, 6, 8, 10, 12, 14] },
                                { name: 'Animals', ids: [1, 3, 5, 7, 9, 11, 13] },
                                { name: 'Abstract', ids: [16, 17, 18, 19, 20, 21, 22] },
                              ];
                              const allIds = categories.flatMap(c => c.ids);
                              const randomId = allIds[Math.floor(Math.random() * allIds.length)];
                              setBackgroundImage(`https://picsum.photos/id/${randomId}/1920/1080`);
                            }}
                            className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition"
                          >
                            🎲 Random
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleBackgroundImageUpload(file);
                              };
                              input.click();
                            }}
                            className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition"
                          >
                            📁 Upload
                          </button>
                        </div>

                        {/* Category-based image selection */}
                        <div className="mt-3">
                          <label className="block text-xs text-gray-500 mb-2">Or choose by category:</label>
                          <div className="grid grid-cols-3 gap-2">
                            {/* Nature Category */}
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-600">🌿 Nature</p>
                              <div className="flex flex-wrap gap-1">
                                {[15, 104, 29, 42, 96, 116].map(id => (
                                  <button
                                    key={id}
                                    onClick={() => setBackgroundImage(`https://picsum.photos/id/${id}/1920/1080`)}
                                    className="w-8 h-8 rounded-lg overflow-hidden border hover:ring-2 hover:ring-blue-400 transition"
                                    title={`Nature ${id}`}
                                  >
                                    <img src={`https://picsum.photos/id/${id}/40/40`} alt="preview" className="w-full h-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* City Category */}
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-600">🌆 City</p>
                              <div className="flex flex-wrap gap-1">
                                {[20, 23, 91, 101, 105, 106, 107].map(id => (
                                  <button
                                    key={id}
                                    onClick={() => setBackgroundImage(`https://picsum.photos/id/${id}/1920/1080`)}
                                    className="w-8 h-8 rounded-lg overflow-hidden border hover:ring-2 hover:ring-blue-400 transition"
                                  >
                                    <img src={`https://picsum.photos/id/${id}/40/40`} alt="preview" className="w-full h-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Technology Category */}
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-600">💻 Technology</p>
                              <div className="flex flex-wrap gap-1">
                                {[0, 25, 37, 48, 57, 59, 69, 77].map(id => (
                                  <button
                                    key={id}
                                    onClick={() => setBackgroundImage(`https://picsum.photos/id/${id}/1920/1080`)}
                                    className="w-8 h-8 rounded-lg overflow-hidden border hover:ring-2 hover:ring-blue-400 transition"
                                  >
                                    <img src={`https://picsum.photos/id/${id}/40/40`} alt="preview" className="w-full h-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* People Category */}
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-600">👥 People</p>
                              <div className="flex flex-wrap gap-1">
                                {[2, 4, 6, 8, 10, 12, 14].map(id => (
                                  <button
                                    key={id}
                                    onClick={() => setBackgroundImage(`https://picsum.photos/id/${id}/1920/1080`)}
                                    className="w-8 h-8 rounded-lg overflow-hidden border hover:ring-2 hover:ring-blue-400 transition"
                                  >
                                    <img src={`https://picsum.photos/id/${id}/40/40`} alt="preview" className="w-full h-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Animals Category */}
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-600">🐾 Animals</p>
                              <div className="flex flex-wrap gap-1">
                                {[1, 3, 5, 7, 9, 11, 13].map(id => (
                                  <button
                                    key={id}
                                    onClick={() => setBackgroundImage(`https://picsum.photos/id/${id}/1920/1080`)}
                                    className="w-8 h-8 rounded-lg overflow-hidden border hover:ring-2 hover:ring-blue-400 transition"
                                  >
                                    <img src={`https://picsum.photos/id/${id}/40/40`} alt="preview" className="w-full h-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Abstract Category */}
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-600">🎨 Abstract</p>
                              <div className="flex flex-wrap gap-1">
                                {[16, 17, 18, 19, 20, 21, 22].map(id => (
                                  <button
                                    key={id}
                                    onClick={() => setBackgroundImage(`https://picsum.photos/id/${id}/1920/1080`)}
                                    className="w-8 h-8 rounded-lg overflow-hidden border hover:ring-2 hover:ring-blue-400 transition"
                                  >
                                    <img src={`https://picsum.photos/id/${id}/40/40`} alt="preview" className="w-full h-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Current Image Preview */}
                        {(backgroundImage && (backgroundImage.startsWith('http') || backgroundImage.startsWith('/')) && backgroundImage !== '/images/default-bg.jpg') && (
                          <div className="mt-3">
                            <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                              <img src={backgroundImage} alt="Background preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/images/default-bg.jpg'; }} />
                              <button onClick={() => setBackgroundImage('')} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 text-xs">
                                ✕
                              </button>
                            </div>
                          </div>
                        )}
                        {uploadingImage && <div className="mt-2 text-sm text-gray-500">Uploading...</div>}
                      </div>
                    )}

                    {/* Font */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Font Family
                      </h4>
                      <div className="flex gap-2">
                        {['font-sans', 'font-serif', 'font-mono'].map((font) => (
                          <button key={font} onClick={() => setFontFamily(font)} className={`flex-1 py-2 rounded-lg border transition ${fontFamily === font ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                            <div className={font}>{font === 'font-sans' && 'Sans Serif'}{font === 'font-serif' && 'Serif'}{font === 'font-mono' && 'Monospace'}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Preview */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Live Preview</h4>
                      <div className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 p-6 text-center" style={{
                        ...(backgroundType === 'color' && { backgroundColor: primaryColor }),
                        ...(backgroundType === 'gradient' && { background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` }),
                        ...(backgroundType === 'image' && backgroundImage && { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }),
                        color: textColor
                      }}>
                        <div className={`w-16 h-16 mx-auto rounded-full mb-3 flex items-center justify-center text-2xl font-bold shadow-lg`} style={{ background: `linear-gradient(135deg, ${textColor}20, ${textColor}10)`, border: `2px solid ${textColor}40` }}>
                          {portal?.displayName?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <p className={`font-bold text-lg ${fontFamily}`}>{portal?.displayName || portal?.title || 'Your Name'}</p>
                        <p className={`text-sm opacity-80 mt-1 ${fontFamily}`}>Creator & Designer</p>
                        <div className="flex justify-center gap-4 mt-3 text-xs opacity-60"><span>📸 1.2K</span><span>▶️ 5.6K</span><span>💬 342</span></div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <button onClick={handleSaveAppearance} disabled={savingAppearance} className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2">
                      {savingAppearance ? (<><RefreshCw className="w-4 h-4 animate-spin" />Saving...</>) : (<><Save className="w-4 h-4" />Save Theme</>)}
                    </button>
                    {applyTarget === 'admin' && (
                                          <div className="bg-yellow-100 p-2 rounded text-xs mb-2">
                                            <p>Debug: Applying to Admin</p>
                                            <p>Background Type: {backgroundType}</p>
                                            <p>Gradient: {gradientStart} → {gradientEnd}</p>
                                            <p>Image: {backgroundImage}</p>
                                          </div>
                                        )}

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddLink && <AddLinkModal onClose={() => setShowAddLink(false)} onSave={async (link) => { const success = await addLink(link); if (success) setShowAddLink(false); return success; }} />}
      {showAddProduct && <AddProductModal onClose={() => setShowAddProduct(false)} onSave={async (product) => { const success = await addProduct(product); if (success) setShowAddProduct(false); return success; }} />}
      {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={updateProduct} onDelete={async (id) => { const success = await deleteProduct(id); if (success) setEditingProduct(null); return success; }} />}
      {showProfileSettings && portal && <ProfileSettingsModal portal={portal} onClose={() => setShowProfileSettings(false)} onSave={handleUpdateProfile} />}
      {showDisplaySettings && <DisplaySettingsModal settings={adminDisplaySettings} onSave={saveAdminDisplaySettings} onClose={() => setShowDisplaySettings(false)} title="Admin Display Settings" />}
    </div>
  );
}