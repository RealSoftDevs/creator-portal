// app/studio/components/ProfileSettingsModal.tsx
'use client';

import { useState, useCallback } from 'react';
import { X, Upload, Loader2, User, Info, Image as ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface ProfileSettingsModalProps {
  portal: {
    id: string;
    title: string;
    bio: string;
    displayName?: string;
    avatarUrl?: string;
    userName: string;
  };
  onClose: () => void;
  onSave: (updates: any) => Promise<void>;
}

export default function ProfileSettingsModal({ portal, onClose, onSave }: ProfileSettingsModalProps) {
  const [displayName, setDisplayName] = useState(portal.displayName || '');
  const [title, setTitle] = useState(portal.title);
  const [bio, setBio] = useState(portal.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(portal.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  // Handle avatar upload
  const onAvatarDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const interval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      const data = await res.json();

      if (data.success) {
        let finalImageUrl = data.url;
        if (finalImageUrl.startsWith('//')) finalImageUrl = 'https:' + finalImageUrl;
        setAvatarUrl(finalImageUrl);
        setUploadProgress(100);
        setShowAvatarUpload(false);
      } else {
        alert(data.error || 'Upload failed');
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
      setUploadProgress(0);
    } finally {
      clearInterval(interval);
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onAvatarDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await onSave({
      displayName: displayName || title,
      title,
      bio,
      avatarUrl: avatarUrl || null,
    });

    setLoading(false);
    onClose();
  };

const getInitialName = () => {
  const name = displayName || title || portal.userName || 'User';
  return name.charAt(0).toUpperCase();
};

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center overflow-y-auto">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h3 className="text-lg font-semibold">Profile Settings</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Avatar Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>

            {!showAvatarUpload ? (
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl">
                      {getInitialName()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => setShowAvatarUpload(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
                  >
                    Change Photo
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="ml-2 px-4 py-2 text-red-600 rounded-lg text-sm hover:bg-red-50 transition"
                    >
                      Remove
                    </button>
                  )}
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 2MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {isDragActive ? 'Drop image here' : 'Click or drag to upload'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Recommended: Square image, at least 200x200px</p>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowAvatarUpload(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., John Doe, Tech Creator"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              This name will be displayed publicly on your page
            </p>
          </div>

          {/* Page Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Creator Portal"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Optional: A custom title for your page
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio / Description
            </label>
            <div className="relative">
              <Info className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell your audience about yourself, what you create, and what they can expect..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none resize-none"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {bio.length}/500 characters
            </p>
          </div>

          {/* Preview Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                  {(displayName || title || portal.userName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{displayName || title || portal.userName || 'User'}</p>
                {bio && <p className="text-xs text-gray-500 line-clamp-1">{bio}</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}