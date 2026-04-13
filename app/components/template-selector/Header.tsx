'use client';

import { X, Palette, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  applyToAll: boolean;
  setApplyToAll: (value: boolean) => void;
  onClose: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export default function Header({ applyToAll, setApplyToAll, onClose, onBack, showBack = false }: HeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white rounded-t-xl border-b">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Palette className="w-4 h-4" />
          <h3 className="font-semibold text-sm">Theme Editor</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Apply to both</span>
          <button
            onClick={() => setApplyToAll(!applyToAll)}
            className={`relative inline-flex h-4 w-8 items-center rounded-full transition ${
              applyToAll ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
              applyToAll ? 'translate-x-4' : 'translate-x-1'
            }`} />
          </button>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}