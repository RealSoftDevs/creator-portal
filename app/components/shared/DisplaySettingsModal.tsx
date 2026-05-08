// app/components/shared/DisplaySettingsModal.tsx
'use client';

import { useState } from 'react';
import { Grid, List, Eye, EyeOff, X } from 'lucide-react';
import { DisplaySettings } from '@/lib/settings';

export default function DisplaySettingsModal({ settings, onSave, onClose }: { settings: DisplaySettings; onSave: (s: DisplaySettings) => void; onClose: () => void }) {
  const [localSettings, setLocalSettings] = useState(settings);

  const updateSetting = <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSave(newSettings);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl max-w-md w-full border border-white/20" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Display Settings</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* View Style */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3">View Style</label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSetting('cardStyle', 'grid')}
                className={`flex-1 py-3 rounded-lg border transition flex items-center justify-center gap-2 ${
                  localSettings.cardStyle === 'grid'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'
                }`}
              >
                <Grid className="w-4 h-4" />
                Grid View
              </button>
              <button
                onClick={() => updateSetting('cardStyle', 'list')}
                className={`flex-1 py-3 rounded-lg border transition flex items-center justify-center gap-2 ${
                  localSettings.cardStyle === 'list'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'
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
              <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                Products Per Row ({localSettings.productsPerRow})
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4, 6].map(option => (
                  <button
                    key={option}
                    onClick={() => updateSetting('productsPerRow', option)}
                    className={`py-2 rounded-lg border transition ${
                      localSettings.productsPerRow === option
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {option} columns
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toggle Options */}
          <div className="space-y-3">
            <button
              onClick={() => updateSetting('showDescriptions', !localSettings.showDescriptions)}
              className="w-full flex items-center justify-between p-3 border border-white/20 rounded-lg hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-2 text-white/80">
                {localSettings.showDescriptions ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>Show Descriptions</span>
              </div>
              <div className={`w-10 h-5 rounded-full transition ${localSettings.showDescriptions ? 'bg-purple-600' : 'bg-white/20'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition transform ${localSettings.showDescriptions ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
              </div>
            </button>

            <button
              onClick={() => updateSetting('showPrices', !localSettings.showPrices)}
              className="w-full flex items-center justify-between p-3 border border-white/20 rounded-lg hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-2 text-white/80">
                {localSettings.showPrices ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>Show Prices</span>
              </div>
              <div className={`w-10 h-5 rounded-full transition ${localSettings.showPrices ? 'bg-purple-600' : 'bg-white/20'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition transform ${localSettings.showPrices ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
              </div>
            </button>
          </div>
        </div>
        <div className="sticky bottom-0 bg-gray-900 p-4 border-t border-gray-800">
          <button onClick={onClose} className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}