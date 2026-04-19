// app/components/template-selector/TemplatesGrid.tsx
'use client';

import { Crown, Sparkles } from 'lucide-react';
import { Template } from '@/lib/templates/index';

interface TemplatesGridProps {
  freeTemplates: Template[];
  premiumTemplates: Template[];
  previewTemplate: string;
  isPremium: boolean;
  onPreviewClick: (templateId: string) => void;
}

const getGradientCSS = (gradient: string): string => {
  const gradientMap: Record<string, string> = {
    // Free templates
    'from-orange-400 via-orange-300 to-yellow-200': 'linear-gradient(135deg, #fb923c, #fdba74, #fde047)',
    'from-blue-600 via-blue-500 to-cyan-300': 'linear-gradient(135deg, #2563eb, #3b82f6, #67e8f9)',
    'from-purple-600 via-purple-500 to-pink-400': 'linear-gradient(135deg, #9333ea, #a855f7, #f472b6)',
    'from-green-600 via-green-500 to-emerald-300': 'linear-gradient(135deg, #16a34a, #22c55e, #6ee7b7)',

    // Premium templates
    'from-gray-900 via-purple-900 to-indigo-800': 'linear-gradient(135deg, #111827, #4c1d95, #3730a3)',
    'from-rose-600 via-orange-500 to-yellow-400': 'linear-gradient(135deg, #e11d48, #f97316, #facc15)',
    'from-cyan-400 via-blue-500 to-purple-600': 'linear-gradient(135deg, #22d3ee, #3b82f6, #7c3aed)',
    'from-pink-500 via-rose-400 to-red-400': 'linear-gradient(135deg, #ec4899, #fb7185, #f87171)',
    'from-teal-400 via-cyan-500 to-blue-500': 'linear-gradient(135deg, #2dd4bf, #06b6d4, #3b82f6)',
    'from-amber-400 via-yellow-500 to-orange-500': 'linear-gradient(135deg, #fbbf24, #eab308, #f97316)',
    'from-indigo-900 via-purple-900 to-pink-900': 'linear-gradient(135deg, #312e81, #581c87, #831843)',
    'from-emerald-400 via-green-400 to-teal-400': 'linear-gradient(135deg, #34d399, #4ade80, #2dd4bf)',
    'from-purple-300 via-purple-400 to-indigo-400': 'linear-gradient(135deg, #d8b4fe, #c084fc, #818cf8)',
    'from-red-500 via-orange-500 to-blue-500': 'linear-gradient(135deg, #ef4444, #f97316, #3b82f6)',
  };
  return gradientMap[gradient] || 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
};

export default function TemplatesGrid({
  freeTemplates,
  premiumTemplates,
  previewTemplate,
  isPremium,
  onPreviewClick
}: TemplatesGridProps) {
  return (
    <div className="space-y-6">
      {/* Free Templates Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-green-500" />
          <h4 className="text-sm font-semibold text-gray-700">Free Templates</h4>
          <span className="text-xs text-gray-400">{freeTemplates.length} available</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {freeTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onPreviewClick(template.id)}
              className={`group relative rounded-xl overflow-hidden transition-all duration-200 ${
                previewTemplate === template.id
                  ? 'ring-2 ring-offset-2 ring-black shadow-lg scale-[0.98]'
                  : 'hover:shadow-md hover:scale-[1.02]'
              }`}
            >
              <div
                className="h-24 rounded-t-xl relative overflow-hidden"
                style={{ background: getGradientCSS(template.gradient) }}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />
                {/* Decorative elements */}
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] bg-white/90 backdrop-blur px-1.5 py-0.5 rounded-full text-green-600 font-medium">
                    Free
                  </span>
                </div>
              </div>
              <div className="p-2 text-left bg-white">
                <p className="text-xs font-semibold truncate">{template.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{template.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Premium Templates Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-4 h-4 text-yellow-500" />
          <h4 className="text-sm font-semibold text-gray-700">Premium Collection</h4>
          <span className="text-xs text-yellow-500">{premiumTemplates.length} templates</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {premiumTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onPreviewClick(template.id)}
              disabled={!isPremium}
              className={`group relative rounded-xl overflow-hidden transition-all duration-200 ${
                previewTemplate === template.id
                  ? 'ring-2 ring-offset-2 ring-yellow-500 shadow-lg scale-[0.98]'
                  : isPremium ? 'hover:shadow-md hover:scale-[1.02]' : 'cursor-not-allowed'
              }`}
            >
              <div
                className="h-24 rounded-t-xl relative overflow-hidden"
                style={{ background: getGradientCSS(template.gradient) }}
              >
                {/* Premium badge */}
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] bg-yellow-500 text-white px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5" /> Premium
                  </span>
                </div>

                {/* Lock overlay for non-premium users */}
                {!isPremium && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                      <span className="text-[10px] text-white">Upgrade</span>
                    </div>
                  </div>
                )}

                {/* Gradient animation on hover for premium users */}
                {isPremium && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/0 group-hover:from-black/10 group-hover:to-black/5 transition-all duration-300" />
                )}
              </div>
              <div className="p-2 text-left bg-white">
                <p className="text-xs font-semibold truncate flex items-center gap-1">
                  {template.name}
                  {template.isPremium && <Crown className="w-2.5 h-2.5 text-yellow-500" />}
                </p>
                <p className="text-[10px] text-gray-400 truncate">{template.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}