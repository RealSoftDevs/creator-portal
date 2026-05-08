// app/components/shared/DisplaySettingsModal.tsx
'use client';

import { useState } from 'react';
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
      <div className="bg-gray-900 rounded-xl max-w-md w-full p-5 border border-white/20" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-4">Display Settings</h3>
        <div className="space-y-4">
          <div><label className="block text-sm text-white/70 mb-2">Products Per Row</label><div className="flex gap-2 flex-wrap">{([2, 3, 4] as const).map(option => (<button key={option} onClick={() => updateSetting('productsPerRow', option)} className={`flex-1 py-2 rounded-lg border transition ${localSettings.productsPerRow === option ? 'bg-purple-600 text-white border-purple-600' : 'bg-white/10 text-white/70 border-white/20'}`}>{option}</button>))}</div></div>
          <div><label className="block text-sm text-white/70 mb-2">Show Descriptions</label><button onClick={() => updateSetting('showDescriptions', !localSettings.showDescriptions)} className={`w-full py-2 rounded-lg border transition text-center ${localSettings.showDescriptions ? 'bg-purple-600 text-white border-purple-600' : 'bg-white/10 text-white/70 border-white/20'}`}>{localSettings.showDescriptions ? '✓ Enabled' : '✗ Disabled'}</button></div>
          <div><label className="block text-sm text-white/70 mb-2">Show Prices</label><button onClick={() => updateSetting('showPrices', !localSettings.showPrices)} className={`w-full py-2 rounded-lg border transition text-center ${localSettings.showPrices ? 'bg-purple-600 text-white border-purple-600' : 'bg-white/10 text-white/70 border-white/20'}`}>{localSettings.showPrices ? '✓ Enabled' : '✗ Disabled'}</button></div>
          <button onClick={onClose} className="w-full py-2 bg-white/20 text-white rounded-lg">Close</button>
        </div>
      </div>
    </div>
  );
}