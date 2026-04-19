// app/components/template-selector/LivePreview.tsx
'use client';

import { Sparkles, Eye } from 'lucide-react';

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
  const firstLetter = userName?.charAt(0).toUpperCase() || '👤';
  const displayName = userName || 'Your Name';
  const fontClass = getPreviewFont();

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b">
        <Eye className="w-3 h-3 text-gray-400" />
        <span className="text-xs font-medium text-gray-600">Live Preview</span>
        <Sparkles className="w-3 h-3 text-yellow-400 ml-auto" />
      </div>

      <div
        className="p-4 transition-all duration-300 min-h-[180px] relative overflow-hidden"
        style={getPreviewStyle()}
      >
        {/* Animated gradient overlay for extra effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/5 pointer-events-none" />

        <div className="relative z-10 text-center" style={{ color: getPreviewTextColor() }}>
          {/* Avatar with gradient ring */}
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-white/10 animate-pulse" />
            <div className={`w-14 h-14 mx-auto rounded-full mb-3 flex items-center justify-center text-xl font-bold shadow-lg relative overflow-hidden`}
              style={{
                background: `linear-gradient(135deg, ${getPreviewTextColor()}20, ${getPreviewTextColor()}10)`,
                backdropFilter: 'blur(10px)',
                border: `2px solid ${getPreviewTextColor()}40`
              }}>
              {firstLetter === '👤' ? '👤' : firstLetter}
            </div>
          </div>

          {/* Name with gradient text effect for light backgrounds */}
          <p className={`font-bold text-base ${fontClass} mb-1`}>
            {displayName}
          </p>

          {/* Bio preview */}
          <p className={`text-xs opacity-80 ${fontClass}`}>
            Content Creator & Digital Artist
          </p>

          {/* Social stats preview */}
          <div className="flex justify-center gap-3 mt-3 text-[10px] opacity-60">
            <span>📸 1.2K</span>
            <span>▶️ 5.6K</span>
            <span>💬 342</span>
          </div>
        </div>
      </div>

      {/* Preview hint */}
      <div className="px-3 py-1.5 bg-gray-50 border-t text-[10px] text-gray-400 text-center">
        This is how your page will look
      </div>
    </div>
  );
}