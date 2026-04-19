// app/components/TemplateSelectorModal.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getFreeTemplates, getPremiumTemplates, getTemplateById } from '@/lib/templates/index';
import { useBackButton } from '@/app/hooks/useBackButton';
import { Crown, Layers, RotateCcw, Sparkles, Palette, Type, Image as ImageIcon, Sun, Check, FolderOpen, Lock } from 'lucide-react';

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
  useSeparateStyle?: boolean;
  onStyleModeChange?: (useSeparate: boolean) => void;
}

interface PublicImage {
  name: string;
  url: string;
  size: number;
}

// Preset gradients for quick selection
const presetGradients = [
  { name: 'Sunset', start: '#e11d48', end: '#facc15' },
  { name: 'Ocean', start: '#2563eb', end: '#67e8f9' },
  { name: 'Purple Haze', start: '#9333ea', end: '#f472b6' },
  { name: 'Forest', start: '#16a34a', end: '#6ee7b7' },
  { name: 'Midnight', start: '#111827', end: '#4c1d95' },
  { name: 'Cotton Candy', start: '#ec4899', end: '#fde047' },
];

// Default settings for reset
const DEFAULT_SETTINGS = {
  templateId: 'template1',
  primaryColor: '#f5f5f5',
  textColor: '#1a1a1a',
  fontFamily: 'font-sans',
  backgroundType: 'image',
  gradientStart: '#fb923c',
  gradientEnd: '#fde047',
  backgroundImage: '/images/default-bg.jpg'
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
  showBack = false,
  useSeparateStyle = false,
  onStyleModeChange
}: TemplateSelectorModalProps) {
  const [previewTemplate, setPreviewTemplate] = useState(selectedTemplate);
  const [backgroundColor, setBackgroundColor] = useState(primaryColor);
  const [backgroundType, setBackgroundType] = useState(savedBackgroundType || 'image');
  const [gradientStart, setGradientStart] = useState(savedGradientStart || '#fb923c');
  const [gradientEnd, setGradientEnd] = useState(savedGradientEnd || '#fde047');
  const [backgroundImage, setBackgroundImage] = useState(savedBackgroundImage || '/images/default-bg.jpg');
  const [customTextColor, setCustomTextColor] = useState(textColor || '#1a1a1a');
  const [selectedFont, setSelectedFont] = useState(fontFamily);
  const [applying, setApplying] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [inactivityTime, setInactivityTime] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'background' | 'text'>('background');
  const [localUseSeparateStyle, setLocalUseSeparateStyle] = useState(useSeparateStyle);
  const [publicImages, setPublicImages] = useState<PublicImage[]>([]);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [imageSearchTerm, setImageSearchTerm] = useState('');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isClosingRef = useRef(false);

  const freeTemplates = getFreeTemplates();
  const premiumTemplates = getPremiumTemplates();

  const presetColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c'
  ];

  // Load public images
  useEffect(() => {
    fetch('/api/images/list')
      .then(res => res.json())
      .then(data => {
        if (data.images) {
          setPublicImages(data.images);
        }
      })
      .catch(console.error);
  }, []);

  // Filter images based on search
  const filteredImages = publicImages.filter(img =>
    img.name.toLowerCase().includes(imageSearchTerm.toLowerCase())
  );

  const safeClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (onBack) {
      onBack();
    } else {
      onClose();
    }
  }, [onBack, onClose]);

  const resetAndRestartTimer = useCallback(() => {
    if (isClosingRef.current) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setInactivityTime(0);
    setShowTimerWarning(false);

    intervalRef.current = setInterval(() => {
      setInactivityTime(prev => {
        const newTime = prev + 1;
        if (newTime === 35) setShowTimerWarning(true);
        if (newTime >= 40) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => safeClose(), 0);
        }
        return newTime;
      });
    }, 1000);
  }, [safeClose]);

  const handleUserInteraction = useCallback(() => {
    if (!isClosingRef.current) {
      resetAndRestartTimer();
    }
  }, [resetAndRestartTimer]);

  useEffect(() => {
    resetAndRestartTimer();
    const events = ['click', 'mousedown', 'keydown', 'touchstart', 'change', 'input', 'mousemove'];
    events.forEach(event => window.addEventListener(event, handleUserInteraction));
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      events.forEach(event => window.removeEventListener(event, handleUserInteraction));
    };
  }, [resetAndRestartTimer, handleUserInteraction]);

  const [initialValues, setInitialValues] = useState({
    previewTemplate: selectedTemplate,
    backgroundColor: primaryColor,
    backgroundType: savedBackgroundType || 'image',
    gradientStart: savedGradientStart || '#fb923c',
    gradientEnd: savedGradientEnd || '#fde047',
    backgroundImage: savedBackgroundImage || '/images/default-bg.jpg',
    textColor: textColor || '#1a1a1a',
    fontFamily: fontFamily,
  });

  const checkForChanges = useCallback(() => {
    return backgroundColor !== initialValues.backgroundColor ||
      backgroundType !== initialValues.backgroundType ||
      gradientStart !== initialValues.gradientStart ||
      gradientEnd !== initialValues.gradientEnd ||
      backgroundImage !== initialValues.backgroundImage ||
      customTextColor !== initialValues.textColor ||
      selectedFont !== initialValues.fontFamily ||
      previewTemplate !== initialValues.previewTemplate;
  }, [backgroundColor, backgroundType, gradientStart, gradientEnd, backgroundImage,
      customTextColor, selectedFont, previewTemplate, initialValues]);

  useEffect(() => {
    const changed = checkForChanges();
    setHasChanges(changed);
    if (changed) handleUserInteraction();
  }, [previewTemplate, backgroundColor, backgroundType, gradientStart, gradientEnd,
      backgroundImage, customTextColor, selectedFont, checkForChanges, handleUserInteraction]);

  const handlePhysicalBack = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (onBack) onBack();
    else onClose();
  }, [onBack, onClose]);

  useBackButton(handlePhysicalBack, true);

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    onClose();
  }, [onClose]);

  const handleBackArrow = useCallback(() => {
    if (isClosingRef.current) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (hasChanges) {
      if (confirm('Exit theme editor? Changes not applied will be lost.')) {
        isClosingRef.current = true;
        if (onBack) onBack();
        else onClose();
      } else {
        resetAndRestartTimer();
      }
    } else {
      isClosingRef.current = true;
      if (onBack) onBack();
      else onClose();
    }
  }, [hasChanges, onBack, onClose, resetAndRestartTimer]);

  const handlePreviewClick = (templateId: string) => {
    handleUserInteraction();
    const template = getTemplateById(templateId);
    setPreviewTemplate(templateId);
    setBackgroundType('gradient');
    setGradientStart(template.gradientColors.start);
    setGradientEnd(template.gradientColors.end);
    setCustomTextColor(template.defaultTextColor);
    setBackgroundColor(template.defaultBackground);
    setBackgroundImage('');
  };

  const resetToDefault = async () => {
    handleUserInteraction();

    const defaultTemplate = getTemplateById('template1');

    setPreviewTemplate('template1');
    setBackgroundType('image');
    setGradientStart(defaultTemplate.gradientColors.start);
    setGradientEnd(defaultTemplate.gradientColors.end);
    setCustomTextColor(defaultTemplate.defaultTextColor);
    setBackgroundColor(defaultTemplate.defaultBackground);
    setBackgroundImage('/images/default-bg.jpg');
    setSelectedFont('font-sans');

    setApplying(true);

    const config: any = {
      target: 'public',
      templateId: 'template1',
      fontFamily: 'font-sans',
      backgroundType: 'image',
      textColor: defaultTemplate.defaultTextColor,
      backgroundImage: '/images/default-bg.jpg',
      primaryColor: '',
      gradientStart: '',
      gradientEnd: '',
    };

    await onSelectTemplate(config);

    if (localUseSeparateStyle) {
      const adminConfig = { ...config, target: 'admin' };
      await onSelectTemplate(adminConfig);
    }

    setApplying(false);

    setInitialValues({
      previewTemplate: 'template1',
      backgroundColor: defaultTemplate.defaultBackground,
      backgroundType: 'image',
      gradientStart: defaultTemplate.gradientColors.start,
      gradientEnd: defaultTemplate.gradientColors.end,
      backgroundImage: '/images/default-bg.jpg',
      textColor: defaultTemplate.defaultTextColor,
      fontFamily: 'font-sans',
    });

    setShowResetConfirm(false);
  };

  const getConfig = () => {
    let finalBackgroundImage = backgroundImage;

    if (backgroundType === 'image' && backgroundImage &&
        !backgroundImage.startsWith('http') &&
        !backgroundImage.startsWith('/') &&
        !backgroundImage.startsWith('data:')) {
      finalBackgroundImage = `/images/${backgroundImage}`;
    }

    const config: any = {
      templateId: previewTemplate,
      fontFamily: selectedFont,
      backgroundType: backgroundType,
      textColor: customTextColor,
    };

    if (backgroundType === 'color') {
      config.primaryColor = backgroundColor;
      config.backgroundImage = '';
      config.gradientStart = '';
      config.gradientEnd = '';
    } else if (backgroundType === 'gradient') {
      config.gradientStart = gradientStart;
      config.gradientEnd = gradientEnd;
      config.primaryColor = '';
      config.backgroundImage = '';
    } else if (backgroundType === 'image') {
      config.backgroundImage = finalBackgroundImage;
      config.primaryColor = '';
      config.gradientStart = '';
      config.gradientEnd = '';
    }

    return config;
  };

  const applyToPublic = async () => {
    handleUserInteraction();
    setApplying(true);
    const config = getConfig();
    await onSelectTemplate({ ...config, target: 'public' });
    setApplying(false);
    setInitialValues({
      previewTemplate, backgroundColor, backgroundType, gradientStart, gradientEnd,
      backgroundImage, textColor: customTextColor, fontFamily: selectedFont,
    });
  };

  const applyToAdmin = async () => {
    if (!isPremium) {
      alert('✨ Admin panel customization is a premium feature. Please upgrade!');
      return;
    }
    handleUserInteraction();
    setApplying(true);
    const config = getConfig();
    await onSelectTemplate({ ...config, target: 'admin' });
    setApplying(false);
    setInitialValues({
      previewTemplate, backgroundColor, backgroundType, gradientStart, gradientEnd,
      backgroundImage, textColor: customTextColor, fontFamily: selectedFont,
    });
  };

  const getPreviewStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      minHeight: '180px',
      borderRadius: '12px',
      padding: '20px',
      transition: 'all 0.3s ease',
    };

    if (backgroundType === 'color') {
      style.backgroundColor = backgroundColor;
    } else if (backgroundType === 'gradient') {
      style.background = `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`;
    } else if (backgroundType === 'image' && backgroundImage) {
      style.backgroundImage = `url(${backgroundImage})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
    } else {
      const template = getTemplateById(previewTemplate);
      style.background = `linear-gradient(135deg, ${template.gradientColors.start}, ${template.gradientColors.end})`;
    }

    return style;
  };

  const getPreviewTextColor = () => customTextColor;
  const getPreviewFont = () => selectedFont;

  const secondsRemaining = Math.max(0, 40 - inactivityTime);
  const progressPercent = (inactivityTime / 40) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl mx-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white rounded-t-xl border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showBack && (
                <button onClick={handleBackArrow} className="p-1 hover:bg-gray-100 rounded-full transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Theme Studio</h3>
                <p className="text-xs text-gray-400">Customize your page appearance</p>
              </div>
            </div>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-red-50 text-red-600 hover:bg-red-100 transition"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>



        {/* Timer Bar */}
        <div className="sticky top-[57px] z-20 bg-white px-4 pt-1 pb-2">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>⏱️ Auto-save & close</span>
            <span className={secondsRemaining < 10 ? 'text-red-500 font-bold' : ''}>{secondsRemaining}s remaining</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className={`h-1 rounded-full transition-all duration-300 ${secondsRemaining < 10 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {showTimerWarning && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-xs mx-4 rounded">
            ⏰ Closing in {secondsRemaining} seconds due to inactivity...
          </div>
        )}

        {/* Main Content - Two Columns */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Live Preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <h4 className="text-sm font-semibold text-gray-700">Live Preview</h4>
              </div>
              <div
                className="rounded-xl overflow-hidden shadow-lg transition-all duration-300"
                style={getPreviewStyle()}
              >
                <div className="p-4 text-center" style={{ color: getPreviewTextColor() }}>
                  <div className={`w-16 h-16 mx-auto rounded-full mb-3 flex items-center justify-center text-2xl font-bold shadow-lg`}
                    style={{
                      background: `linear-gradient(135deg, ${getPreviewTextColor()}20, ${getPreviewTextColor()}10)`,
                      border: `2px solid ${getPreviewTextColor()}40`
                    }}>
                    {userName?.charAt(0).toUpperCase() || '👤'}
                  </div>
                  <p className={`font-bold text-lg ${getPreviewFont()}`}>{userName}</p>
                  <p className={`text-sm opacity-80 mt-1 ${getPreviewFont()}`}>Creator & Designer</p>
                  <div className="flex justify-center gap-4 mt-3 text-xs opacity-60">
                    <span>📸 1.2K</span>
                    <span>▶️ 5.6K</span>
                    <span>💬 342</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 text-center">Preview updates as you customize</p>
            </div>

            {/* Right Column - Templates */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                <h4 className="text-sm font-semibold text-gray-700">Choose Template</h4>
              </div>

              <div className="max-h-[280px] overflow-y-auto space-y-4 pr-1">
                {/* Free Templates */}
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Sun className="w-3 h-3 text-green-500" />
                    <span className="text-xs font-medium text-gray-600">Free Templates</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {freeTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handlePreviewClick(template.id)}
                        className={`group rounded-lg overflow-hidden border transition-all ${
                          previewTemplate === template.id ? 'ring-2 ring-purple-500 border-purple-500' : 'hover:shadow-md'
                        }`}
                      >
                        <div
                          className="h-16 rounded-t-lg"
                          style={{ background: `linear-gradient(135deg, ${template.gradientColors.start}, ${template.gradientColors.end})` }}
                        />
                        <div className="p-1.5 text-left bg-white">
                          <p className="text-xs font-medium truncate">{template.name}</p>
                          <p className="text-[10px] text-gray-400">{template.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Premium Templates - Locked for non-premium */}
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Crown className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs font-medium text-gray-600">Premium Collection</span>
                    {!isPremium && <Lock className="w-3 h-3 text-gray-400" />}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {premiumTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => isPremium && handlePreviewClick(template.id)}
                        className={`group rounded-lg overflow-hidden border transition-all relative ${
                          previewTemplate === template.id ? 'ring-2 ring-yellow-500 border-yellow-500' : ''
                        }`}
                      >
                        <div
                          className="h-16 rounded-t-lg"
                          style={{ background: `linear-gradient(135deg, ${template.gradientColors.start}, ${template.gradientColors.end})` }}
                        />
                        <div className="p-1.5 text-left bg-white">
                          <p className="text-xs font-medium truncate flex items-center gap-1">
                            {template.name}
                            <Crown className="w-2.5 h-2.5 text-yellow-500" />
                          </p>
                        </div>
                        {!isPremium && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); onUpgradeClick(); }}
                              className="text-[10px] text-white bg-yellow-500 px-2 py-1 rounded-full hover:bg-yellow-600 transition"
                            >
                              Upgrade
                            </button>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customization Tabs */}
          <div className="mt-5 pt-4 border-t">
            <div className="flex gap-1 mb-3">
              <button
                onClick={() => setActiveTab('background')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                  activeTab === 'background' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Background
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                  activeTab === 'text' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Type className="w-4 h-4" />
                Text & Font
              </button>
            </div>

            {/* Background Tab */}
            {activeTab === 'background' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setBackgroundType('gradient')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                      backgroundType === 'gradient' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    🌈 Gradient
                  </button>
                  <button
                    onClick={() => setBackgroundType('color')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                      backgroundType === 'color' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    🎨 Solid Color
                  </button>
                  <button
                    onClick={() => setBackgroundType('image')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                      backgroundType === 'image' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    🖼️ Image
                  </button>
                </div>

                {backgroundType === 'gradient' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Custom Gradient</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={gradientStart}
                          onChange={(e) => setGradientStart(e.target.value)}
                          className="w-12 h-10 rounded-lg border cursor-pointer"
                        />
                        <span className="flex items-center text-gray-400">→</span>
                        <input
                          type="color"
                          value={gradientEnd}
                          onChange={(e) => setGradientEnd(e.target.value)}
                          className="w-12 h-10 rounded-lg border cursor-pointer"
                        />
                        <div
                          className="flex-1 h-10 rounded-lg"
                          style={{ background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Quick Presets</label>
                      <div className="flex gap-2 flex-wrap">
                        {presetGradients.map((gradient, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setGradientStart(gradient.start);
                              setGradientEnd(gradient.end);
                            }}
                            className="w-10 h-10 rounded-lg shadow-sm hover:scale-105 transition"
                            style={{ background: `linear-gradient(135deg, ${gradient.start}, ${gradient.end})` }}
                            title={gradient.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {backgroundType === 'color' && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Select Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {presetColors.map((color, idx) => (
                        <button
                          key={idx}
                          onClick={() => setBackgroundColor(color)}
                          className={`w-8 h-8 rounded-full shadow-sm hover:scale-110 transition ${
                            backgroundColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-full mt-2 h-10 rounded-lg border"
                    />
                  </div>
                )}

                {backgroundType === 'image' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Image URL or Name</label>
                      <input
                        type="text"
                        placeholder="/images/your-image.jpg or https://example.com/image.jpg"
                        value={backgroundImage}
                        onChange={(e) => setBackgroundImage(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        💡 Tip: Just type image filename (e.g., "default-bg.jpg") or full URL
                      </p>
                    </div>

                    <button
                      onClick={() => setShowImageSelector(!showImageSelector)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition"
                    >
                      <FolderOpen className="w-4 h-4" />
                      {showImageSelector ? 'Hide' : 'Browse'} Public Images
                    </button>

                    {showImageSelector && (
                      <div className="border rounded-lg p-2">
                        <input
                          type="text"
                          placeholder="Search images..."
                          value={imageSearchTerm}
                          onChange={(e) => setImageSearchTerm(e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm mb-2"
                        />
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {filteredImages.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-2">
                              No images found in /public/images folder
                            </p>
                          ) : (
                            filteredImages.map((img) => (
                              <button
                                key={img.name}
                                onClick={() => {
                                  setBackgroundImage(img.url);
                                  setShowImageSelector(false);
                                  setImageSearchTerm('');
                                }}
                                className={`w-full flex items-center gap-2 p-2 rounded text-left hover:bg-gray-50 transition ${
                                  backgroundImage === img.url ? 'bg-purple-50 ring-1 ring-purple-500' : ''
                                }`}
                              >
                                <img src={img.url} alt={img.name} className="w-8 h-8 rounded object-cover" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{img.name}</p>
                                  <p className="text-[10px] text-gray-400">
                                    {(img.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                                {backgroundImage === img.url && (
                                  <Check className="w-4 h-4 text-purple-500" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {backgroundImage && backgroundImage.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) && (
                      <div className="mt-2">
                        <label className="text-xs text-gray-500 mb-1 block">Preview</label>
                        <img
                          src={backgroundImage}
                          alt="Background preview"
                          className="w-full h-24 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/400x200?text=Invalid+Image';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Text & Font Tab */}
            {activeTab === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Text Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={customTextColor}
                      onChange={(e) => setCustomTextColor(e.target.value)}
                      className="w-12 h-10 rounded-lg border cursor-pointer"
                    />
                    <div
                      className="flex-1 h-10 rounded-lg px-3 flex items-center"
                      style={{ backgroundColor: customTextColor, color: '#fff' }}
                    >
                      <span className="text-sm">Sample Text</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Font Family</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedFont('font-sans')}
                      className={`flex-1 py-2 rounded-lg text-sm transition ${
                        selectedFont === 'font-sans' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <span className="font-sans">Sans Serif</span>
                    </button>
                    <button
                      onClick={() => setSelectedFont('font-serif')}
                      className={`flex-1 py-2 rounded-lg text-sm transition ${
                        selectedFont === 'font-serif' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <span className="font-serif">Serif</span>
                    </button>
                    <button
                      onClick={() => setSelectedFont('font-mono')}
                      className={`flex-1 py-2 rounded-lg text-sm transition ${
                        selectedFont === 'font-mono' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <span className="font-mono">Mono</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Simple Two Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-3 rounded-b-xl">
          <div className="flex gap-3">
            <button
              onClick={applyToPublic}
              disabled={applying}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {applying ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Apply to Public
                </>
              )}
            </button>
            <button
              onClick={applyToAdmin}
              disabled={applying || !isPremium}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                isPremium
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {applying ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Palette className="w-4 h-4" />
                  Apply to Admin {!isPremium && '🔒'}
                </>
              )}
            </button>
          </div>
          {!isPremium && (
            <p className="text-[10px] text-gray-400 text-center mt-2">
              ✨ Upgrade to Premium to customize your admin panel separately
            </p>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5">
            <h3 className="text-lg font-semibold mb-2">Reset Theme?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will reset all theme settings to default. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={resetToDefault}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Reset Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}