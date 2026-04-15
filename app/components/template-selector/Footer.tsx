'use client';

interface FooterProps {
  applyToAll: boolean;
  isPremium: boolean;
  applying: boolean;
  onApplyToPublic: () => void;
  onApplyToAdmin: () => void;
  onApplyToBoth: () => void;
}

export default function Footer({ applyToAll, isPremium, applying, onApplyToPublic, onApplyToAdmin, onApplyToBoth }: FooterProps) {
  return (
    <div className="sticky bottom-0 bg-white border-t p-3 rounded-b-2xl">
      {applyToAll ? (
        <button
          onClick={onApplyToBoth}
          disabled={applying}
          className="w-full py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
        >
          {applying ? 'Applying...' : 'Apply to Both'}
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onApplyToPublic}
            disabled={applying}
            className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            Apply to Public
          </button>
          <button
            onClick={onApplyToAdmin}
            disabled={applying || !isPremium}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              isPremium ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Apply to Admin {!isPremium && '🔒'}
          </button>
        </div>
      )}
    </div>
  );
}