'use client';

interface ActionButtonsProps {
  targetPage: 'public' | 'admin';
  isPremium: boolean;
  applying: boolean;
  onApply: (target: 'public' | 'admin') => void;
  onCancel: () => void;
}

export default function ActionButtons({ targetPage, isPremium, applying, onApply, onCancel }: ActionButtonsProps) {
  return (
    <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-2xl">
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border rounded-xl font-medium hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={() => onApply('public')}
          disabled={applying}
          className={`flex-1 py-3 rounded-xl font-medium transition disabled:opacity-50 ${
            targetPage === 'public' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500'
          }`}
        >
          {applying ? 'Applying...' : '🌐 Apply to Public Page'}
        </button>
        <button
          onClick={() => onApply('admin')}
          disabled={applying || !isPremium}
          className={`flex-1 py-3 rounded-xl font-medium transition disabled:opacity-50 ${
            targetPage === 'admin' && isPremium ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-500'
          }`}
        >
          {applying ? 'Applying...' : '🛠️ Apply to Admin Panel'}
          {!isPremium && ' 🔒'}
        </button>
      </div>
    </div>
  );
}