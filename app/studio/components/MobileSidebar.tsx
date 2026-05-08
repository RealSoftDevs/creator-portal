// app/studio/components/MobileSidebar.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { User, LogOut, Layout, Palette, Link2, Package, Crown, X, Menu } from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  activeTab: 'links' | 'products' | 'appearance';
  onTabChange: (tab: 'links' | 'products' | 'appearance') => void;
  linksCount: number;
  productsCount: number;
  isPremium: boolean;
  onProfileSettings: () => void;
  onLogout: () => void;
}

export default function MobileSidebar({
  isOpen,
  onClose,
  onOpen,
  activeTab,
  onTabChange,
  linksCount,
  productsCount,
  isPremium,
  onProfileSettings,
  onLogout
}: MobileSidebarProps) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle swipe gestures
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only detect swipes from the left edge (within 30px of left side)
      const x = e.targetTouches[0].clientX;
      if (x < 30 && !isOpen) {
        setTouchStart(x);
      } else if (isOpen && sidebarRef.current?.contains(e.target as Node)) {
        setTouchStart(e.targetTouches[0].clientX);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStart > 0) {
        setTouchEnd(e.targetTouches[0].clientX);
      }
    };

    const handleTouchEnd = () => {
      if (touchStart > 0 && touchEnd > 0) {
        const distance = touchEnd - touchStart;
        if (distance > 50 && !isOpen) {
          // Swipe right to open
          onOpen?.();
        } else if (distance < -50 && isOpen) {
          // Swipe left to close
          onClose();
        }
      }
      setTouchStart(0);
      setTouchEnd(0);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, touchEnd, isOpen, onClose, onOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Handle - Visible on mobile when sidebar is closed */}
      {!isOpen && (
        <div
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-30 lg:hidden cursor-pointer"
          onClick={onOpen}
        >
          <div className="bg-black/80 backdrop-blur-sm text-white py-4 px-2 rounded-r-xl shadow-lg hover:bg-black transition">
            <div className="flex flex-col gap-1.5">
              <div className="w-1 h-5 bg-white/70 rounded-full"></div>
              <div className="w-1 h-3 bg-white/50 rounded-full"></div>
              <div className="w-1 h-2 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                CreatorPortal
              </h1>
              <p className="text-xs text-gray-500 mt-1">Studio Dashboard</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Premium Badge */}
          {isPremium && (
            <div className="mb-6 p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center gap-2">
              <Crown className="w-5 h-5 text-white" />
              <div>
                <p className="text-white font-semibold text-sm">Premium User</p>
                <p className="text-white/80 text-xs">Unlimited links &amp; products</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <button
              onClick={() => {
                onTabChange('links');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'links' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Link2 className="w-5 h-5" />
              <span className="flex-1 text-left">Links</span>
              {linksCount > 0 && (
                <span className={`text-xs ${activeTab === 'links' ? 'text-white/80' : 'text-gray-400'}`}>
                  {linksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onTabChange('products');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'products' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="flex-1 text-left">Products</span>
              {productsCount > 0 && (
                <span className={`text-xs ${activeTab === 'products' ? 'text-white/80' : 'text-gray-400'}`}>
                  {productsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onTabChange('appearance');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === 'appearance' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Palette className="w-5 h-5" />
              <span className="flex-1 text-left">Appearance</span>
            </button>
          </nav>

          {/* Footer */}
          <div className="pt-6 border-t space-y-2">
            <button
              onClick={() => {
                onProfileSettings();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition"
            >
              <User className="w-5 h-5" />
              <span>Profile Settings</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}