// app/studio/components/TemplateSelector.tsx
'use client';

import { useState } from 'react';
import { X, Crown, Check, Palette, Type, Image as ImageIcon, Layout } from 'lucide-react';
import { templates, getTemplateById, Template } from '@/lib/templates/index';

interface TemplateSelectorProps {
  currentTemplateId: string;
  currentSettings?: {
    primaryColor: string;
    textColor: string;
    fontFamily: string;
    backgroundType: string;
    gradientStart: string;
    gradientEnd: string;
    backgroundImage: string;
  };
  isPremium: boolean;
  onSelect: (config: any) => Promise<void>;
  onClose: () => void;
}

export default function TemplateSelector({
  currentTemplateId,
  currentSettings = {
    primaryColor: '#f5f5f5',
    textColor: '#1a1a1a',
    fontFamily: 'font-sans',
    backgroundType: 'image',
    gradientStart: '#fb923c',
    gradientEnd: '#fde047',
    backgroundImage: '/images/default-bg.jpg'
  },
  isPremium,
  onSelect,
  onClose
}: TemplateSelectorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(currentTemplateId);
  const [activeTab, setActiveTab] = useState<'template' | 'colors' | 'background' | 'font'>('template');
  const [primaryColor, setPrimaryColor] = useState(currentSettings.primaryColor);
  const [textColor, setTextColor] = useState(currentSettings.textColor);
  const [fontFamily, setFontFamily] = useState(currentSettings.fontFamily);
  const [backgroundType, setBackgroundType] = useState<'color' | 'gradient' | 'image'>(currentSettings.backgroundType as any);
  const [gradientStart, setGradientStart] = useState(currentSettings.gradientStart);
  const [gradientEnd, setGradientEnd] = useState(currentSettings.gradientEnd);
  const [backgroundImage, setBackgroundImage] = useState(currentSettings.backgroundImage);
  const [applyTo, setApplyTo] = useState<'public' | 'admin'>('public');
  const [saving, setSaving] = useState(false);

  const freeTemplates = templates.filter(t => !t.isPremium);
  const premiumTemplates = templates.filter(t => t.isPremium);

  const handleTemplateSelect = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template?.isPremium && !isPremium) {
      alert('Premium templates require a premium subscription. Please upgrade to use this template.');
      return;
    }
    setSelectedTemplateId(templateId);

    // Apply template colors
    if (template) {
      setPrimaryColor(template.defaultBackground);
      setTextColor(template.defaultTextColor);
      setBackgroundType('gradient');
      setGradientStart(template.gradientColors.start);
      setGradientEnd(template.gradientColors.end);
    }
  };

  const handleApply = async () => {
    setSaving(true);
    const config = {
      target: applyTo,
      templateId: selectedTemplateId,
      primaryColor,
      textColor,
      fontFamily,
      backgroundType,
      gradientStart,
      gradientEnd,
      backgroundImage: backgroundType === 'image' ? backgroundImage : '',
    };
    await onSelect(config);
    setSaving(false);
    onClose();
  };

  const previewStyle = () => {
    if (backgroundType === 'color') {
      return { backgroundColor: primaryColor };
    } else if (backgroundType === 'gradient') {
      return { background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` };
    } else if (backgroundType === 'image' && backgroundImage) {
      return { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    return {};
  };

  const presetColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold">Theme Customizer</h2>
            <p className="text-sm text-gray-500 mt-1">Customize your page appearance</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-4 gap-1">
          {(['template', 'colors', 'background', 'font'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === tab
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'template' && <Layout className="w-4 h-4 inline mr-2" />}
              {tab === 'colors' && <Palette className="w-4 h-4 inline mr-2" />}
              {tab === 'background' && <ImageIcon className="w-4 h-4 inline mr-2" />}
              {tab === 'font' && <Type className="w-4 h-4 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Preview */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Live Preview</h3>
              <div
                className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 min-h-[200px]"
                style={previewStyle()}
              >
                <div className="p-6 text-center" style={{ color: textColor }}>
                  <div className={`w-16 h-16 mx-auto rounded-full mb-3 flex items-center justify-center text-2xl font-bold shadow-lg`}
                    style={{
                      background: `linear-gradient(135deg, ${textColor}20, ${textColor}10)`,
                      border: `2px solid ${textColor}40`
                    }}>
                    A
                  </div>
                  <p className={`font-bold text-lg ${fontFamily}`}>Your Name</p>
                  <p className={`text-sm opacity-80 mt-1 ${fontFamily}`}>Creator & Designer</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">Preview updates as you customize</p>
            </div>

            {/* Settings Panel */}
            <div className="space-y-4">
              {activeTab === 'template' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Choose Template</h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Free Templates</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {freeTemplates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template.id)}
                            className={`relative rounded-lg overflow-hidden border-2 transition ${
                              selectedTemplateId === template.id ? 'border-black ring-2 ring-black/20' : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <div className={`h-20 bg-gradient-to-r ${template.gradient}`} />
                            <div className="p-2 text-left">
                              <p className="text-xs font-medium">{template.name}</p>
                              <p className="text-[10px] text-gray-400">{template.category}</p>
                            </div>
                            {selectedTemplateId === template.id && (
                              <div className="absolute top-1 right-1 bg-black text-white rounded-full p-0.5">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <h4 className="text-sm font-medium text-gray-700">Premium Templates</h4>
                        {!isPremium && <span className="text-xs text-yellow-600">(Upgrade to unlock)</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {premiumTemplates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template.id)}
                            disabled={!isPremium}
                            className={`relative rounded-lg overflow-hidden border-2 transition ${
                              selectedTemplateId === template.id ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-200'
                            } ${!isPremium ? 'opacity-50 cursor-not-allowed' : 'hover:border-yellow-400'}`}
                          >
                            <div className={`h-20 bg-gradient-to-r ${template.gradient}`}>
                              {!isPremium && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <Crown className="w-6 h-6 text-yellow-400" />
                                </div>
                              )}
                            </div>
                            <div className="p-2 text-left">
                              <p className="text-xs font-medium flex items-center gap-1">
                                {template.name}
                                <Crown className="w-2.5 h-2.5 text-yellow-500" />
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'colors' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer border"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer border"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quick Colors</label>
                    <div className="flex flex-wrap gap-2">
                      {presetColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setPrimaryColor(color)}
                          className="w-8 h-8 rounded-full shadow-sm hover:scale-110 transition"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'background' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {(['color', 'gradient', 'image'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setBackgroundType(type)}
                        className={`flex-1 py-2 rounded-lg border transition ${
                          backgroundType === type ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'
                        }`}
                      >
                        {type === 'color' && 'Solid Color'}
                        {type === 'gradient' && 'Gradient'}
                        {type === 'image' && 'Image'}
                      </button>
                    ))}
                  </div>

                  {backgroundType === 'gradient' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Color</label>
                        <input
                          type="color"
                          value={gradientStart}
                          onChange={(e) => setGradientStart(e.target.value)}
                          className="w-full h-10 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Color</label>
                        <input
                          type="color"
                          value={gradientEnd}
                          onChange={(e) => setGradientEnd(e.target.value)}
                          className="w-full h-10 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {backgroundType === 'image' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Background Image URL</label>
                      <input
                        type="text"
                        value={backgroundImage}
                        onChange={(e) => setBackgroundImage(e.target.value)}
                        placeholder="/images/bg.jpg or https://example.com/image.jpg"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Enter a local path (/images/photo.jpg) or full image URL
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'font' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                  >
                    <option value="font-sans">Sans Serif (Default)</option>
                    <option value="font-serif">Serif</option>
                    <option value="font-mono">Monospace</option>
                  </select>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Preview:</p>
                    <p className={`${fontFamily} text-gray-800`}>
                      The quick brown fox jumps over the lazy dog.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setApplyTo('public')}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                applyTo === 'public'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              🌐 Apply to Public Page
            </button>
            <button
              onClick={() => setApplyTo('admin')}
              disabled={!isPremium}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                applyTo === 'admin' && isPremium
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              🛠️ Apply to Admin Panel {!isPremium && '🔒'}
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={saving}
              className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              {saving ? 'Applying...' : 'Apply Theme'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}