'use client';

import { useState, useEffect, useRef } from 'react';
import { getFreeTemplates, getPremiumTemplates, getTemplateById } from '@/lib/templates/index';
import { useBackButton } from '@/app/hooks/useBackButton';
import { Header, LivePreview, TemplatesGrid, Footer } from './template-selector';

interface TemplateSelectorModalProps {
  isPremium: boolean;
  selectedTemplate: string;
  primaryColor: string;
  textColor: string;
  fontFamily: string;
  backgroundType: string;
  gradientStart?: string;
  gradientEnd?: string;
  backgroundImage?: string;
  userName?: string;
  onClose: () => void;
  onSelectTemplate: (config: any) => Promise<boolean>;
  onUpgradeClick: () => void;
  onBack?: () => void;
  showBack?: boolean;
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

export default function TemplateSelectorModal({
  isPremium,
  selectedTemplate,
  primaryColor,
  textColor,
  fontFamily,
  backgroundType: savedBackgroundType,
  gradientStart: savedGradientStart,
  gradientEnd: savedGradientEnd,
  backgroundImage: savedBackgroundImage,
  userName = 'Your Name',
  onClose,
  onSelectTemplate,
  onUpgradeClick,
  onBack,
  showBack = false
}: TemplateSelectorModalProps) {
  const [previewTemplate, setPreviewTemplate] = useState(selectedTemplate);
  const [backgroundColor, setBackgroundColor] = useState(primaryColor);
  const [backgroundType, setBackgroundType] = useState(savedBackgroundType || 'color');
  const [gradientStart, setGradientStart] = useState(savedGradientStart || '#000000');
  const [gradientEnd, setGradientEnd] = useState(savedGradientEnd || '#ffffff');
  const [backgroundImage, setBackgroundImage] = useState(savedBackgroundImage || '');
  const [customTextColor, setCustomTextColor] = useState(textColor || '');
  const [selectedFont, setSelectedFont] = useState(fontFamily);
  const [applying, setApplying] = useState(false);
  const [applyToAll, setApplyToAll] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [inactivityTime, setInactivityTime] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const freeTemplates = getFreeTemplates();
  const premiumTemplates = getPremiumTemplates();

  const resetTimer = () => {
    setInactivityTime(0);
    setShowTimerWarning(false);
  };

  const startCountdown = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setInactivityTime(prev => {
        const newTime = prev + 1;
        if (newTime === 35) setShowTimerWarning(true);
        if (newTime >= 40) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (onBack) onBack();
          else onClose();
        }
        return newTime;
      });
    }, 1000);
  };

  const handleUserInteraction = () => resetTimer();

  useEffect(() => {
    resetTimer();
    startCountdown();
    const events = ['click', 'mousedown', 'keydown', 'touchstart', 'change', 'input'];
    events.forEach(event => window.addEventListener(event, handleUserInteraction));
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      events.forEach(event => window.removeEventListener(event, handleUserInteraction));
    };
  }, []);

  const [initialValues, setInitialValues] = useState({
    previewTemplate: selectedTemplate,
    backgroundColor: primaryColor,
    backgroundType: savedBackgroundType || 'color',
    gradientStart: savedGradientStart || '#000000',
    gradientEnd: savedGradientEnd || '#ffffff',
    backgroundImage: savedBackgroundImage || '',
    textColor: textColor || '',
    fontFamily: fontFamily,
  });

  const checkForChanges = () => {
    return backgroundColor !== initialValues.backgroundColor ||
      backgroundType !== initialValues.backgroundType ||
      gradientStart !== initialValues.gradientStart ||
      gradientEnd !== initialValues.gradientEnd ||
      backgroundImage !== initialValues.backgroundImage ||
      customTextColor !== initialValues.textColor ||
      selectedFont !== initialValues.fontFamily ||
      previewTemplate !== initialValues.previewTemplate;
  };

  useEffect(() => {
    const changed = checkForChanges();
    setHasChanges(changed);
    if (changed) resetTimer();
  }, [previewTemplate, backgroundColor, backgroundType, gradientStart, gradientEnd,
      backgroundImage, customTextColor, selectedFont]);

  const handlePhysicalBack = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (onBack) onBack();
    else onClose();
  };

  useBackButton(handlePhysicalBack, true);

  const handleClose = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onClose();
  };

  const handleBackArrow = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (hasChanges) {
      if (confirm('Exit theme editor? Changes not applied will be lost.')) {
        if (onBack) onBack();
        else onClose();
      }
    } else {
      if (onBack) onBack();
      else onClose();
    }
  };

  const handlePreviewClick = (templateId: string) => {
    resetTimer();
    setPreviewTemplate(templateId);
    const template = getTemplateById(templateId);
    setBackgroundColor(template.defaultBackground);
    setCustomTextColor(template.defaultTextColor);
    setBackgroundType('color');
    setGradientStart(template.defaultBackground);
    setGradientEnd('#ffffff');
    setBackgroundImage('');
  };

  const handleBackgroundColorChange = (color: string) => {
    resetTimer();
    setBackgroundColor(color);
  };

  const handleBackgroundTypeChange = (type: string) => {
    resetTimer();
    setBackgroundType(type);
  };

  const handleGradientStartChange = (color: string) => {
    resetTimer();
    setGradientStart(color);
  };

  const handleGradientEndChange = (color: string) => {
    resetTimer();
    setGradientEnd(color);
  };

  const handleBackgroundImageChange = (url: string) => {
    resetTimer();
    setBackgroundImage(url);
  };

  const handleTextColorChange = (color: string) => {
    resetTimer();
    setCustomTextColor(color);
  };

  const handleFontChange = (font: string) => {
    resetTimer();
    setSelectedFont(font);
  };

  const getBaseConfig = () => {
    const template = getTemplateById(previewTemplate);
    const config: any = { templateId: previewTemplate, fontFamily: selectedFont };
    config.backgroundType = backgroundType;
    config.primaryColor = backgroundColor;
    if (customTextColor && customTextColor !== template.defaultTextColor) config.textColor = customTextColor;
    if (backgroundType === 'gradient') {
      config.gradientStart = gradientStart;
      config.gradientEnd = gradientEnd;
    } else if (backgroundType === 'image' && backgroundImage) {
      config.backgroundImage = backgroundImage;
    }
    return config;
  };

  const handleApplyToPublic = async () => {
    resetTimer();
    const template = getTemplateById(previewTemplate);
    if (template.isPremium && !isPremium) { onUpgradeClick(); return; }
    setApplying(true);
    await onSelectTemplate({ ...getBaseConfig(), target: 'public' });
    setApplying(false);
    setInitialValues({
      previewTemplate, backgroundColor, backgroundType, gradientStart, gradientEnd,
      backgroundImage, textColor: customTextColor, fontFamily: selectedFont,
    });
  };

  const handleApplyToAdmin = async () => {
    resetTimer();
    if (!isPremium) { onUpgradeClick(); return; }
    setApplying(true);
    await onSelectTemplate({ ...getBaseConfig(), target: 'admin' });
    setApplying(false);
    setInitialValues({
      previewTemplate, backgroundColor, backgroundType, gradientStart, gradientEnd,
      backgroundImage, textColor: customTextColor, fontFamily: selectedFont,
    });
  };

  const handleApplyToBoth = async () => {
    const template = getTemplateById(previewTemplate);
    if (template.isPremium && !isPremium) { onUpgradeClick(); return; }
    if (!isPremium) {
      alert('✨ Upgrade to Premium to apply themes to both pages! Only Public page will be updated.');
      setApplying(true);
      await onSelectTemplate({ ...getBaseConfig(), target: 'public' });
      setApplying(false);
      setInitialValues({
        previewTemplate, backgroundColor, backgroundType, gradientStart, gradientEnd,
        backgroundImage, textColor: customTextColor, fontFamily: selectedFont,
      });
      return;
    }
    setApplying(true);
    await onSelectTemplate({ ...getBaseConfig(), target: 'public' });
    await onSelectTemplate({ ...getBaseConfig(), target: 'admin' });
    setApplying(false);
    setInitialValues({
      previewTemplate, backgroundColor, backgroundType, gradientStart, gradientEnd,
      backgroundImage, textColor: customTextColor, fontFamily: selectedFont,
    });
  };

  const getPreviewStyle = () => {
    const template = getTemplateById(previewTemplate);
    const style: React.CSSProperties = {};

    if (backgroundType === 'color') {
      style.backgroundColor = backgroundColor;
    } else if (backgroundType === 'gradient') {
      style.background = `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`;
    } else if (backgroundType === 'image' && backgroundImage) {
      style.backgroundImage = `url(${backgroundImage})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
    } else {
      style.background = getGradientCSS(template.gradient);
    }

    style.minHeight = '160px';
    style.borderRadius = '12px';
    style.padding = '16px';
    style.transition = 'all 0.3s ease';

    return style;
  };

  const getPreviewTextColor = () => {
    if (customTextColor) return customTextColor;
    const template = getTemplateById(previewTemplate);
    return template.defaultTextColor;
  };

  const getPreviewFont = () => selectedFont;

  const secondsRemaining = Math.max(0, 40 - inactivityTime);
  const progressPercent = (secondsRemaining / 40) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-xl w-full max-w-lg mx-auto flex flex-col max-h-[85vh]">
        <Header applyToAll={applyToAll} setApplyToAll={setApplyToAll} onClose={handleClose} onBack={handleBackArrow} showBack={showBack} />

        {/* Timer */}
        <div className="sticky top-0 z-10 bg-white px-4 pt-2 pb-1">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>⏱️ Auto-close</span>
            <span className={secondsRemaining < 10 ? 'text-red-500 font-bold' : ''}>{secondsRemaining}s remaining</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full transition ${secondsRemaining < 10 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {showTimerWarning && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-xs mx-4 rounded sticky top-[60px] z-10">
            ⏰ Closing in {secondsRemaining}s...
          </div>
        )}

        {/* Live Preview */}
        <div className="sticky top-[72px] z-10 bg-white p-3 border-b">
          <LivePreview getPreviewStyle={getPreviewStyle} getPreviewTextColor={getPreviewTextColor} getPreviewFont={getPreviewFont} userName={userName} />
        </div>

        {/* Templates Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 pt-0">
          <TemplatesGrid freeTemplates={freeTemplates} premiumTemplates={premiumTemplates} previewTemplate={previewTemplate} isPremium={isPremium} onPreviewClick={handlePreviewClick} />
        </div>

        {/* Ultra Compact Customization */}
        <div className="sticky bottom-0 bg-white border-t p-2">
          <div className="flex items-center gap-1 flex-wrap">
            {/* Background Type */}
            <div className="flex gap-0.5">
              <button onClick={() => setBackgroundType('color')} className={`w-6 h-6 rounded text-xs ${backgroundType === 'color' ? 'bg-black text-white' : 'bg-gray-100'}`}>🎨</button>
              <button onClick={() => isPremium && setBackgroundType('gradient')} disabled={!isPremium} className={`w-6 h-6 rounded text-xs ${backgroundType === 'gradient' ? 'bg-black text-white' : 'bg-gray-100'} ${!isPremium ? 'opacity-40' : ''}`}>🌈</button>
              <button onClick={() => isPremium && setBackgroundType('image')} disabled={!isPremium} className={`w-6 h-6 rounded text-xs ${backgroundType === 'image' ? 'bg-black text-white' : 'bg-gray-100'} ${!isPremium ? 'opacity-40' : ''}`}>🖼️</button>
            </div>

            {/* Background Value */}
            {backgroundType === 'color' && (
              <input type="color" value={backgroundColor} onChange={(e) => handleBackgroundColorChange(e.target.value)} className="w-7 h-6 rounded border" />
            )}
            {backgroundType === 'gradient' && isPremium && (
              <div className="flex gap-0.5">
                <input type="color" value={gradientStart} onChange={(e) => handleGradientStartChange(e.target.value)} className="w-6 h-6 rounded border" />
                <span className="text-xs">→</span>
                <input type="color" value={gradientEnd} onChange={(e) => handleGradientEndChange(e.target.value)} className="w-6 h-6 rounded border" />
              </div>
            )}
            {backgroundType === 'image' && isPremium && (
              <input type="url" placeholder="URL" value={backgroundImage} onChange={(e) => handleBackgroundImageChange(e.target.value)} className="flex-1 min-w-0 px-1 py-0.5 border rounded text-xs" />
            )}

            {/* Text Color */}
            <input type="color" value={customTextColor} onChange={(e) => handleTextColorChange(e.target.value)} disabled={!isPremium} className={`w-6 h-6 rounded border ${!isPremium ? 'opacity-40' : ''}`} />

            {/* Font Selector */}
            <div className="flex gap-0.5">
              <button onClick={() => handleFontChange('font-sans')} className={`w-7 h-6 rounded text-xs ${selectedFont === 'font-sans' ? 'bg-black text-white' : 'bg-gray-100'}`}>Sa</button>
              <button onClick={() => handleFontChange('font-serif')} className={`w-7 h-6 rounded text-xs ${selectedFont === 'font-serif' ? 'bg-black text-white' : 'bg-gray-100'}`}>Se</button>
              <button onClick={() => handleFontChange('font-mono')} className={`w-7 h-6 rounded text-xs ${selectedFont === 'font-mono' ? 'bg-black text-white' : 'bg-gray-100'}`}>Mo</button>
            </div>
          </div>

          {/* Apply Buttons */}
          <div className="flex gap-2 mt-2">
            {applyToAll ? (
              <button onClick={handleApplyToBoth} disabled={applying} className="flex-1 py-1.5 bg-black text-white rounded text-xs font-medium">{applying ? '...' : 'Apply to Both'}</button>
            ) : (
              <>
                <button onClick={handleApplyToPublic} disabled={applying} className="flex-1 py-1.5 bg-green-600 text-white rounded text-xs font-medium">Public</button>
                <button onClick={handleApplyToAdmin} disabled={applying || !isPremium} className={`flex-1 py-1.5 rounded text-xs font-medium ${isPremium ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>Admin {!isPremium && '🔒'}</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}