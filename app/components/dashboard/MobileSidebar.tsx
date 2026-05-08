// app/components/dashboard/MobileSidebar.tsx
'use client';

import Link from 'next/link';
import { Home, Package, Palette, User, LogOut, Crown, Link2, TrendingUp, Sparkles, X } from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'links' | 'products' | 'appearance';
  setActiveTab: (tab: 'links' | 'products' | 'appearance') => void;
  linksCount: number;
  productsCount: number;
  totalClicks: number;
  isPremium: boolean;
  onLogout: () => void;
}

export default function MobileSidebar({ isOpen, onClose, activeTab, setActiveTab, linksCount, productsCount, totalClicks, isPremium, onLogout }: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-80 bg-gray-900 z-50 shadow-2xl transform transition-transform duration-300 overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">CreatorPortal</h1>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-4">
          {isPremium && (
            <div className="mb-6 p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center gap-3">
              <Crown className="w-5 h-5 text-white" />
              <div>
                <p className="text-white font-semibold text-sm">Premium User</p>
                <p className="text-white/80 text-xs">Unlimited everything</p>
              </div>
            </div>
          )}

          <nav className="space-y-1">
            <button onClick={() => { setActiveTab('links'); onClose(); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${activeTab === 'links' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'}`}>
              <Home className="w-5 h-5" /><span>Home</span>{linksCount > 0 && <span className="ml-auto text-xs">{linksCount}</span>}
            </button>
            <button onClick={() => { setActiveTab('products'); onClose(); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${activeTab === 'products' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'}`}>
              <Package className="w-5 h-5" /><span>Shop</span>{productsCount > 0 && <span className="ml-auto text-xs">{productsCount}</span>}
            </button>
            <button onClick={() => { setActiveTab('appearance'); onClose(); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${activeTab === 'appearance' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'}`}>
              <Palette className="w-5 h-5" /><span>Theme</span>
            </button>
          </nav>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-4">Quick Stats</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 text-gray-300"><Link2 className="w-4 h-4" /><span className="text-sm">Total Links</span></div>
                <span className="font-semibold text-white">{linksCount}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 text-gray-300"><Package className="w-4 h-4" /><span className="text-sm">Total Products</span></div>
                <span className="font-semibold text-white">{productsCount}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-white/5">
                <div className="flex items-center gap-2 text-gray-300"><TrendingUp className="w-4 h-4" /><span className="text-sm">Total Clicks</span></div>
                <span className="font-semibold text-white">{totalClicks}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <Link href="/profile" onClick={onClose} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-white/10 transition mb-2">
              <User className="w-5 h-5" /><span>Profile Settings</span>
            </Link>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition">
              <LogOut className="w-5 h-5" /><span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}