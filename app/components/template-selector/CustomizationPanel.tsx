'use client';

interface CustomizationPanelProps {
  useCustomSettings: boolean;
  onCustomToggle: (checked: boolean) => void;
  children: React.ReactNode;
}

export default function CustomizationPanel({ useCustomSettings, onCustomToggle, children }: CustomizationPanelProps) {
  return (
    <div className="mb-3">
      <label className="flex items-center gap-2 cursor-pointer text-sm">
        <input
          type="checkbox"
          checked={useCustomSettings}
          onChange={(e) => onCustomToggle(e.target.checked)}
          className="w-3.5 h-3.5"
        />
        <span>Customize colors</span>
      </label>
      {useCustomSettings && <div className="mt-2 space-y-3">{children}</div>}
    </div>
  );
}