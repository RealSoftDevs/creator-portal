// app/page.tsx - Fixed authentication flow
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Crown } from 'lucide-react';
import Sidebar from '@/app/components/dashboard/Sidebar';
import MobileBottomNav from '@/app/components/dashboard/MobileBottomNav';
import MobileSidebar from '@/app/components/dashboard/MobileSidebar';
import StatsCards from '@/app/components/dashboard/StatsCards';
import PublicPageCard from '@/app/components/dashboard/PublicPageCard';
import LinksTab from '@/app/components/dashboard/LinksTab';
import ProductsTab from '@/app/components/dashboard/ProductsTab';
import AppearanceTab from '@/app/components/dashboard/AppearanceTab';
import AddLinkModal from '@/app/components/shared/AddLinkModal';
import AddProductModal from '@/app/components/shared/AddProductModal';
import EditProductModal from '@/app/components/shared/EditProductModal';
import DisplaySettingsModal from '@/app/components/shared/DisplaySettingsModal';
import { DisplaySettings, defaultSettings } from '@/lib/settings';

interface LinkType {
  id: string;
  title: string;
  url: string;
  clicks?: number;
}

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

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [portalSlug, setPortalSlug] = useState('');
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'links' | 'products' | 'appearance'>('links');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Data states
  const [links, setLinks] = useState<LinkType[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ linksCount: 0, productsCount: 0, totalClicks: 0 });

  // Appearance states
  const [applyTarget, setApplyTarget] = useState<'public' | 'admin'>('public');
  const [templateId, setTemplateId] = useState('template1');
  const [primaryColor, setPrimaryColor] = useState('#f5f5f5');
  const [textColor, setTextColor] = useState('#1a1a1a');
  const [fontFamily, setFontFamily] = useState('font-sans');
  const [backgroundType, setBackgroundType] = useState<'color' | 'gradient' | 'image'>('image');
  const [gradientStart, setGradientStart] = useState('#fb923c');
  const [gradientEnd, setGradientEnd] = useState('#fde047');
  const [backgroundImage, setBackgroundImage] = useState('/images/default-bg.jpg');
  const [savingAppearance, setSavingAppearance] = useState(false);

  // Display settings
  const [adminDisplaySettings, setAdminDisplaySettings] = useState<DisplaySettings>(defaultSettings);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch data
  const fetchPortalInfo = async () => {
    try {
      const res = await fetch('/api/portal/info');
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      setPortalData(data);
      setPortalSlug(data.slug);
      loadSettingsForTarget(applyTarget);
    } catch (error) { console.error(error); }
  };

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/portal/links');
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      const linksData: LinkType[] = data.links || [];
      setLinks(linksData);
      setStats(prev => ({
        ...prev,
        linksCount: linksData.length,
        totalClicks: linksData.reduce((sum: number, l: LinkType) => sum + (l.clicks || 0), 0)
      }));
    } catch (error) { console.error(error); }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/portal/products');
      const data = await res.json();
      const productsData = (data.products || []).map((p: any) => ({ ...p, price: p.price || null, category: p.category || 'misc' }));
      setProducts(productsData);
      setStats(prev => ({ ...prev, productsCount: productsData.length }));
    } catch (error) { console.error(error); }
  };

  const loadSettingsForTarget = (target: 'public' | 'admin') => {
    if (!portalData) return;
    if (target === 'admin' && portalData.isPremium) {
      setTemplateId(portalData.adminTemplateId || portalData.templateId || 'template1');
      setPrimaryColor(portalData.adminPrimaryColor || portalData.primaryColor || '#f5f5f5');
      setTextColor(portalData.adminTextColor || portalData.textColor || '#1a1a1a');
      setFontFamily(portalData.adminFontFamily || portalData.fontFamily || 'font-sans');
      setBackgroundType((portalData.adminBackgroundType || portalData.backgroundType || 'image') as any);
      setGradientStart(portalData.adminGradientStart || portalData.gradientStart || '#fb923c');
      setGradientEnd(portalData.adminGradientEnd || portalData.gradientEnd || '#fde047');
      setBackgroundImage(portalData.adminBackgroundImage || portalData.backgroundImage || '/images/default-bg.jpg');
    } else {
      setTemplateId(portalData.templateId || 'template1');
      setPrimaryColor(portalData.primaryColor || '#f5f5f5');
      setTextColor(portalData.textColor || '#1a1a1a');
      setFontFamily(portalData.fontFamily || 'font-sans');
      setBackgroundType((portalData.backgroundType || 'image') as any);
      setGradientStart(portalData.gradientStart || '#fb923c');
      setGradientEnd(portalData.gradientEnd || '#fde047');
      setBackgroundImage(portalData.backgroundImage || '/images/default-bg.jpg');
    }
  };

  const addLink = async (linkData: any) => {
    const res = await fetch('/api/portal/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: linkData.title, url: linkData.url, order: links.length })
    });
    if (res.ok) { await fetchLinks(); return true; }
    return false;
  };

  const updateLink = async (id: string, data: { title: string; url: string }) => {
    try {
      const res = await fetch('/api/portal/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      });
      if (res.ok) {
        await fetchLinks();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update link error:', error);
      return false;
    }
  };

  const deleteLink = async (id: string) => {
    if (!confirm('Delete this link?')) return false;
    await fetch(`/api/portal/links?id=${id}`, { method: 'DELETE' });
    await fetchLinks();
    return true;
  };

  const addProduct = async (product: any) => {
    const res = await fetch('/api/portal/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, price: product.price || null, category: product.category || 'misc' })
    });
    if (res.ok) { await fetchProducts(); return true; }
    return false;
  };

const updateProduct = async (id: string, updates: any) => {
  console.log('Updating product with data:', updates); // Debug log

  const res = await fetch(`/api/portal/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: updates.title,
      description: updates.description || '',
      imageUrl: updates.imageUrl,
      buyLink: updates.buyLink,
      price: updates.price || null,
      platform: updates.platform || 'custom',
      category: updates.category || 'misc'
    })
  });

  if (res.ok) {
    await fetchProducts();
    return true;
  } else {
    const error = await res.json();
    console.error('Update failed:', error);
    return false;
  }
};

  const deleteProduct = async (id: string) => {
    const res = await fetch(`/api/portal/products/${id}`, { method: 'DELETE' });
    if (res.ok) { await fetchProducts(); return true; }
    return false;
  };

  const handleSaveAppearance = async () => {
    setSavingAppearance(true);
    const res = await fetch('/api/portal/appearance', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: applyTarget, templateId, primaryColor, textColor, fontFamily, backgroundType, gradientStart, gradientEnd, backgroundImage })
    });
    if (res.ok) { await fetchPortalInfo(); alert(`Theme applied to ${applyTarget} page!`); }
    setSavingAppearance(false);
  };

  const saveAdminDisplaySettings = (settings: DisplaySettings) => {
    setAdminDisplaySettings(settings);
    localStorage.setItem('admin_display_settings', JSON.stringify(settings));
    setShowDisplaySettings(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleUpdateUsername = async (newUsername: string) => {
    await fetchPortalInfo();
  };

  const getPublicUrl = () => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;
    if (portalData?.isPremium && portalData?.userName && portalData.userName !== portalSlug) {
      return `${baseUrl}/view/${portalData.userName}`;
    }
    return `${baseUrl}/view?slug=${portalSlug}`;
  };

  const getDashboardStyle = (): React.CSSProperties => {
    if (!portalData) return { backgroundColor: '#0f0f0f', minHeight: '100vh' };
    const isPremiumUser = portalData.isPremium;
    const bgType = isPremiumUser && applyTarget === 'admin' ? portalData.adminBackgroundType : portalData.backgroundType;
    const gradientStartColor = isPremiumUser && applyTarget === 'admin' ? portalData.adminGradientStart : portalData.gradientStart;
    const gradientEndColor = isPremiumUser && applyTarget === 'admin' ? portalData.adminGradientEnd : portalData.gradientEnd;
    const bgImageUrl = isPremiumUser && applyTarget === 'admin' ? portalData.adminBackgroundImage : portalData.backgroundImage;
    const bgColor = isPremiumUser && applyTarget === 'admin' ? portalData.adminPrimaryColor : portalData.primaryColor;
    if (bgType === 'image' && bgImageUrl) return { backgroundImage: `url(${bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', minHeight: '100vh' };
    if (bgType === 'gradient' && gradientStartColor && gradientEndColor) return { background: `linear-gradient(135deg, ${gradientStartColor}, ${gradientEndColor})`, minHeight: '100vh' };
    return { backgroundColor: bgColor || '#0f0f0f', minHeight: '100vh' };
  };

  const getTextColor = (): string => {
    if (!portalData) return '#ffffff';
    const isPremiumUser = portalData.isPremium;
    return (isPremiumUser && applyTarget === 'admin' ? portalData.adminTextColor : portalData.textColor) || '#ffffff';
  };

  const textColorStyle = { color: getTextColor() };
  const fontClass = portalData?.fontFamily || 'font-sans';
  const realProducts = products.filter(p => !p.isDummy);
  const canAddMoreLinks = portalData?.isPremium ? links.length < 10 : links.length < 1;

  // Calculate stats for display
  const averageClicksPerLink = links.length > 0 ? Math.round(stats.totalClicks / links.length) : 0;

  // Helper to safely get most clicked link
  const getMostClickedLink = () => {
    if (links.length === 0 || stats.totalClicks === 0) return null;
    const maxLink = links.reduce((max, link) =>
      (link.clicks || 0) > (max.clicks || 0) ? link : max,
      links[0]
    );
    return {
      title: maxLink.title,
      clicks: maxLink.clicks || 0
    };
  };

  const mostClickedLink = getMostClickedLink();

  // Initialize data - FIXED: Only redirect after checking auth is complete
  // Make sure the auth check is correct:
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/status');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            setUser(data);
            await Promise.all([fetchPortalInfo(), fetchLinks(), fetchProducts()]);
            setLoading(false);
            setCheckingAuth(false);
            return;
          }
        }
        // Not authenticated - stay on login page (or redirect to login)
        setIsAuthenticated(false);
        setLoading(false);
        setCheckingAuth(false);
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/dashboard') {
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
        setLoading(false);
        setCheckingAuth(false);
        if (window.location.pathname !== '/dashboard') {
          router.replace('/dashboard');
        }
      }
    };
    checkAuth();
  }, [router]);



   useEffect(() => {
     const saved = localStorage.getItem('admin_display_settings');
     const isMobileView = window.innerWidth < 768;

     if (saved) {
       try {
         setAdminDisplaySettings(JSON.parse(saved));
       } catch (e) {}
     } else {
       // Set default based on device
       setAdminDisplaySettings({
         productsPerRow: isMobileView ? 2 : 6,
         cardStyle: isMobileView ? 'list' : 'grid',
         showDescriptions: true,
         showPrices: true
       });
     }
   }, []);

  // Show loading state while checking authentication
  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect happens in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`min-h-screen ${fontClass}`} style={getDashboardStyle()}>
      {/* Background Overlay */}
      {(portalData?.backgroundType === 'image' || portalData?.backgroundType === 'gradient') && (
        <div className="fixed inset-0 bg-black/40 pointer-events-none" />
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          linksCount={stats.linksCount}
          productsCount={stats.productsCount}
          totalClicks={stats.totalClicks}
          isPremium={portalData?.isPremium || false}
          onLogout={handleLogout}
        />
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <>
          <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} setMobileMenuOpen={setMobileMenuOpen} />
          <MobileSidebar
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            linksCount={stats.linksCount}
            productsCount={stats.productsCount}
            totalClicks={stats.totalClicks}
            isPremium={portalData?.isPremium || false}
            onLogout={handleLogout}
          />
        </>
      )}

      {/* Main Content */}
      <main className={isMobile ? 'pb-20' : 'lg:ml-72'}>
        <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={textColorStyle}>
                {activeTab === 'links' && 'Home'}
                {activeTab === 'products' && 'Shop'}
                {activeTab === 'appearance' && 'Theme Studio'}
              </h1>
              <p className="text-white/60 text-sm mt-1">
                {activeTab === 'links' && 'Manage your social media links'}
                {activeTab === 'products' && 'Showcase and sell your products'}
                {activeTab === 'appearance' && 'Customize your page style'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => window.open(getPublicUrl(), '_blank')} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur rounded-lg text-white text-sm hover:bg-white/20 transition flex items-center gap-1 sm:gap-2">
                <Eye className="w-4 h-4" /> <span className="hidden sm:inline">Preview Page</span>
              </button>
              {portalData?.isPremium && (
                <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full">
                  <span className="text-xs font-semibold text-white">Premium</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards
            linksCount={stats.linksCount}
            productsCount={stats.productsCount}
            totalClicks={stats.totalClicks}
            averageClicksPerLink={averageClicksPerLink}
            mostClickedLink={mostClickedLink}
            onAddLink={() => setShowAddLink(true)}
            onAddProduct={() => setShowAddProduct(true)}
          />

          {/* Public Page URL */}
          <PublicPageCard
            publicUrl={getPublicUrl()}
            customUsername={portalData?.userName}
            isPremium={portalData?.isPremium || false}
            onUpdateUsername={handleUpdateUsername}
          />

          {/* Tab Content */}
          {activeTab === 'links' && (
            <LinksTab
              links={links}
              onAddLink={() => setShowAddLink(true)}
              onDeleteLink={deleteLink}
              onEditLink={updateLink}
              canAddMoreLinks={canAddMoreLinks}
              linksCount={links.length}
              maxLinks={portalData?.isPremium ? 10 : 1}
              isPremium={portalData?.isPremium || false}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
                products={realProducts}
                settings={adminDisplaySettings}
                onAddProduct={() => setShowAddProduct(true)}
                onEditProduct={setEditingProduct}
                onDeleteProduct={deleteProduct}
                onOpenSettings={() => setShowDisplaySettings(true)}
                onUpdateSettings={saveAdminDisplaySettings}

            />
          )}

          {activeTab === 'appearance' && (
            <AppearanceTab
              portalData={portalData}
              applyTarget={applyTarget}
              setApplyTarget={setApplyTarget}
              templateId={templateId}
              setTemplateId={setTemplateId}
              primaryColor={primaryColor}
              setPrimaryColor={setPrimaryColor}
              textColor={textColor}
              setTextColor={setTextColor}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              backgroundType={backgroundType}
              setBackgroundType={setBackgroundType}
              gradientStart={gradientStart}
              setGradientStart={setGradientStart}
              gradientEnd={gradientEnd}
              setGradientEnd={setGradientEnd}
              backgroundImage={backgroundImage}
              setBackgroundImage={setBackgroundImage}
              savingAppearance={savingAppearance}
              onSaveAppearance={handleSaveAppearance}
              onUploadImage={async (file: File) => {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();
                if (data.success) setBackgroundImage(data.url);
              }}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {showAddLink && <AddLinkModal onClose={() => setShowAddLink(false)} onSave={addLink} />}
      {showAddProduct && <AddProductModal onClose={() => setShowAddProduct(false)} onSave={addProduct} />}
      {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={updateProduct} onDelete={deleteProduct} />}
      {showDisplaySettings && <DisplaySettingsModal settings={adminDisplaySettings} onSave={saveAdminDisplaySettings} onClose={() => setShowDisplaySettings(false)} />}
    </div>
  );
}