'use client';

interface BackgroundOptionsProps {
  isPremium: boolean;
  backgroundType: string;
  setBackgroundType: (type: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  gradientStart: string;
  setGradientStart: (color: string) => void;
  gradientEnd: string;
  setGradientEnd: (color: string) => void;
  backgroundImage: string;
  setBackgroundImage: (url: string) => void;
}

export default function BackgroundOptions({
  isPremium,
  backgroundType,
  setBackgroundType,
  backgroundColor,
  setBackgroundColor,
  gradientStart,
  setGradientStart,
  gradientEnd,
  setGradientEnd,
  backgroundImage,
  setBackgroundImage
}: BackgroundOptionsProps) {
  return (
    <div>
      <div className="flex gap-1 mb-2">
        {['color', 'gradient', 'image'].map((type) => (
          <button
            key={type}
            onClick={() => (type === 'color' || isPremium) && setBackgroundType(type)}
            disabled={type !== 'color' && !isPremium}
            className={`flex-1 py-1 rounded text-xs ${
              backgroundType === type ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
            } ${type !== 'color' && !isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {type === 'color' ? 'Color' : type === 'gradient' ? `Grad${!isPremium ? '🔒' : ''}` : `Img${!isPremium ? '🔒' : ''}`}
          </button>
        ))}
      </div>

      {backgroundType === 'color' && (
        <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full h-8 rounded border" />
      )}

      {backgroundType === 'gradient' && isPremium && (
        <div className="flex gap-2">
          <input type="color" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} className="flex-1 h-8 rounded border" />
          <input type="color" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} className="flex-1 h-8 rounded border" />
        </div>
      )}

      {backgroundType === 'image' && isPremium && (
        <input type="url" placeholder="Image URL" value={backgroundImage} onChange={(e) => setBackgroundImage(e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
      )}
    </div>
  );
}