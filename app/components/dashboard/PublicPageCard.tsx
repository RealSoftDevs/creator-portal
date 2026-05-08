// app/components/dashboard/PublicPageCard.tsx
'use client';

import { useState } from 'react';
import { Eye, Copy, Check, Edit2, X } from 'lucide-react';

interface PublicPageCardProps {
  publicUrl: string;
  customUsername?: string;
  isPremium?: boolean;
  onUpdateUsername?: (username: string) => Promise<void>;
}

export default function PublicPageCard({ publicUrl, customUsername, isPremium, onUpdateUsername }: PublicPageCardProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(customUsername || '');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out my CreatorPortal page: ${publicUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSaveUsername = async () => {
    if (!editUsername || editUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (editUsername.length > 30) {
      setError('Username must be less than 30 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(editUsername)) {
      setError('Username can only contain letters, numbers, dots (.), and underscores (_)');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      const res = await fetch('/api/portal/update-username', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customUsername: editUsername })
      });

      const data = await res.json();

      if (res.ok) {
        setIsEditing(false);
        if (onUpdateUsername) {
          await onUpdateUsername(editUsername);
        }
        // Show success message briefly
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
        successMsg.textContent = '✓ Custom URL updated!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
      } else {
        setError(data.error || 'Failed to update username');
      }
    } catch (error) {
      console.error('Update username error:', error);
      setError('Failed to update username');
    } finally {
      setUpdating(false);
    }
  };

  // Extract the username from the URL for display
  const displayUsername = customUsername || publicUrl.split('/view/').pop() || '';

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 mb-6 border border-white/20">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-white/80">Your public page</p>
            {isEditing ? (
              <div className="mt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-[10px] sm:text-xs text-white/50">
                    {typeof window !== 'undefined' && window.location.origin}/view/
                  </code>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => {
                      setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''));
                      setError('');
                    }}
                    placeholder="your_username"
                    className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-400 mt-1">{error}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveUsername}
                    disabled={updating}
                    className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditUsername(displayUsername);
                      setError('');
                    }}
                    className="px-2 py-1 bg-white/10 text-white rounded text-xs hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-[10px] text-white/40 mt-2">
                  💡 Letters, numbers, dots (.), underscores (_). 3-30 characters.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <p className="font-mono text-[10px] sm:text-xs text-white/50 break-all">
                  {publicUrl}
                </p>
                {isPremium && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-white/50 hover:text-purple-400 transition"
                    title="Edit custom URL"
                  >
                    <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="bg-white/20 hover:bg-white/30 px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm flex items-center gap-1 text-white transition whitespace-nowrap"
            >
              {copied ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="bg-green-600/80 hover:bg-green-600 px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm flex items-center gap-1 text-white transition whitespace-nowrap"
            >
              📱 Share
            </button>
            <button
              onClick={() => window.open(publicUrl, '_blank')}
              className="bg-white/20 hover:bg-white/30 px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm flex items-center gap-1 text-white transition whitespace-nowrap"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> Open
            </button>
          </div>
        </div>

        {/* Premium upgrade prompt for non-premium users */}
        {!isPremium && (
          <div className="text-center pt-2 border-t border-white/10">
            <p className="text-[10px] text-yellow-400/80">
              ✨ Upgrade to Premium to set a custom URL (e.g., /view/yourname)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}