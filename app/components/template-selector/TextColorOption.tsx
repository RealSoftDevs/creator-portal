'use client';

import { Type } from 'lucide-react';

interface TextColorOptionProps {
  isPremium: boolean;
  customTextColor: string;
  setCustomTextColor: (color: string) => void;
}

export default function TextColorOption({ isPremium, customTextColor, setCustomTextColor }: TextColorOptionProps) {
  return (
    <div className="mb-6">
      <h4 className="font-medium mb-2 flex items-center gap-2">
        <Type className="w-4 h-4" />
        Text Color
        {!isPremium && <span className="text-xs text-yellow-500 ml-1">(Premium)</span>}
      </h4>
      <input
        type="color"
        value={customTextColor}
        onChange={(e) => setCustomTextColor(e.target.value)}
        disabled={!isPremium}
        className={`w-full h-12 rounded-lg border cursor-pointer ${!isPremium ? 'opacity-50' : ''}`}
      />
    </div>
  );
}