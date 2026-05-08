// app/components/dashboard/AppearanceTab.tsx
'use client';

import { useState } from 'react';
import { Palette, LayoutDashboard, Crown, Check, Type, Image as ImageIcon, Save, RefreshCw } from 'lucide-react';
import { templates } from '@/lib/templates/index';

interface AppearanceTabProps {
  portalData: any;
  applyTarget: 'public' | 'admin';
  setApplyTarget: (target: 'public' | 'admin') => void;
  templateId: string;
  setTemplateId: (id: string) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  backgroundType: 'color' | 'gradient' | 'image';
  setBackgroundType: (type: 'color' | 'gradient' | 'image') => void;
  gradientStart: string;
  setGradientStart: (color: string) => void;
  gradientEnd: string;
  setGradientEnd: (color: string) => void;
  backgroundImage: string;
  setBackgroundImage: (url: string) => void;
  savingAppearance: boolean;
  onSaveAppearance: () => void;
  onUploadImage: (file: File) => Promise<void>;
}

const quickColors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c'];

export default function AppearanceTab({
  portalData, applyTarget, setApplyTarget, templateId, setTemplateId, primaryColor, setPrimaryColor, textColor, setTextColor,
  fontFamily, setFontFamily, backgroundType, setBackgroundType, gradientStart, setGradientStart, gradientEnd, setGradientEnd,
  backgroundImage, setBackgroundImage, savingAppearance, onSaveAppearance, onUploadImage
}: AppearanceTabProps) {
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    await onUploadImage(file);
    setUploadingImage(false);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 sm:p-6">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Palette className="w-5 h-5" /> Theme Studio</h3>

      <div className="space-y-5 sm:space-y-6">
        {/* Apply Target */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Apply Theme To</label>
          <div className="flex gap-2 sm:gap-3">
            <button onClick={() => setApplyTarget('public')} className={`flex-1 py-2 rounded-lg border transition text-sm ${applyTarget === 'public' ? 'bg-green-600 text-white border-green-600' : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'}`}>🌐 Public</button>
            <button onClick={() => setApplyTarget('admin')} disabled={!portalData?.isPremium} className={`flex-1 py-2 rounded-lg border transition text-sm ${applyTarget === 'admin' && portalData?.isPremium ? 'bg-purple-600 text-white border-purple-600' : portalData?.isPremium ? 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20' : 'bg-white/5 text-white/30 cursor-not-allowed border-white/10'}`}>🛠️ Admin {!portalData?.isPremium && '🔒'}</button>
          </div>
        </div>

        {/* Templates */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2"><LayoutDashboard className="w-4 h-4 inline mr-2" /> Template</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {templates.map((template) => (
              <button key={template.id} onClick={() => { setTemplateId(template.id); setGradientStart(template.gradientColors.start); setGradientEnd(template.gradientColors.end); setTextColor(template.defaultTextColor); setBackgroundType('gradient'); }} className={`relative rounded-lg overflow-hidden border-2 transition ${templateId === template.id ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-white/20 hover:border-white/40'} ${template.isPremium && !portalData?.isPremium ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={template.isPremium && !portalData?.isPremium}>
                <div className={`h-12 sm:h-16 bg-gradient-to-r ${template.gradient}`} />
                <div className="p-1 sm:p-2 text-left bg-black/30"><p className="text-xs font-medium text-white truncate">{template.name}</p></div>
                {template.isPremium && <div className="absolute top-1 right-1"><Crown className="w-2 h-2 sm:w-3 sm:h-3 text-yellow-400" /></div>}
                {templateId === template.id && <div className="absolute top-1 left-1 bg-purple-500 text-white rounded-full p-0.5"><Check className="w-2 h-2 sm:w-3 sm:h-3" /></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="pt-4 border-t border-white/20">
          <h4 className="font-medium text-white mb-3"><Palette className="w-4 h-4 inline mr-2" /> Colors</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-white/70 mb-1">Primary</label><div className="flex items-center gap-2"><input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-white/20" /><input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white" /></div></div>
            <div><label className="block text-sm font-medium text-white/70 mb-1">Text</label><div className="flex items-center gap-2"><input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-white/20" /><input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white" /></div></div>
          </div>
          <div className="mt-3"><label className="block text-sm font-medium text-white/70 mb-1">Quick Colors</label><div className="flex gap-2 flex-wrap">{quickColors.map(color => (<button key={color} onClick={() => setPrimaryColor(color)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-sm hover:scale-110 transition" style={{ backgroundColor: color }} />))}</div></div>
        </div>

        {/* Background */}
        <div className="pt-4 border-t border-white/20">
          <h4 className="font-medium text-white mb-3"><ImageIcon className="w-4 h-4 inline mr-2" /> Background</h4>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setBackgroundType('color')} className={`flex-1 py-2 rounded-lg border transition text-xs sm:text-sm ${backgroundType === 'color' ? 'bg-white/20 text-white border-white/30' : 'bg-white/5 text-white/60 border-white/20 hover:bg-white/10'}`}>🎨 Solid</button>
            <button onClick={() => setBackgroundType('gradient')} className={`flex-1 py-2 rounded-lg border transition text-xs sm:text-sm ${backgroundType === 'gradient' ? 'bg-white/20 text-white border-white/30' : 'bg-white/5 text-white/60 border-white/20 hover:bg-white/10'}`}>🌈 Gradient</button>
            <button onClick={() => setBackgroundType('image')} className={`flex-1 py-2 rounded-lg border transition text-xs sm:text-sm ${backgroundType === 'image' ? 'bg-white/20 text-white border-white/30' : 'bg-white/5 text-white/60 border-white/20 hover:bg-white/10'}`}>🖼️ Image</button>
          </div>
          {backgroundType === 'gradient' && (<div className="grid grid-cols-2 gap-3"><div><label className="block text-xs text-white/50 mb-1">Start</label><input type="color" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" /></div><div><label className="block text-xs text-white/50 mb-1">End</label><input type="color" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" /></div></div>)}
          {backgroundType === 'image' && (<div><div className="flex flex-col sm:flex-row gap-2"><input type="text" value={backgroundImage} onChange={(e) => setBackgroundImage(e.target.value)} placeholder="Image URL" className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white" /><div className="flex gap-2"><button onClick={() => setBackgroundImage(`https://picsum.photos/id/${Math.floor(Math.random() * 100)}/1920/1080`)} className="px-3 py-2 bg-white/10 rounded-lg text-sm text-white hover:bg-white/20 transition">🎲 Random</button><button onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) handleImageUpload(file); }; input.click(); }} className="px-3 py-2 bg-white/10 rounded-lg text-sm text-white hover:bg-white/20 transition">📁 Upload</button></div></div>{uploadingImage && <div className="text-sm text-white/50 mt-2">Uploading...</div>}{backgroundImage && backgroundImage !== '/images/default-bg.jpg' && (<div className="mt-2 relative w-full h-28 sm:h-32 rounded-lg overflow-hidden border border-white/20"><img src={backgroundImage} alt="Preview" className="w-full h-full object-cover" /><button onClick={() => setBackgroundImage('')} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs">✕</button></div>)}</div>)}
        </div>

        {/* Font */}
        <div className="pt-4 border-t border-white/20">
          <h4 className="font-medium text-white mb-3"><Type className="w-4 h-4 inline mr-2" /> Font</h4>
          <div className="flex gap-2">{['font-sans', 'font-serif', 'font-mono'].map(font => (<button key={font} onClick={() => setFontFamily(font)} className={`flex-1 py-2 rounded-lg border transition text-xs sm:text-sm ${fontFamily === font ? 'bg-white/20 text-white border-white/30' : 'bg-white/5 text-white/60 border-white/20 hover:bg-white/10'}`}><div className={font}>{font === 'font-sans' ? 'Sans' : font === 'font-serif' ? 'Serif' : 'Mono'}</div></button>))}</div>
        </div>

        {/* Live Preview */}
        <div className="pt-4 border-t border-white/20">
          <h4 className="font-medium text-white mb-3">Live Preview</h4>
          <div className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 p-4 sm:p-6 text-center" style={{ ...(backgroundType === 'color' && { backgroundColor: primaryColor }), ...(backgroundType === 'gradient' && { background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` }), ...(backgroundType === 'image' && backgroundImage && { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }), color: textColor }}>
            <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full mb-3 flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg`} style={{ background: `linear-gradient(135deg, ${textColor}20, ${textColor}10)`, border: `2px solid ${textColor}40` }}>{portalData?.displayName?.charAt(0).toUpperCase() || 'A'}</div>
            <p className={`font-bold text-base sm:text-lg ${fontFamily}`}>{portalData?.displayName || portalData?.title || 'Your Name'}</p>
            <p className={`text-xs sm:text-sm opacity-80 mt-1 ${fontFamily}`}>Creator & Designer</p>
            <div className="flex justify-center gap-3 sm:gap-4 mt-3 text-xs opacity-60"><span>📸 1.2K</span><span>▶️ 5.6K</span><span>💬 342</span></div>
          </div>
        </div>

        {/* Save Button */}
        <button onClick={onSaveAppearance} disabled={savingAppearance} className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base">
          {savingAppearance ? (<><RefreshCw className="w-4 h-4 animate-spin" />Saving...</>) : (<><Save className="w-4 h-4" />Save Theme</>)}
        </button>
      </div>
    </div>
  );
}