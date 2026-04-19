// app/dashboard/page.tsx - Complete fix
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { getTemplateById } from '@/lib/templates/index';

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth('/login');
  const router = useRouter();
  const [portalSlug, setPortalSlug] = useState('');
  const [adminSettings, setAdminSettings] = useState({
    templateId: 'template1',
    primaryColor: '#f5f5f5',
    textColor: '#1a1a1a',
    fontFamily: 'font-sans',
    backgroundType: 'gradient',
    gradientStart: '#fb923c',
    gradientEnd: '#fde047',
    backgroundImage: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminSettings();
    }
  }, [isAuthenticated]);

  const loadAdminSettings = async () => {
    try {
      const res = await fetch('/api/portal/info');
      const data = await res.json();

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📱 DASHBOARD - Loading Settings');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Admin backgroundType:', data.adminBackgroundType || data.backgroundType);
      console.log('Admin gradientStart:', data.adminGradientStart || data.gradientStart);
      console.log('Admin gradientEnd:', data.adminGradientEnd || data.gradientEnd);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      setPortalSlug(data.slug);

      // Load admin settings (use ADMIN fields if they exist, otherwise MAIN)
      setAdminSettings({
        templateId: data.adminTemplateId || data.templateId || 'template1',
        primaryColor: data.adminPrimaryColor || data.primaryColor || '#f5f5f5',
        textColor: data.adminTextColor || data.textColor || '#1a1a1a',
        fontFamily: data.adminFontFamily || data.fontFamily || 'font-sans',
        backgroundType: data.adminBackgroundType || data.backgroundType || 'gradient',
        gradientStart: data.adminGradientStart || data.gradientStart || '#fb923c',
        gradientEnd: data.adminGradientEnd || data.gradientEnd || '#fde047',
        backgroundImage: data.adminBackgroundImage || data.backgroundImage || ''
      });
    } catch (error) {
      console.error('Failed to load admin settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const template = getTemplateById(adminSettings.templateId);

  // Build background style
  const backgroundStyle: React.CSSProperties = {};

  if (adminSettings.backgroundType === 'gradient' && adminSettings.gradientStart && adminSettings.gradientEnd) {
    backgroundStyle.background = `linear-gradient(135deg, ${adminSettings.gradientStart}, ${adminSettings.gradientEnd})`;
    backgroundStyle.minHeight = '100vh';
    console.log('🎨 Dashboard using GRADIENT:', adminSettings.gradientStart, '→', adminSettings.gradientEnd);
  } else if (adminSettings.backgroundType === 'image' && adminSettings.backgroundImage) {
    backgroundStyle.backgroundImage = `url(${adminSettings.backgroundImage})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
    backgroundStyle.minHeight = '100vh';
  } else {
    backgroundStyle.backgroundColor = adminSettings.primaryColor || template.defaultBackground;
    backgroundStyle.minHeight = '100vh';
  }

  const textColorStyle = { color: adminSettings.textColor || template.defaultTextColor };
  const fontClass = adminSettings.fontFamily || 'font-sans';

  return (
    <div className={`min-h-screen ${fontClass}`} style={backgroundStyle}>
      {adminSettings.backgroundType === 'image' && adminSettings.backgroundImage && (
        <div className="fixed inset-0 bg-black/20 pointer-events-none" />
      )}

      <div className="relative z-10 max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" style={textColorStyle}>Dashboard</h1>

        <div className="space-y-4">
          <Link
            href="/studio"
            className="block bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition"
            style={{ color: textColorStyle.color }}
          >
            <div className="font-medium">🎨 Creator Studio</div>
            <p className="text-sm opacity-70">Manage your links, gallery, and theme</p>
          </Link>

          {portalSlug && (
            <a
              href={`/view?slug=${portalSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition"
              style={{ color: textColorStyle.color }}
            >
              <div className="font-medium">👁️ View Public Page</div>
              <p className="text-sm opacity-70">See how your page looks to visitors</p>
            </a>
          )}

          <button
            onClick={handleLogout}
            className="w-full bg-red-500/80 backdrop-blur-sm text-white rounded-xl p-4 text-left hover:bg-red-600 transition"
          >
            <div className="font-medium">🚪 Logout</div>
            <p className="text-sm text-white/80">Sign out of your account</p>
          </button>
        </div>
      </div>
    </div>
  );
}