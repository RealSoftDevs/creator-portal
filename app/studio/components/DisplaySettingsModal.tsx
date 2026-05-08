// app/studio/components/DisplaySettingsModal.tsx
'use client';

import { useState, useCallback } from 'react';
import { X, Layout, Eye, EyeOff, Grid, List } from 'lucide-react';
import { DisplaySettings, productsPerRowOptions } from '@/lib/settings';

interface DisplaySettingsModalProps {
  settings: DisplaySettings;
  onSave: (settings: DisplaySettings) => void;
  onClose: () => void;
  title?: string;
}

export default function DisplaySettingsModal({ settings, onSave, onClose, title = 'Display Settings' }: DisplaySettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<DisplaySettings>(settings);

  const updateSetting = useCallback(<K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSave(newSettings);
  }, [localSettings, onSave]);

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full"
        onClick={handleModalClick}
      >
        <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Card Style */}
          <div>
            <label className="block text-sm font-medium mb-3">View Style</label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('cardStyle', 'grid')}
                className={`flex-1 py-3 rounded-lg border transition flex items-center justify-center gap-2 ${
                  localSettings.cardStyle === 'grid'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Grid className="w-4 h-4" />
                Grid View
              </button>
              <button
                onClick={() => updateSetting('cardStyle', 'list')}
                className={`flex-1 py-3 rounded-lg border transition flex items-center justify-center gap-2 ${
                  localSettings.cardStyle === 'list'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
                List View
              </button>
            </div>
          </div>

          {/* Products Per Row - Only for Grid view */}
          {localSettings.cardStyle === 'grid' && (
            <div>
              <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Products Per Row ({localSettings.productsPerRow})
              </label>
              <div className="grid grid-cols-3 gap-2">
                {productsPerRowOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => updateSetting('productsPerRow', option)}
                    className={`py-2 rounded-lg border transition ${
                      localSettings.productsPerRow === option
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option} columns
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">How many products to show in each row</p>
            </div>
          )}

          {/* Toggle Options */}
          <div className="space-y-3">
            <button
              onClick={() => updateSetting('showDescriptions', !localSettings.showDescriptions)}
              className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                {localSettings.showDescriptions ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>Show Descriptions</span>
              </div>
              <div className={`w-10 h-5 rounded-full transition ${localSettings.showDescriptions ? 'bg-black' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition transform ${localSettings.showDescriptions ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
              </div>
            </button>

            <button
              onClick={() => updateSetting('showPrices', !localSettings.showPrices)}
              className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                {localSettings.showPrices ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>Show Prices</span>
              </div>
              <div className={`w-10 h-5 rounded-full transition ${localSettings.showPrices ? 'bg-black' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition transform ${localSettings.showPrices ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
              </div>
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t">
          <button onClick={onClose} className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}