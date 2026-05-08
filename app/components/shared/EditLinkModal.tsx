// app/components/shared/EditLinkModal.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface EditLinkModalProps {
  link: {
    id: string;
    title: string;
    url: string;
  };
  onClose: () => void;
  onSave: (id: string, data: { title: string; url: string }) => Promise<boolean>;
  isPremium: boolean;
}

export default function EditLinkModal({ link, onClose, onSave, isPremium }: EditLinkModalProps) {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await onSave(link.id, { title, url });
    setSaving(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl max-w-md w-full p-5 border border-white/20" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Edit Link</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Link Title"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white mb-3 focus:outline-none focus:border-purple-500"
            required
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white mb-4 focus:outline-none focus:border-purple-500"
            required
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-white/20 rounded-lg text-white/70 hover:bg-white/10 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}