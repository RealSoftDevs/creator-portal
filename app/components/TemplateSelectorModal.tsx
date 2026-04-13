'use client';

import { useState, useEffect, useRef } from 'react';
import { getFreeTemplates, getPremiumTemplates, getTemplateById } from '@/lib/templates/index';
import { useBackButton } from '@/app/hooks/useBackButton';
import { Header, LivePreview, TemplatesGrid, CustomizationPanel, BackgroundOptions, FontOptions, Footer } from './template-selector';

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
  onSelectTemplate: (config: any) => Promise<void>;
  onUpgradeClick: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

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
  const [useCustomSettings, setUseCustomSettings] = useState(false);
  const [applyToAll, setApplyToAll] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [inactivityTime, setInactivityTime] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const freeTemplates = getFreeTemplates();
  const premiumTemplates = getPremiumTemplates();

  // Reset timer - sets inactivity time to 0
  const resetTimer = () => {
    setInactivityTime(0);
    setShowTimerWarning(false);
  };

  // Start the countdown timer
  const startCountdown = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setInactivityTime(prev => {
        const newTime = prev + 1;

        // Show warning at 35 seconds (5 seconds before close)
        if (newTime === 35) {
          setShowTimerWarning(true);
        }

        // Close at 40 seconds
        if (newTime >= 40) {
          console.log('⏰ Auto-closing theme editor due to 40s inactivity');
          if (intervalRef.current) clearInterval(intervalRef.current);

          if (onBack) {
            onBack();
          } else {
            onClose();
          }
        }

        return newTime;
      });
    }, 1000);
  };

  // Handle any user interaction - reset timer to 0
  const handleUserInteraction = () => {
    resetTimer();
  };

  // Set up timer when modal opens
  useEffect(() => {
    resetTimer();
    startCountdown();

    // Add event listeners for user activity
    const events = ['click', 'mousedown', 'keydown', 'touchstart', 'change', 'input'];
    events.forEach(event => {
      window.addEventListener(event, handleUserInteraction);
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      events.forEach(event => {
        window.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  // Store initial values when modal opens
  const [initialValues, setInitialValues] = useState({
    previewTemplate: selectedTemplate,
    backgroundColor: primaryColor,
    backgroundType: savedBackgroundType || 'color',
    gradientStart: savedGradientStart || '#000000',
    gradientEnd: savedGradientEnd || '#ffffff',
    backgroundImage: savedBackgroundImage || '',
    textColor: textColor || '',
    fontFamily: fontFamily,
    useCustomSettings: false
  });

  // Check if actual changes were made
  const checkForChanges = () => {
    if (useCustomSettings) {
      const hasColorChange = backgroundColor !== initialValues.backgroundColor;
      const hasTypeChange = backgroundType !== initialValues.backgroundType;
      const hasGradientChange = gradientStart !== initialValues.gradientStart || gradientEnd !== initialValues.gradientEnd;
      const hasImageChange = backgroundImage !== initialValues.backgroundImage;
      const hasTextColorChange = customTextColor !== initialValues.textColor;
      const hasFontChange = selectedFont !== initialValues.fontFamily;

      return hasColorChange || hasTypeChange || hasGradientChange || hasImageChange || hasTextColorChange || hasFontChange;
    } else {
      const templateChanged = previewTemplate !== initialValues.previewTemplate;
      const wasCustomEnabled = initialValues.useCustomSettings;
      return templateChanged || wasCustomEnabled;
    }
  };

  // Update hasChanges when anything changes
  useEffect(() => {
    const changed = checkForChanges();
    setHasChanges(changed);
    // Reset timer on any change
    if (changed) {
      resetTimer();
    }
  }, [previewTemplate, backgroundColor, backgroundType, gradientStart, gradientEnd,
      backgroundImage, customTextColor, selectedFont, useCustomSettings]);

  // Handle physical back button - close modal
  const handlePhysicalBack = () => {
    console.log('🔴 Physical back button pressed in THEME MODAL');
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (onBack) {
      onBack();
    } else {
      onClose();
    }
  };

  // Register back button handler
  useBackButton(handlePhysicalBack, true);

  // Close immediately (X button)
  const handleClose = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onClose();
  };

  // Back arrow button
  const handleBackArrow = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (hasChanges) {
      if (confirm('Exit theme editor? Changes not applied will be lost.')) {
        if (onBack) {
          onBack();
        } else {
          onClose();
        }
      }
    } else {
      if (onBack) {
        onBack();
      } else {
        onClose();
      }
    }
  };

  const handlePreviewClick = (templateId: string) => {
    resetTimer();
    setPreviewTemplate(templateId);
    const template = getTemplateById(templateId);
    if (!useCustomSettings) {
      setBackgroundColor(template.defaultBackground);
      setCustomTextColor(template.defaultTextColor);
      setBackgroundType('color');
      setGradientStart(template.defaultBackground);
      setGradientEnd('#ffffff');
      setBackgroundImage('');
    }
  };

  const handleCustomToggle = (checked: boolean) => {
    resetTimer();
    setUseCustomSettings(checked);
    if (!checked) {
      const template = getTemplateById(previewTemplate);
      setBackgroundColor(template.defaultBackground);
      setCustomTextColor(template.defaultTextColor);
      setBackgroundType('color');
    }
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
    const config: any = {
      templateId: previewTemplate,
      fontFamily: selectedFont,
    };

    if (useCustomSettings) {
      config.backgroundType = backgroundType;
      config.primaryColor = backgroundColor;
      if (customTextColor && customTextColor !== template.defaultTextColor) {
        config.textColor = customTextColor;
      }
      if (backgroundType === 'gradient') {
        config.gradientStart = gradientStart;
        config.gradientEnd = gradientEnd;
      } else if (backgroundType === 'image' && backgroundImage) {
        config.backgroundImage = backgroundImage;
      }
    } else {
      config.backgroundType = 'color';
      config.primaryColor = template.defaultBackground;
      config.textColor = template.defaultTextColor;
    }
    return config;
  };

  const handleApplyToPublic = async () => {
    resetTimer();
    const template = getTemplateById(previewTemplate);
    if (template.isPremium && !isPremium) {
      onUpgradeClick();
      return;
    }
    setApplying(true);
    await onSelectTemplate({ ...getBaseConfig(), target: 'public' });
    setApplying(false);
    setInitialValues({
      previewTemplate,
      backgroundColor,
      backgroundType,
      gradientStart,
      gradientEnd,
      backgroundImage,
      textColor: customTextColor,
      fontFamily: selectedFont,
      useCustomSettings
    });
  };

  const handleApplyToAdmin = async () => {
    resetTimer();
    if (!isPremium) {
      onUpgradeClick();
      return;
    }
    setApplying(true);
    await onSelectTemplate({ ...getBaseConfig(), target: 'admin' });
    setApplying(false);
    setInitialValues({
      previewTemplate,
      backgroundColor,
      backgroundType,
      gradientStart,
      gradientEnd,
      backgroundImage,
      textColor: customTextColor,
      fontFamily: selectedFont,
      useCustomSettings
    });
  };

  const handleApplyToBoth = async () => {
    const template = getTemplateById(previewTemplate);

    if (template.isPremium && !isPremium) {
      onUpgradeClick();
      return;
    }

    // For non-premium users, only apply to public
    if (!isPremium) {
      alert('✨ Upgrade to Premium to apply themes to both Public and Admin pages! Only Public page will be updated.');
      setApplying(true);
      await onSelectTemplate({ ...getBaseConfig(), target: 'public' });
      setApplying(false);
      setInitialValues({
        previewTemplate,
        backgroundColor,
        backgroundType,
        gradientStart,
        gradientEnd,
        backgroundImage,
        textColor: customTextColor,
        fontFamily: selectedFont,
        useCustomSettings
      });
      return;
    }

    // Premium user - apply to both
    setApplying(true);
    await onSelectTemplate({ ...getBaseConfig(), target: 'public' });
    await onSelectTemplate({ ...getBaseConfig(), target: 'admin' });
    setApplying(false);
    setInitialValues({
      previewTemplate,
      backgroundColor,
      backgroundType,
      gradientStart,
      gradientEnd,
      backgroundImage,
      textColor: customTextColor,
      fontFamily: selectedFont,
      useCustomSettings
    });
  };

  const getPreviewStyle = () => {
    if (useCustomSettings) {
      if (backgroundType === 'color') return { backgroundColor };
      if (backgroundType === 'gradient') return { background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` };
      if (backgroundType === 'image' && backgroundImage) return { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' };
    }
    const template = getTemplateById(previewTemplate);
    return { backgroundColor: template.defaultBackground };
  };

  const getPreviewTextColor = () => {
    if (useCustomSettings && customTextColor) return customTextColor;
    return getTemplateById(previewTemplate).defaultTextColor;
  };

  const getPreviewFont = () => selectedFont;

  // Calculate seconds remaining
  const secondsRemaining = Math.max(0, 40 - inactivityTime);
  const progressPercent = (secondsRemaining / 40) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-xl w-full max-w-lg mx-auto flex flex-col max-h-[85vh]">
         {/* Timer Progress Bar - at the top */}
                <div className="px-4 pt-2 pb-1">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>⏱️ Auto-close</span>
                    <span className={secondsRemaining < 10 ? 'text-red-500 font-bold' : ''}>
                      {secondsRemaining}s remaining
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        secondsRemaining < 10 ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Auto-close warning banner */}
                {showTimerWarning && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-xs mx-4 rounded">
                    ⏰ Closing in {secondsRemaining} seconds due to inactivity...
                  </div>
                )}

         <Header
          applyToAll={applyToAll}
          setApplyToAll={setApplyToAll}
          onClose={handleClose}
          onBack={handleBackArrow}
          showBack={showBack}
        />



        <div className="p-3">
          <LivePreview
            getPreviewStyle={getPreviewStyle}
            getPreviewTextColor={getPreviewTextColor}
            getPreviewFont={getPreviewFont}
            userName={userName}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-3 pt-0">
          <TemplatesGrid
            freeTemplates={freeTemplates}
            premiumTemplates={premiumTemplates}
            previewTemplate={previewTemplate}
            isPremium={isPremium}
            onPreviewClick={handlePreviewClick}
          />

          <CustomizationPanel useCustomSettings={useCustomSettings} onCustomToggle={handleCustomToggle}>
            <BackgroundOptions
              isPremium={isPremium}
              backgroundType={backgroundType}
              setBackgroundType={handleBackgroundTypeChange}
              backgroundColor={backgroundColor}
              setBackgroundColor={handleBackgroundColorChange}
              gradientStart={gradientStart}
              setGradientStart={handleGradientStartChange}
              gradientEnd={gradientEnd}
              setGradientEnd={handleGradientEndChange}
              backgroundImage={backgroundImage}
              setBackgroundImage={handleBackgroundImageChange}
            />
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Text Color {!isPremium && '🔒'}</div>
              <input
                type="color"
                value={customTextColor}
                onChange={(e) => handleTextColorChange(e.target.value)}
                disabled={!isPremium} 
                className="w-full h-8 rounded border" 
              />
            </div>
          </CustomizationPanel>
          
          <FontOptions selectedFont={selectedFont} setSelectedFont={handleFontChange} />
        </div>
        
        <Footer 
          applyToAll={applyToAll} 
          isPremium={isPremium} 
          applying={applying} 
          onApplyToPublic={handleApplyToPublic} 
          onApplyToAdmin={handleApplyToAdmin} 
          onApplyToBoth={handleApplyToBoth} 
        />
      </div>
    </div>
  );
}