// app/components/dashboard/MobileBottomNav.tsx
'use client';

import Link from 'next/link';
import { Home, Package, Palette, User } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'links' | 'products' | 'appearance';
  setActiveTab: (tab: 'links' | 'products' | 'appearance') => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function MobileBottomNav({ activeTab, setActiveTab, setMobileMenuOpen }: MobileBottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-lg border-t border-white/10 safe-bottom">
      <div className="flex justify-around py-2">
        <button onClick={() => setActiveTab('links')} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${activeTab === 'links' ? 'text-purple-400' : 'text-white/60'}`}>
          <Home className="w-5 h-5" /><span className="text-xs">Home</span>
        </button>
        <button onClick={() => setActiveTab('products')} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${activeTab === 'products' ? 'text-purple-400' : 'text-white/60'}`}>
          <Package className="w-5 h-5" /><span className="text-xs">Shop</span>
        </button>
        <button onClick={() => setActiveTab('appearance')} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${activeTab === 'appearance' ? 'text-purple-400' : 'text-white/60'}`}>
          <Palette className="w-5 h-5" /><span className="text-xs">Theme</span>
        </button>
        <button onClick={() => setMobileMenuOpen(true)} className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-white/60">
          <User className="w-5 h-5" /><span className="text-xs">Menu</span>
        </button>
      </div>
    </div>
  );
}