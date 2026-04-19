// app/components/template-selector/Footer.tsx
'use client';

import { Check, Sparkles } from 'lucide-react';

interface FooterProps {
  applyToAll: boolean;
  isPremium: boolean;
  applying: boolean;
  onApplyToPublic: () => void;
  onApplyToAdmin: () => void;
  onApplyToBoth: () => void;
}

export default function Footer({
  applyToAll,
  isPremium,
  applying,
  onApplyToPublic,
  onApplyToAdmin,
  onApplyToBoth
}: FooterProps) {
  return (
    <div className="sticky bottom-0 bg-white border-t p-3 rounded-b-2xl">
      <div className="flex gap-2">
        {applyToAll ? (
          <button
            onClick={onApplyToBoth}
            disabled={applying}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {applying ? (
              'Applying...'
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Apply to Both Pages
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={onApplyToPublic}
              disabled={applying}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {applying ? '...' : <Check className="w-4 h-4" />}
              Public Page
            </button>
            <button
              onClick={onApplyToAdmin}
              disabled={applying || !isPremium}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-1 ${
                isPremium
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Admin Panel
              {!isPremium && ' 🔒'}
            </button>
          </>
        )}
      </div>
      {!isPremium && !applyToAll && (
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Upgrade to Premium to customize admin panel separately
        </p>
      )}
    </div>
  );
}