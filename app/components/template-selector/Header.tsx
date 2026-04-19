// app/components/template-selector/Header.tsx
'use client';

import { X, Palette, ArrowLeft, Sparkles } from 'lucide-react';

interface HeaderProps {
  onClose: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export default function Header({ onClose, onBack, showBack = false }: HeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white rounded-t-xl border-b">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={onBack}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Palette className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800">Theme Studio</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400">
            <Sparkles className="w-3 h-3" />
            <span>Customize your style</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}