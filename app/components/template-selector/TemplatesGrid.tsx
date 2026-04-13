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

export default function TemplatesGrid({
  freeTemplates,
  premiumTemplates,
  previewTemplate,
  isPremium,
  onPreviewClick
}: TemplatesGridProps) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2">Templates</h4>
      
      {/* Free Templates */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {freeTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onPreviewClick(template.id)}
            className={`border rounded-lg p-2 text-left hover:shadow-md transition ${
              previewTemplate === template.id ? 'ring-2 ring-black' : ''
            }`}
          >
            <div className={`h-12 rounded-md mb-1 bg-gradient-to-r ${template.gradient}`}></div>
            <p className="text-xs font-medium truncate">{template.name}</p>
            <span className="text-[10px] text-green-600">Free</span>
          </button>
        ))}
      </div>
      
      {/* Premium Templates */}
      <div>
        <div className="flex items-center gap-1 mb-1">
          <Crown className="w-3 h-3 text-yellow-500" />
          <span className="text-xs text-yellow-600">Premium</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
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
              <div className={`h-12 rounded-md mb-1 bg-gradient-to-r ${template.gradient} ${!isPremium ? 'opacity-50' : ''}`}></div>
              <p className="text-xs font-medium truncate">{template.name}</p>
              <span className="text-[10px] text-yellow-600">Premium</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}