// app/components/dashboard/ProfileSettingsModal.tsx
'use client';

import { useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';

interface ProfileSettingsModalProps {
  displayName: string;
  setDisplayName: (name: string) => void;
  title: string;
  setTitle: (title: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  userName: string;
  onSave: () => void;
  onClose: () => void;
}

export default function ProfileSettingsModal({
  displayName, setDisplayName, title, setTitle, bio, setBio, avatarUrl, setAvatarUrl, userName, onSave, onClose
}: ProfileSettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) setAvatarUrl(data.url);
    } catch (error) { console.error(error); }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gray-900 p-5 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10"><X className="w-5 h-5 text-white" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div>
                {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-purple-500" /> : <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">{(displayName || userName || 'U').charAt(0).toUpperCase()}</div>}
              </div>
              <div className="flex-1">
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleAvatarUpload(file); }} />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-white/10 rounded-lg text-sm text-white hover:bg-white/20 transition flex items-center gap-2"><Upload className="w-4 h-4" />{uploading ? 'Uploading...' : 'Change Photo'}</button>
                {avatarUrl && <button onClick={() => setAvatarUrl('')} className="ml-2 px-4 py-2 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition">Remove</button>}
                <p className="text-xs text-white/50 mt-1">JPG, PNG up to 2MB</p>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div><label className="block text-sm font-medium text-white/80 mb-1">Display Name</label><input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your display name" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" /></div>

          {/* Page Title */}
          <div><label className="block text-sm font-medium text-white/80 mb-1">Page Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Creator Portal" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" /></div>

          {/* Bio */}
          <div><label className="block text-sm font-medium text-white/80 mb-1">Bio</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Tell your audience about yourself..." className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none" /><p className="text-xs text-white/50 mt-1">{bio.length}/500 characters</p></div>

          {/* Preview */}
          <div className="bg-white/5 rounded-xl p-4"><p className="text-sm font-medium text-white/80 mb-2">Preview</p><div className="flex items-center gap-3"><div>{avatarUrl ? <img src={avatarUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white">{(displayName || userName || 'U').charAt(0).toUpperCase()}</div>}</div><div><p className="font-semibold text-white">{displayName || userName || 'User'}</p>{bio && <p className="text-xs text-white/60 line-clamp-1">{bio}</p>}</div></div></div>

          {/* Actions */}
          <div className="flex gap-3 pt-2"><button onClick={onClose} className="flex-1 py-2 border border-white/20 rounded-lg text-white/70 hover:bg-white/10 transition">Cancel</button><button onClick={onSave} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">Save Changes</button></div>
        </div>
      </div>
    </div>
  );
}