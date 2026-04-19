'use client';

import { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { socialLinks, LinkType } from '@/lib/linkTypes';

interface AddLinkModalProps {
  onClose: () => void;
  onSave: (link: any) => void;
}

const getIconUrl = (platformId: string): string => {
  const iconUrls: Record<string, string> = {
   instagram: 'https://cdn.simpleicons.org/instagram/0000000',
   youtube: 'https://cdn.simpleicons.org/youtube/ffffff',
   tiktok: 'https://cdn.simpleicons.org/tiktok/ffffff',
   facebook: 'https://cdn.simpleicons.org/facebook/ffffff',
   twitter: 'https://cdn.simpleicons.org/x/ffffff',
   linkedin: 'https://pluspng.com/img-png/linkedin-icon-png--1600.png',
   github: 'https://cdn.simpleicons.org/github/ffffff',
   twitch: 'https://cdn.simpleicons.org/twitch/ffffff',
   discord: 'https://cdn.simpleicons.org/discord/ffffff',
   whatsapp: 'https://cdn.simpleicons.org/whatsapp/ffffff',
   telegram: 'https://cdn.simpleicons.org/telegram/ffffff',
   spotify: 'https://cdn.simpleicons.org/spotify/0000000',
   apple: 'https://cdn.simpleicons.org/apple/ffffff',
   snapchat: 'https://cdn.simpleicons.org/snapchat/000000',
   pinterest: 'https://cdn.simpleicons.org/pinterest/ffffff',
   reddit: 'https://cdn.simpleicons.org/reddit/ffffff',
   email: 'https://cdn.simpleicons.org/gmail/ffffff',
   phone: 'https://cdn.simpleicons.org/whatsapp/ffffff',
   linktree: 'https://cdn.simpleicons.org/linktree/ffffff',
   website: 'https://cdn.simpleicons.org/globe/ffffff',
   amazon: 'https://static.vecteezy.com/system/resources/previews/019/136/322/original/amazon-logo-amazon-icon-free-free-vector.jpg',
   myntra: 'https://static.vecteezy.com/system/resources/previews/050/816/835/non_2x/myntra-transparent-icon-free-png.png',
   flipkart: 'https://cdn.freelogovectors.net/wp-content/uploads/2025/07/flipkart-logo-icon-freelogovectors.net_.png',
   custom: 'https://img.icons8.com/ios-glyphs/30/link.png',
   link: 'https://img.icons8.com/ios-glyphs/30/link.png'
  };
  return iconUrls[platformId] || 'https://img.icons8.com/ios-glyphs/30/link.png';
};

export default function AddLinkModal({ onClose, onSave }: AddLinkModalProps) {
  const [username, setUsername] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customIcon, setCustomIcon] = useState('');
  const [showIconOptions, setShowIconOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<LinkType | null>(null);
  const [showSocialGrid, setShowSocialGrid] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLinks = socialLinks.filter(link => 
    link.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUrlPattern = (platformId: string, username: string): string => {
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
      amazon: `https://amazon.com/shop/${username}`,
      spotify: `https://open.spotify.com/artist/${username}`,
      apple: `https://music.apple.com/us/artist/${username}`,
      snapchat: `https://snapchat.com/add/${username}`,
      pinterest: `https://pinterest.com/${username}`,
      reddit: `https://reddit.com/user/${username}`,
      email: `mailto:${username}`,
      phone: `tel:${username}`,
      linktree: `https://linktr.ee/${username}`,
      website: username.startsWith('http') ? username : `https://${username}`,
    };
    return patterns[platformId] || `https://${username}`;
  };

  const handleSocialSelect = (linkType: LinkType) => {
    setSelectedType(linkType);
    setUsername('');
    setCustomTitle('');
    setCustomUrl('');
    setShowSocialGrid(false);
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (selectedType && selectedType.id !== 'custom') {
      if (!username.trim()) {
        alert(`Please enter your ${selectedType.name} username`);
        setLoading(false);
        return;
      }
      const fullUrl = getUrlPattern(selectedType.id, username.trim());
      await onSave({ 
        title: selectedType.name, 
        url: fullUrl, 
        iconUrl: customIcon || undefined 
      });
    } else {
      if (!customTitle.trim() || !customUrl.trim()) {
        alert('Please enter both title and URL');
        setLoading(false);
        return;
      }
      await onSave({ 
        title: customTitle.trim(), 
        url: customUrl.trim(), 
        iconUrl: customIcon || undefined 
      });
    }
    
    setLoading(false);
    onClose();
  };

  if (showSocialGrid) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center overflow-y-auto">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Select Platform</h3>
              <button onClick={onClose} className="p-1 text-gray-500"><X className="w-6 h-6" /></button>
            </div>
            <input
              type="text"
              placeholder="🔍 Search platforms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
              autoFocus
            />
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-3">
              {filteredLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleSocialSelect(link)}
                  className="flex flex-col items-center p-3 rounded-xl border hover:shadow-md transition group"
                >
                  <div className={`${link.bgColor} w-10 h-10 rounded-lg flex items-center justify-center`}>
                    <img src={getIconUrl(link.id)} alt={link.name} className="w-6 h-6" />
                  </div>
                  <span className="text-xs mt-1 truncate w-full text-center">{link.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setSelectedType({ id: 'custom', name: 'Custom Link', bgColor: 'bg-gray-500', placeholder: '' } as LinkType);
                setShowSocialGrid(false);
              }}
              className="w-full mt-4 py-2 text-center text-gray-500 border rounded-xl hover:bg-gray-50 transition"
            >
              Skip & Add Custom Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCustomLink = selectedType?.id === 'custom';
  const iconUrl = selectedType ? getIconUrl(selectedType.id) : '';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md mx-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add {selectedType?.name || 'Custom'} Link</h3>
          <button onClick={onClose} className="p-1 text-gray-500"><X className="w-6 h-6" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {isCustomLink ? (
            <>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Link Title"
                className="w-full px-4 py-3 border rounded-xl"
                required
              />
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border rounded-xl"
                required
              />
            </>
          ) : (
            <div className="flex items-center gap-3 border rounded-xl bg-white">
              <div className={`${selectedType?.bgColor} w-12 h-12 rounded-l-xl flex items-center justify-center flex-shrink-0`}>
                <img src={iconUrl} alt={selectedType?.name} className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={`@${selectedType?.name.toLowerCase()} username`}
                className="flex-1 px-3 py-3 outline-none bg-transparent"
                required
              />
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={() => setShowIconOptions(!showIconOptions)}
              className="text-sm text-blue-600"
            >
              {showIconOptions ? '− Hide' : '+ Add Custom Icon'}
            </button>
            {showIconOptions && (
              <input
                type="text"
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value)}
                placeholder="🎵 or image URL"
                className="w-full mt-2 px-4 py-2 border rounded-lg text-sm"
              />
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => { setShowSocialGrid(true); setSelectedType(null); }} className="flex-1 py-3 border rounded-xl">Back</button>
            <button type="submit" disabled={loading} className="flex-1 bg-black text-white py-3 rounded-xl">
              {loading ? 'Adding...' : 'Add Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}