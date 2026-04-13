'use client';

interface FontOptionsProps {
  selectedFont: string;
  setSelectedFont: (font: string) => void;
}

const fonts = [
  { value: 'font-sans', name: 'Sans' },
  { value: 'font-serif', name: 'Serif' },
  { value: 'font-mono', name: 'Mono' },
];

export default function FontOptions({ selectedFont, setSelectedFont }: FontOptionsProps) {
  return (
    <div>
      <div className="flex gap-2">
        {fonts.map((font) => (
          <button
            key={font.value}
            onClick={() => setSelectedFont(font.value)}
            className={`flex-1 py-1 rounded text-xs ${
              selectedFont === font.value ? 'bg-black text-white' : 'bg-gray-100'
            }`}
          >
            {font.name}
          </button>
        ))}
      </div>
    </div>
  );
}