// app/studio/components/PreviewCard.tsx
'use client';

import { Eye } from 'lucide-react';

interface PreviewCardProps {
  portalSlug: string;
  customUsername?: string;
  isPremium?: boolean;
}

export default function PreviewCard({ portalSlug, customUsername, isPremium }: PreviewCardProps) {
  const getPublicUrl = () => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;
    if (isPremium && customUsername && customUsername !== portalSlug) {
      return `${baseUrl}/view/${customUsername}`;
    }
    return `${baseUrl}/view?slug=${portalSlug}`;
  };

  const publicUrl = getPublicUrl();
  const slugUrl = typeof window !== 'undefined' ? `${window.location.origin}/view?slug=${portalSlug}` : '';

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90" style={{ color: 'inherit' }}>Your public page</p>
          <p className="font-mono text-xs mt-1 break-all opacity-70">{publicUrl}</p>
          {isPremium && customUsername && customUsername !== portalSlug && (
            <p className="text-xs opacity-50 mt-1">Old URL: {slugUrl}</p>
          )}
        </div>
        <button
          onClick={() => window.open(publicUrl, '_blank')}
          className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-sm flex items-center gap-1 transition"
        >
          <Eye className="w-4 h-4" /> Preview
        </button>
      </div>
    </div>
  );
}