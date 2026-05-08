// app/components/dashboard/Sidebar.tsx
'use client';

import Link from 'next/link';
import { Home, Package, Palette, User, LogOut, Crown, Link2, TrendingUp, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeTab: 'links' | 'products' | 'appearance';
  setActiveTab: (tab: 'links' | 'products' | 'appearance') => void;
  linksCount: number;
  productsCount: number;
  totalClicks: number;
  isPremium: boolean;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, linksCount, productsCount, totalClicks, isPremium, onLogout }: SidebarProps) {
  return (
    <aside className="fixed top-0 left-0 bottom-0 w-72 z-30 flex flex-col" style={{ backgroundColor: `rgba(0, 0, 0, 0.7)`, backdropFilter: 'blur(12px)', borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div className="p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">CreatorPortal</h1>
            <p className="text-xs text-white/60">Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
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
          <button onClick={() => setActiveTab('links')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${activeTab === 'links' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}>
            <Home className="w-5 h-5" /><span>Home</span>{linksCount > 0 && <span className="ml-auto text-xs">{linksCount}</span>}
          </button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${activeTab === 'products' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}>
            <Package className="w-5 h-5" /><span>Shop</span>{productsCount > 0 && <span className="ml-auto text-xs">{productsCount}</span>}
          </button>
          <button onClick={() => setActiveTab('appearance')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${activeTab === 'appearance' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}>
            <Palette className="w-5 h-5" /><span>Theme</span>
          </button>
        </nav>

        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3 px-4">Quick Stats</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-white/10">
              <div className="flex items-center gap-2 text-white/70"><Link2 className="w-4 h-4" /><span className="text-sm">Total Links</span></div>
              <span className="font-semibold text-white">{linksCount}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-white/10">
              <div className="flex items-center gap-2 text-white/70"><Package className="w-4 h-4" /><span className="text-sm">Total Products</span></div>
              <span className="font-semibold text-white">{productsCount}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-white/10">
              <div className="flex items-center gap-2 text-white/70"><TrendingUp className="w-4 h-4" /><span className="text-sm">Total Clicks</span></div>
              <span className="font-semibold text-white">{totalClicks}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <Link href="/profile" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/70 hover:bg-white/10 transition mb-2">
            <User className="w-5 h-5" /><span>Profile Settings</span>
          </Link>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-red-400 hover:bg-red-500/20">
            <LogOut className="w-5 h-5" /><span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}