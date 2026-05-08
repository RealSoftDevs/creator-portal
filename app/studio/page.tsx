// app/studio/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, User, LogOut, Layout, Palette, Link2, Package, Sparkles, Eye, Save, RefreshCw, X, Upload, Crown } from 'lucide-react';
import { useStudioData } from './hooks/useStudioData';
import LinksSection from './components/LinksSection';
import GallerySection from './components/GallerySection';
import AddLinkModal from './components/AddLinkModal';
import AddProductModal from './components/AddProductModal';
import EditProductModal from './components/EditProductModal';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import TemplateSelector from './components/TemplateSelector';
import StatsCard from './components/StatsCard';
import PreviewCard from './components/PreviewCard';
import LoadingSkeleton from './components/LoadingSkeleton';
import DisplaySettingsModal from './components/DisplaySettingsModal';
import MobileSidebar from './components/MobileSidebar';
import { DisplaySettings, defaultSettings } from '@/lib/settings';

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
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [templateId, setTemplateId] = useState('template1');
  const [primaryColor, setPrimaryColor] = useState('#f5f5f5');
  const [textColor, setTextColor] = useState('#1a1a1a');
  const [fontFamily, setFontFamily] = useState('font-sans');
  const [backgroundType, setBackgroundType] = useState<'color' | 'gradient' | 'image'>('color');
  const [gradientStart, setGradientStart] = useState('#fb923c');
  const [gradientEnd, setGradientEnd] = useState('#fde047');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [savingAppearance, setSavingAppearance] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [adminDisplaySettings, setAdminDisplaySettings] = useState<DisplaySettings>(defaultSettings);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  useEffect(() => { fetchPortalInfo(); }, []);

  const fetchPortalInfo = async () => {
    try {
      const res = await fetch('/api/portal/info');
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      setPortal(data);
      if (data) {
        setTemplateId(data.templateId || 'template1');
        setPrimaryColor(data.primaryColor || '#f5f5f5');
        setTextColor(data.textColor || '#1a1a1a');
        setFontFamily(data.fontFamily || 'font-sans');
        setBackgroundType(data.backgroundType || 'color');
        setGradientStart(data.gradientStart || '#fb923c');
        setGradientEnd(data.gradientEnd || '#fde047');
        setBackgroundImage(data.backgroundImage || '');
      }
    } catch (error) { console.error('Failed to fetch portal info:', error); }
  };

  const handleUpdateProfile = async (updates: any) => {
    try {
      const res = await fetch('/api/portal/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
      if (res.ok) { await fetchPortalInfo(); alert('Profile updated successfully!'); }
      else throw new Error('Failed to update');
    } catch (error) { console.error('Update error:', error); alert('Failed to update profile'); }
  };

  const handleSaveAppearance = async () => {
    setSavingAppearance(true);
    try {
      const res = await fetch('/api/portal/appearance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, primaryColor, textColor, fontFamily, backgroundType, gradientStart, gradientEnd, backgroundImage })
      });
      if (res.ok) { await fetchPortalInfo(); alert('Appearance saved successfully!'); }
      else throw new Error('Failed to save');
    } catch (error) { console.error('Save error:', error); alert('Failed to save appearance'); }
    finally { setSavingAppearance(false); }
  };

  const handleBackgroundImageUpload = async (file: File) => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) { let imageUrl = data.url; if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl; setBackgroundImage(imageUrl); }
      else alert('Upload failed');
    } catch (error) { console.error('Upload error:', error); alert('Upload failed'); }
    finally { setUploadingImage(false); }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.clear(); sessionStorage.clear();
      document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));
      router.push('/login');
    } catch (error) { console.error('Logout error:', error); window.location.href = '/login'; }
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

        <div className="flex-1 lg:ml-64">
          <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{activeTab === 'links' && 'Manage Links'}{activeTab === 'products' && 'Product Gallery'}{activeTab === 'appearance' && 'Customize Appearance'}</h1>
                <p className="text-sm text-gray-500 mt-1">{activeTab === 'links' && 'Add and manage your social media links'}{activeTab === 'products' && 'Showcase your products and affiliate items'}{activeTab === 'appearance' && 'Customize how your public page looks'}</p>
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
                <div className="bg-white rounded-xl border p-6"><h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Layout className="w-5 h-5" />Template</h3><button onClick={() => setShowTemplateSelector(true)} className="w-full p-4 border-2 border-dashed rounded-xl hover:border-gray-400 transition text-center"><div className="text-4xl mb-2">🎨</div><p className="text-sm text-gray-600">Click to change template</p><p className="text-xs text-gray-400 mt-1">Current: {templateId}</p></button></div>
                <div className="bg-white rounded-xl border p-6"><h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Palette className="w-5 h-5" />Colors</h3><div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label><div className="flex items-center gap-3"><input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border" /><input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" /></div></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label><div className="flex items-center gap-3"><input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border" /><input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" /></div></div></div></div>
                <div className="bg-white rounded-xl border p-6"><h3 className="font-semibold text-gray-900 mb-4">Background</h3><div className="space-y-4"><div className="flex gap-3">{(['color', 'gradient', 'image'] as const).map((type) => (<button key={type} onClick={() => setBackgroundType(type)} className={`flex-1 py-2 rounded-lg border transition ${backgroundType === type ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>{type === 'color' && 'Solid Color'}{type === 'gradient' && 'Gradient'}{type === 'image' && 'Image'}</button>))}</div>{backgroundType === 'gradient' && (<div className="grid grid-cols-2 gap-3"><div><label className="block text-xs text-gray-500 mb-1">Start Color</label><input type="color" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" /></div><div><label className="block text-xs text-gray-500 mb-1">End Color</label><input type="color" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" /></div></div>)}{backgroundType === 'image' && (<div><label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>{backgroundImage ? (<div className="relative"><img src={backgroundImage} alt="Background" className="w-full h-32 object-cover rounded-lg" /><button onClick={() => setBackgroundImage('')} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"><X className="w-4 h-4" /></button></div>) : (<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400"><input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleBackgroundImageUpload(file); }} className="hidden" /><Upload className="w-8 h-8 text-gray-400 mb-2" /><p className="text-sm text-gray-500">Click to upload background image</p></label>)}{uploadingImage && (<div className="mt-2 flex items-center gap-2 text-sm text-gray-500"><RefreshCw className="w-4 h-4 animate-spin" />Uploading...</div>)}</div>)}</div></div>
                <div className="bg-white rounded-xl border p-6"><h3 className="font-semibold text-gray-900 mb-4">Font Family</h3><select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"><option value="font-sans">Sans Serif (Default)</option><option value="font-serif">Serif</option><option value="font-mono">Monospace</option></select></div>
                <button onClick={handleSaveAppearance} disabled={savingAppearance} className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2">{savingAppearance ? (<><RefreshCw className="w-4 h-4 animate-spin" />Saving...</>) : (<><Save className="w-4 h-4" />Save Appearance</>)}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddLink && <AddLinkModal onClose={() => setShowAddLink(false)} onSave={async (link) => { const success = await addLink(link); if (success) setShowAddLink(false); return success; }} />}
      {showAddProduct && <AddProductModal onClose={() => setShowAddProduct(false)} onSave={async (product) => { const success = await addProduct(product); if (success) setShowAddProduct(false); return success; }} />}
      {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={updateProduct} onDelete={async (id) => { const success = await deleteProduct(id); if (success) setEditingProduct(null); return success; }} />}
      {showProfileSettings && portal && <ProfileSettingsModal portal={portal} onClose={() => setShowProfileSettings(false)} onSave={handleUpdateProfile} />}
      {showTemplateSelector && (
        <TemplateSelector
          currentTemplateId={templateId}
          currentSettings={{
            primaryColor,
            textColor,
            fontFamily,
            backgroundType,
            gradientStart,
            gradientEnd,
            backgroundImage,
          }}
          isPremium={portal?.isPremium || false}
          onSelect={async (config) => {
            try {
              const res = await fetch('/api/portal/appearance', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
              });

              if (res.ok) {
                await fetchPortalInfo();
                alert(`Theme applied to ${config.target} page successfully!`);
              } else {
                throw new Error('Failed to apply theme');
              }
            } catch (error) {
              console.error('Apply theme error:', error);
              alert('Failed to apply theme');
            }
          }}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
      {showDisplaySettings && <DisplaySettingsModal settings={adminDisplaySettings} onSave={saveAdminDisplaySettings} onClose={() => setShowDisplaySettings(false)} title="Admin Display Settings" />}
    </div>
  );
}