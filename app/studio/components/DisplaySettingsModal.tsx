// app/studio/components/DisplaySettingsModal.tsx
'use client';

// Add missing import
import { useState } from 'react';
import { X, Layout, Image as ImageIcon, Eye, EyeOff, Save, Grid } from 'lucide-react';
import { DisplaySettings, productsPerRowOptions, imageSizeMap, defaultSettings } from '@/lib/settings';

interface DisplaySettingsModalProps {
  settings: DisplaySettings;
  onSave: (settings: DisplaySettings) => void;
  onClose: () => void;
}

export default function DisplaySettingsModal({ settings, onSave, onClose }: DisplaySettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Display Settings</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Products Per Row */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Products Per Row ({localSettings.productsPerRow})
            </label>
            <div className="flex flex-wrap gap-2">
              {productsPerRowOptions.map(option => (
                <button
                  key={option}
                  onClick={() => setLocalSettings({ ...localSettings, productsPerRow: option })}
                  className={`px-4 py-2 rounded-lg border transition ${
                    localSettings.productsPerRow === option
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Image Size */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Image Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setLocalSettings({ ...localSettings, imageSize: size })}
                  className={`py-2 rounded-lg border transition capitalize ${
                    localSettings.imageSize === size
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="mt-3 flex justify-center gap-4">
              <div className={`border rounded p-1 ${localSettings.imageSize === 'small' ? 'border-black ring-2 ring-black' : 'border-gray-200'}`}>
                <div className="w-12 h-12 bg-gray-100 rounded"></div>
              </div>
              <div className={`border rounded p-1 ${localSettings.imageSize === 'medium' ? 'border-black ring-2 ring-black' : 'border-gray-200'}`}>
                <div className="w-16 h-16 bg-gray-100 rounded"></div>
              </div>
              <div className={`border rounded p-1 ${localSettings.imageSize === 'large' ? 'border-black ring-2 ring-black' : 'border-gray-200'}`}>
                <div className="w-20 h-20 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-3">
            <button
              onClick={() => setLocalSettings({ ...localSettings, showDescriptions: !localSettings.showDescriptions })}
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
              onClick={() => setLocalSettings({ ...localSettings, showPrices: !localSettings.showPrices })}
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

          {/* Live Preview */}
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
              <Grid className="w-3 h-3" />
              Live Preview
            </p>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${localSettings.productsPerRow}, 1fr)` }}>
              {Array(Math.min(localSettings.productsPerRow, 4)).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className={`bg-gray-200 ${imageSizeMap[localSettings.imageSize].className}`} />
                  <div className="p-2">
                    <div className="h-2 bg-gray-200 rounded w-3/4 mb-1" />
                    {localSettings.showPrices && <div className="h-2 bg-gray-200 rounded w-1/2" />}
                    {localSettings.showDescriptions && <div className="h-1 bg-gray-200 rounded w-full mt-1" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onSave(localSettings)}
            className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
