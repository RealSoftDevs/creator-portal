'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBackButton } from '@/app/hooks/useBackButton';

export default function DashboardPage() {
  const router = useRouter();
  const [portalSlug, setPortalSlug] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useBackButton(undefined, true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/status');
        if (res.status === 401) {
          router.push('/login');
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        router.push('/login');
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (typeof window !== 'undefined') {
        setCurrentPath(window.location.pathname);
      }

      fetch('/api/portal/info')
        .then(res => res.json())
        .then(data => {
          if (data.slug) {
            setPortalSlug(data.slug);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <div className="space-y-4">
          <Link
            href="/studio"
            className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="font-medium">🎨 Creator Studio</div>
            <p className="text-sm text-gray-500">Manage your links, gallery, and theme</p>
          </Link>

          <a
            href={portalSlug ? `/view?slug=${portalSlug}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="font-medium">👁️ View Public Page</div>
            <p className="text-sm text-gray-500">See how your page looks to visitors</p>
            {portalSlug && (
              <p className="text-xs text-gray-400 mt-1 truncate">
                /view?slug={portalSlug}
              </p>
            )}
          </a>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white rounded-xl p-4 text-left hover:bg-red-600 transition"
          >
            <div className="font-medium">🚪 Logout</div>
            <p className="text-sm text-white/80">Sign out of your account</p>
          </button>
        </div>
      </div>

      {/* Debug Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-2 z-50 font-mono">
        <details>
          <summary className="cursor-pointer">🔍 Debug Info</summary>
          <div className="mt-2 space-y-1">
            <div>📍 Path: {currentPath}</div>
            <div>🔗 Portal Slug: {portalSlug || 'Loading...'}</div>
          </div>
        </details>
      </div>
    </div>
  );
}