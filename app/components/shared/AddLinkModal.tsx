// app/components/shared/AddLinkModal.tsx - Full featured with icon picker
'use client';

import { useState } from 'react';
import { X, Search } from 'lucide-react';

interface SocialLink {
  id: string;
  name: string;
  icon: string;
  bgColor: string;
  placeholder: string;
}

const socialLinks: SocialLink[] = [
  { id: 'instagram', name: 'Instagram', icon: 'https://cdn.simpleicons.org/instagram/ffffff', bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500', placeholder: 'https://instagram.com/username' },
  { id: 'youtube', name: 'YouTube', icon: 'https://cdn.simpleicons.org/youtube/ffffff', bgColor: 'bg-red-600', placeholder: 'https://youtube.com/@username' },
  { id: 'tiktok', name: 'TikTok', icon: 'https://cdn.simpleicons.org/tiktok/ffffff', bgColor: 'bg-black', placeholder: 'https://tiktok.com/@username' },
  { id: 'facebook', name: 'Facebook', icon: 'https://cdn.simpleicons.org/facebook/ffffff', bgColor: 'bg-blue-600', placeholder: 'https://facebook.com/username' },
  { id: 'twitter', name: 'Twitter/X', icon: 'https://cdn.simpleicons.org/x/ffffff', bgColor: 'bg-blue-400', placeholder: 'https://twitter.com/username' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'https://cdn.simpleicons.org/linkedin/ffffff', bgColor: 'bg-blue-700', placeholder: 'https://linkedin.com/in/username' },
  { id: 'github', name: 'GitHub', icon: 'https://cdn.simpleicons.org/github/ffffff', bgColor: 'bg-gray-800', placeholder: 'https://github.com/username' },
  { id: 'twitch', name: 'Twitch', icon: 'https://cdn.simpleicons.org/twitch/ffffff', bgColor: 'bg-purple-600', placeholder: 'https://twitch.tv/username' },
  { id: 'discord', name: 'Discord', icon: 'https://cdn.simpleicons.org/discord/ffffff', bgColor: 'bg-indigo-500', placeholder: 'https://discord.gg/invite' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'https://cdn.simpleicons.org/whatsapp/ffffff', bgColor: 'bg-green-500', placeholder: 'https://wa.me/1234567890' },
  { id: 'telegram', name: 'Telegram', icon: 'https://cdn.simpleicons.org/telegram/ffffff', bgColor: 'bg-blue-500', placeholder: 'https://t.me/username' },
  { id: 'spotify', name: 'Spotify', icon: 'https://cdn.simpleicons.org/spotify/ffffff', bgColor: 'bg-green-600', placeholder: 'https://open.spotify.com/artist/...' },
  { id: 'apple', name: 'Apple Music', icon: 'https://cdn.simpleicons.org/apple/ffffff', bgColor: 'bg-black', placeholder: 'https://music.apple.com/...' },
  { id: 'snapchat', name: 'Snapchat', icon: 'https://cdn.simpleicons.org/snapchat/000000', bgColor: 'bg-yellow-400', placeholder: 'https://snapchat.com/add/username' },
  { id: 'pinterest', name: 'Pinterest', icon: 'https://cdn.simpleicons.org/pinterest/ffffff', bgColor: 'bg-red-700', placeholder: 'https://pinterest.com/username' },
  { id: 'reddit', name: 'Reddit', icon: 'https://cdn.simpleicons.org/reddit/ffffff', bgColor: 'bg-orange-600', placeholder: 'https://reddit.com/user/username' },
  { id: 'email', name: 'Email', icon: 'https://cdn.simpleicons.org/gmail/ffffff', bgColor: 'bg-gray-500', placeholder: 'mailto:email@example.com' },
  { id: 'phone', name: 'Phone', icon: 'https://cdn.simpleicons.org/whatsapp/ffffff', bgColor: 'bg-green-500', placeholder: 'tel:+1234567890' },
  { id: 'linktree', name: 'Linktree', icon: 'https://cdn.simpleicons.org/linktree/ffffff', bgColor: 'bg-green-600', placeholder: 'https://linktr.ee/username' },
  { id: 'website', name: 'Website', icon: 'https://cdn.simpleicons.org/globe/ffffff', bgColor: 'bg-gray-600', placeholder: 'https://yourwebsite.com' },
  { id: 'amazon', name: 'Amazon Shop', icon: 'https://cdn.simpleicons.org/amazon/ffffff', bgColor: 'bg-orange-500', placeholder: 'https://amazon.com/shop/username' },
  { id: 'custom', name: 'Custom Link', icon: 'https://img.icons8.com/ios-glyphs/30/link.png', bgColor: 'bg-gray-500', placeholder: 'https://example.com' },
];

export default function AddLinkModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => Promise<boolean> }) {
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [selectedLink, setSelectedLink] = useState<SocialLink | null>(null);
  const [username, setUsername] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredLinks = socialLinks.filter(link =>
    link.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUrlPattern = (link: SocialLink, username: string): string => {
    const patterns: Record<string, string> = {
      instagram: `https://instagram.com/${username}`,
      youtube: `https://youtube.com/@${username}`,
      tiktok: `https://tiktok.com/@${username}`,
      facebook: `https://facebook.com/${username}`,
      twitter: `https://twitter.com/${username}`,
      linkedin: `https://linkedin.com/in/${username}`,
      github: `https://github.com/${username}`,
      twitch: `https://twitch.tv/${username}`,
      discord: `https://discord.gg/${username}`,
      whatsapp: `https://wa.me/${username}`,
      telegram: `https://t.me/${username}`,
      spotify: `https://open.spotify.com/artist/${username}`,
      apple: `https://music.apple.com/us/artist/${username}`,
      snapchat: `https://snapchat.com/add/${username}`,
      pinterest: `https://pinterest.com/${username}`,
      reddit: `https://reddit.com/user/${username}`,
      email: `mailto:${username}`,
      phone: `tel:${username}`,
      linktree: `https://linktr.ee/${username}`,
      website: username.startsWith('http') ? username : `https://${username}`,
      amazon: `https://amazon.com/shop/${username}`,
    };
    return patterns[link.id] || `https://${username}`;
  };

  const handleSocialSelect = (link: SocialLink) => {
    setSelectedLink(link);
    setStep('form');
    setUsername('');
    setCustomTitle('');
    setCustomUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let title: string;
    let url: string;

    if (selectedLink && selectedLink.id !== 'custom') {
      if (!username.trim()) {
        alert(`Please enter your ${selectedLink.name} username`);
        setSaving(false);
        return;
      }
      title = selectedLink.name;
      url = getUrlPattern(selectedLink, username.trim());
    } else {
      if (!customTitle.trim() || !customUrl.trim()) {
        alert('Please enter both title and URL');
        setSaving(false);
        return;
      }
      title = customTitle.trim();
      url = customUrl.trim();
    }

    const success = await onSave({ title, url });
    if (success) onClose();
    setSaving(false);
  };

  const handleBack = () => {
    setStep('select');
    setSelectedLink(null);
    setUsername('');
    setCustomTitle('');
    setCustomUrl('');
    setSearchTerm('');
  };

  // Platform Selection Screen
  if (step === 'select') {
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
        <div className="bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Select Platform</h3>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search platforms..."
                className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-purple-500"
                autoFocus
              />
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-4 gap-3">
              {filteredLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleSocialSelect(link)}
                  className="flex flex-col items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition group"
                >
                  <div className={`${link.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-2`}>
                    <img src={link.icon} alt={link.name} className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-white/80 truncate w-full text-center">{link.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => handleSocialSelect(socialLinks.find(l => l.id === 'custom')!)}
              className="w-full mt-4 py-3 text-center text-white/70 border border-white/20 rounded-xl hover:bg-white/10 transition"
            >
              + Add Custom Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form Screen
  const isCustomLink = selectedLink?.id === 'custom';
  const iconUrl = selectedLink?.icon;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl max-w-md w-full border border-white/20" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <button onClick={handleBack} className="p-1 text-gray-400 hover:text-white transition">
            ←
          </button>
          {selectedLink && (
            <div className="flex items-center gap-2">
              <div className={`${selectedLink.bgColor} w-8 h-8 rounded-lg flex items-center justify-center`}>
                <img src={iconUrl} alt={selectedLink.name} className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Add {selectedLink.name} Link</h3>
            </div>
          )}
          <button onClick={onClose} className="ml-auto p-1 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {isCustomLink ? (
            <>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Link Title"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-purple-500"
                required
              />
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-purple-500"
                required
              />
            </>
          ) : (
            <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-lg overflow-hidden">
              <div className={`${selectedLink?.bgColor} w-12 h-12 flex items-center justify-center flex-shrink-0`}>
                <img src={iconUrl} alt={selectedLink?.name} className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={`@${selectedLink?.name.toLowerCase()} username`}
                className="flex-1 px-3 py-3 bg-transparent text-white placeholder:text-white/50 focus:outline-none"
                required
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleBack} className="flex-1 py-2 border border-white/20 rounded-lg text-white/70 hover:bg-white/10 transition">
              Back
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50">
              {saving ? 'Adding...' : 'Add Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}