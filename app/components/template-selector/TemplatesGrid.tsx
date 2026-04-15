'use client';

import { Crown } from 'lucide-react';
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
    'from-blue-100 via-blue-50 to-indigo-100': 'linear-gradient(135deg, #dbeafe, #eff6ff, #e0e7ff)',
    'from-orange-100 via-orange-50 to-amber-100': 'linear-gradient(135deg, #ffedd5, #fff7ed, #fef3c7)',
    'from-teal-100 via-teal-50 to-cyan-100': 'linear-gradient(135deg, #ccfbf1, #f0fdfa, #cffafe)',
    'from-purple-100 via-purple-50 to-pink-100': 'linear-gradient(135deg, #f3e8ff, #faf5ff, #fce7f3)',
    'from-green-100 via-green-50 to-emerald-100': 'linear-gradient(135deg, #dcfce7, #f0fdf4, #d1fae5)',
    'from-amber-100 via-amber-50 to-orange-100': 'linear-gradient(135deg, #fef3c7, #fffbeb, #ffedd5)',
    'from-cyan-100 via-cyan-50 to-blue-100': 'linear-gradient(135deg, #cffafe, #ecfeff, #dbeafe)',
    'from-rose-100 via-rose-50 to-pink-100': 'linear-gradient(135deg, #ffe4e6, #fff1f2, #fce7f3)',
    'from-yellow-100 via-yellow-50 to-amber-100': 'linear-gradient(135deg, #fef9c3, #fefce8, #fef3c7)',
    'from-blue-100 via-blue-50 to-white': 'linear-gradient(135deg, #dbeafe, #eff6ff, #ffffff)',
    'from-pink-100 via-pink-50 to-green-100': 'linear-gradient(135deg, #fce7f3, #fdf2f8, #dcfce7)',
    'from-gray-800 via-gray-700 to-gray-900': 'linear-gradient(135deg, #1f2937, #374151, #111827)',
  };
  return gradientMap[gradient] || '#f3f4f6';
};

export default function TemplatesGrid({
  freeTemplates,
  premiumTemplates,
  previewTemplate,
  isPremium,
  onPreviewClick
}: TemplatesGridProps) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2">🎨 Templates</h4>

      {/* Free Templates */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {freeTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onPreviewClick(template.id)}
            className={`border rounded-lg p-2 text-left hover:shadow-md transition ${
              previewTemplate === template.id ? 'ring-2 ring-black' : ''
            }`}
          >
            <div
              className="h-16 rounded-md mb-1"
              style={{ background: getGradientCSS(template.gradient) }}
            ></div>
            <p className="text-xs font-medium truncate">{template.name}</p>
            <span className="text-[10px] text-green-600">Free</span>
          </button>
        ))}
      </div>

      {/* Premium Templates */}
      <div>
        <div className="flex items-center gap-1 mb-1">
          <Crown className="w-3 h-3 text-yellow-500" />
          <span className="text-xs text-yellow-600">Premium Collection</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {premiumTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onPreviewClick(template.id)}
              className={`border rounded-lg p-2 text-left relative ${
                previewTemplate === template.id ? 'ring-2 ring-yellow-500' : ''
              }`}
            >
              {!isPremium && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <Crown className="text-white w-4 h-4" />
                </div>
              )}
              <div
                className="h-16 rounded-md mb-1"
                style={{ background: getGradientCSS(template.gradient) }}
              ></div>
              <p className="text-xs font-medium truncate">{template.name}</p>
              <span className="text-[10px] text-yellow-600">Premium</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}