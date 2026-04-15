'use client';

interface FontOptionsProps {
  selectedFont: string;
  setSelectedFont: (font: string) => void;
}

const fonts = [
  { value: 'font-sans', name: 'Sans', preview: 'Aa' },
  { value: 'font-serif', name: 'Serif', preview: 'Aa' },
  { value: 'font-mono', name: 'Mono', preview: 'Aa' },
];

export default function FontOptions({ selectedFont, setSelectedFont }: FontOptionsProps) {
  return (
    <div className="flex gap-1">
      {fonts.map((font) => (
        <button
          key={font.value}
          onClick={() => setSelectedFont(font.value)}
          className={`flex-1 py-1 rounded text-xs transition ${
            selectedFont === font.value
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          <div className={`${font.value} text-sm`}>Aa</div>
        </button>
      ))}
    </div>
  );
}