'use client';

import { Eye } from 'lucide-react';

interface PreviewCardProps {
  portalSlug: string;
  customUsername?: string;
  isPremium?: boolean;
}

export default function PreviewCard({ portalSlug, customUsername, isPremium }: PreviewCardProps) {
  // Determine which URL to show
  const getPublicUrl = () => {
    if (typeof window === 'undefined') return '';

    const baseUrl = window.location.origin;

    // If premium user has custom username, show that URL
    if (isPremium && customUsername && customUsername !== portalSlug) {
      return `${baseUrl}/view/${customUsername}`;
    }

    // Otherwise show the slug URL
    return `${baseUrl}/view?slug=${portalSlug}`;
  };

  const publicUrl = getPublicUrl();
  const slugUrl = typeof window !== 'undefined' ? `${window.location.origin}/view?slug=${portalSlug}` : '';

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">Your public page</p>
          <p className="font-mono text-xs mt-1 break-all">{publicUrl}</p>
          {isPremium && customUsername && customUsername !== portalSlug && (
            <p className="text-xs opacity-60 mt-1">
              Old URL: {slugUrl}
            </p>
          )}
        </div>
        <button
          onClick={() => window.open(publicUrl, '_blank')}
          className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-white/30 transition"
        >
          <Eye className="w-4 h-4" /> Preview
        </button>
      </div>
    </div>
  );
}