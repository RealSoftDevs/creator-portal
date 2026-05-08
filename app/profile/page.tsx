// app/profile/page.tsx - Add Custom URL section
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, User, Sparkles, Crown, LogOut, Link as LinkIcon, Check, X } from 'lucide-react';

interface PortalData {
  id: string;
  slug: string;
  title: string;
  bio: string;
  displayName?: string;
  avatarUrl?: string;
  userName: string;
  isPremium?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [updatingUsername, setUpdatingUsername] = useState(false);
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/portal/info');
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setPortalData(data);
        setDisplayName(data.displayName || data.userName || '');
        setTitle(data.title || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatarUrl || '');
        setCustomUsername(data.userName || '');
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        let imageUrl = data.url;
        if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
        setAvatarUrl(imageUrl);
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateUsername = async () => {
     if (!customUsername || customUsername.length < 3) {
       setUsernameError('Username must be at least 3 characters');
       return;
     }

     if (customUsername.length > 30) {
       setUsernameError('Username must be less than 30 characters');
       return;
     }

     // Allow letters, numbers, dots, and underscores
     if (!/^[a-zA-Z0-9_.]+$/.test(customUsername)) {
       setUsernameError('Username can only contain letters, numbers, dots (.), and underscores (_)');
       return;
     }

     setUpdatingUsername(true);
     setUsernameError('');
     setUsernameSuccess('');

     try {
       const res = await fetch('/api/portal/update-username', {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ customUsername })
       });

       const data = await res.json();

       if (res.ok) {
         setUsernameSuccess(`Username updated! Your public page is now at /view/${customUsername}`);
         // Update the portal data with new username
         setPortalData(prev => prev ? { ...prev, userName: customUsername } : prev);
         setTimeout(() => setUsernameSuccess(''), 5000);
       } else {
         setUsernameError(data.error || 'Failed to update username');
       }
     } catch (error) {
       console.error('Update username error:', error);
       setUsernameError('Failed to update username');
     } finally {
       setUpdatingUsername(false);
     }
   };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName,
          title: title,
          bio: bio,
          avatarUrl: avatarUrl || null,
        })
      });
      if (res.ok) {
        alert('Profile updated successfully!');
        router.push('/');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-purple-400 transition">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            {portalData?.isPremium && (
              <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full">
                <Crown className="w-3 h-3 text-white" />
                <span className="text-xs font-semibold text-white">Premium</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 rounded-full px-4 py-1.5 mb-4">
            <User className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Profile Settings</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Profile</h1>
          <p className="text-white/60">Manage your public profile information</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
          {/* Custom URL Section - Premium only */}
          {portalData?.isPremium && (
             <div className="p-6 border-b border-white/20 bg-purple-500/10">
               <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                 <LinkIcon className="w-5 h-5 text-purple-400" />
                 Custom Public URL
               </h2>
               <p className="text-sm text-white/60 mb-3">
                 Choose a custom username for your public page. Your page will be available at:
               </p>
               <div className="bg-black/30 rounded-lg p-3 mb-4">
                 <code className="text-sm text-purple-300">
                   {typeof window !== 'undefined' && window.location.origin}/view/
                 </code>
                 <input
                   type="text"
                   value={customUsername}
                   onChange={(e) => setCustomUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                   placeholder="your.custom_username"
                   className="inline-block w-auto min-w-[150px] bg-transparent border-b-2 border-purple-500 text-white focus:outline-none px-1"
                 />
               </div>

               {/* Validation hints */}
               <div className="text-xs text-white/40 mb-3 space-y-1">
                 <p>✅ Letters (a-z), numbers (0-9), dots (.), and underscores (_)</p>
                 <p>✅ 3-30 characters long</p>
                 <p>✅ Must be unique</p>
                 <p>💡 Example: john.doe, tech_guru, creator_123</p>
               </div>

               {usernameError && (
                 <div className="flex items-center gap-2 text-red-400 text-sm mb-3">
                   <X className="w-4 h-4" />
                   {usernameError}
                 </div>
               )}
               {usernameSuccess && (
                 <div className="flex items-center gap-2 text-green-400 text-sm mb-3">
                   <Check className="w-4 h-4" />
                   {usernameSuccess}
                 </div>
               )}
               <button
                 onClick={handleUpdateUsername}
                 disabled={updatingUsername || !customUsername}
                 className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition disabled:opacity-50 flex items-center gap-2"
               >
                 {updatingUsername ? 'Updating...' : 'Update Custom URL'}
               </button>
             </div>
           )}

          {/* Avatar Section */}
          <div className="p-6 border-b border-white/20">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              Profile Picture
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border-4 border-purple-500 shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-purple-500 shadow-lg">
                    {(displayName || portalData?.userName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg transition"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-white/70 text-sm mb-2">
                  Upload a profile picture. Recommended: Square image, at least 200x200px.
                </p>
                {avatarUrl && (
                  <button
                    onClick={() => setAvatarUrl('')}
                    className="text-sm text-red-400 hover:text-red-300 transition"
                  >
                    Remove photo
                  </button>
                )}
                {uploadingAvatar && (
                  <div className="mt-2 flex items-center gap-2 text-white/60">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span className="text-sm">Uploading...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div className="p-6 border-b border-white/20">
            <label className="block text-sm font-medium text-white/80 mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
            />
            <p className="text-xs text-white/50 mt-1">This name will be displayed publicly on your page</p>
          </div>

          {/* Page Title */}
          <div className="p-6 border-b border-white/20">
            <label className="block text-sm font-medium text-white/80 mb-2">Page Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Creator Portal"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
            />
            <p className="text-xs text-white/50 mt-1">Optional: A custom title for your page</p>
          </div>

          {/* Bio */}
          <div className="p-6 border-b border-white/20">
            <label className="block text-sm font-medium text-white/80 mb-2">Bio / Description</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              placeholder="Tell your audience about yourself, what you create, and what they can expect..."
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 transition resize-none"
            />
            <p className="text-xs text-white/50 mt-1">{bio.length}/500 characters</p>
          </div>

          {/* Preview Section */}
          <div className="p-6 bg-purple-500/10">
            <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Live Preview
            </h3>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4">
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-white" />
                ) : (
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {(displayName || portalData?.userName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-white text-lg">{displayName || portalData?.userName || 'Your Name'}</p>
                  {title && <p className="text-white/70 text-sm">{title}</p>}
                </div>
              </div>
              {bio && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-white/80 text-sm">{bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 flex gap-3">
            <Link href="/" className="flex-1 py-3 border border-white/20 rounded-lg text-white/70 hover:bg-white/10 transition text-center">
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}