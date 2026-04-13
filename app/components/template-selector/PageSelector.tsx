'use client';

import { Layout } from 'lucide-react';

interface PageSelectorProps {
  targetPage: 'public' | 'admin';
  setTargetPage: (page: 'public' | 'admin') => void;
  isPremium: boolean;
  useSeparateAdminStyle: boolean;
  onToggleSeparateAdminStyle: () => void;
}

export default function PageSelector({
  targetPage,
  setTargetPage,
  isPremium,
  useSeparateAdminStyle,
  onToggleSeparateAdminStyle
}: PageSelectorProps) {
  return (
    <div className="mb-6 p-3 bg-gray-50 rounded-lg">
      <h4 className="font-medium mb-2 flex items-center gap-2">
        <Layout className="w-4 h-4" />
        Apply to:
      </h4>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setTargetPage('public')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            targetPage === 'public' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          🌐 Public Page
        </button>
        <button
          onClick={() => setTargetPage('admin')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            targetPage === 'admin' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          🛠️ Admin Panel
        </button>
      </div>
      
      {/* Separate Admin Style Toggle */}
      {targetPage === 'admin' && isPremium && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium">Separate Admin Style</span>
              <p className="text-xs text-gray-500">Keep admin panel style independent</p>
            </div>
            <button
              onClick={onToggleSeparateAdminStyle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                useSeparateAdminStyle ? 'bg-green-500' : 'bg-gray-400'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  useSeparateAdminStyle ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        </div>
      )}
      
      {targetPage === 'admin' && !isPremium && (
        <p className="text-xs text-yellow-600 mt-2 text-center">
          ⭐ Upgrade to Premium to customize Admin Panel separately!
        </p>
      )}
    </div>
  );
}