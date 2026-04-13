'use client';

import { Eye } from 'lucide-react';

interface PreviewCardProps {
  portalSlug: string;
}

export default function PreviewCard({ portalSlug }: PreviewCardProps) {
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/view?slug=${portalSlug}` 
    : '';

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">Your public page</p>
          <p className="font-mono text-xs mt-1">{publicUrl}</p>
        </div>
        <button
          onClick={() => window.open(`/view?slug=${portalSlug}`, '_blank')}
          className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1"
        >
          <Eye className="w-4 h-4" /> Preview
        </button>
      </div>
    </div>
  );
}