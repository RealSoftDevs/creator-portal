'use client';

import { Sparkles } from 'lucide-react';

interface LivePreviewProps {
  getPreviewStyle: () => React.CSSProperties;
  getPreviewTextColor: () => string;
  getPreviewFont: () => string;
  userName?: string;
}

export default function LivePreview({
  getPreviewStyle,
  getPreviewTextColor,
  getPreviewFont,
  userName = 'Your Name'
}: LivePreviewProps) {
  // Get first letter for avatar
  const firstLetter = userName?.charAt(0).toUpperCase() || '👤';
  const displayName = userName || 'Your Name';

  return (
    <div className="bg-white shadow-sm mb-3 p-3 border rounded-lg">
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
        <Sparkles className="w-3 h-3" />
        <span>Live Preview</span>
      </div>
      <div className="rounded-lg p-3 transition-all duration-300" style={getPreviewStyle()}>
        <div className="text-center" style={{ color: getPreviewTextColor(), fontFamily: getPreviewFont() }}>
          <div className="w-12 h-12 mx-auto bg-white/20 rounded-full mb-2 flex items-center justify-center text-lg">
            {firstLetter === '👤' ? '👤' : firstLetter}
          </div>
          <p className="font-semibold text-base">{displayName}</p>
          <p className="text-xs opacity-70 mt-1">Content Creator</p>
        </div>
      </div>
    </div>
  );
}