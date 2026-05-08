// app/studio/components/TemplateSelector.tsx
'use client';

import { useState } from 'react';
import { X, Crown, Check } from 'lucide-react';
import { templates, getTemplateById, Template } from '@/lib/templates/index';

interface TemplateSelectorProps {
  currentTemplateId: string;
  isPremium: boolean;
  onSelect: (templateId: string) => void;
  onClose: () => void;
}

export default function TemplateSelector({
  currentTemplateId,
  isPremium,
  onSelect,
  onClose
}: TemplateSelectorProps) {
  const [selectedId, setSelectedId] = useState(currentTemplateId);

  const freeTemplates = templates.filter(t => !t.isPremium);
  const premiumTemplates = templates.filter(t => t.isPremium);

  const handleSelect = (templateId: string) => {
    const template = getTemplateById(templateId);

    // Check if user can select premium template
    if (template?.isPremium && !isPremium) {
      alert('Premium templates require a premium subscription. Please upgrade to use this template.');
      return;
    }

    setSelectedId(templateId);
  };

  const handleConfirm = () => {
    onSelect(selectedId);
    onClose();
  };

  const TemplateCard = ({ template }: { template: Template }) => {
    const isSelected = selectedId === template.id;
    const isDisabled = template.isPremium && !isPremium;

    return (
      <button
        onClick={() => handleSelect(template.id)}
        disabled={isDisabled}
        className={`
          relative rounded-xl overflow-hidden border-2 transition-all text-left
          ${isSelected ? 'border-black ring-2 ring-black/20' : 'border-gray-200'}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
        `}
      >
        {/* Template Preview */}
        <div className={`h-32 bg-gradient-to-r ${template.gradient} relative`}>
          {template.isPremium && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Premium
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
            {template.previewBadge}
          </div>
        </div>

        {/* Template Info */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm">{template.name}</h3>
            {isSelected && <Check className="w-4 h-4 text-green-600" />}
          </div>
          <p className="text-xs text-gray-500">{template.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="text-xs text-gray-400">{template.category || 'Modern'}</div>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="text-xs text-gray-400">{template.textColor === 'text-white' ? 'Light text' : 'Dark text'}</div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold">Choose a Template</h2>
            <p className="text-sm text-gray-500 mt-1">Select a design for your public page</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Free Templates */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Free Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {freeTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>

          {/* Premium Templates */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Premium Templates</h3>
              {!isPremium && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  Upgrade to unlock
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {premiumTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Apply Template
          </button>
        </div>
      </div>
    </div>
  );
}