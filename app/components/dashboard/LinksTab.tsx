// app/components/dashboard/LinksTab.tsx
'use client';

import { useState } from 'react';
import { Plus, Link2, Edit2 } from 'lucide-react';
import EditLinkModal from '@/app/components/shared/EditLinkModal';

interface LinksTabProps {
  links: any[];
  onAddLink: () => void;
  onDeleteLink: (id: string) => void;
  onEditLink?: (id: string, data: { title: string; url: string }) => Promise<boolean>;
  canAddMoreLinks: boolean;
  linksCount: number;
  maxLinks: number;
  isPremium: boolean;
}

const getIconUrl = (platform: string): string => {
  const normalized = platform.toLowerCase();
  const iconMap: Record<string, string> = {
    instagram: 'https://cdn.simpleicons.org/instagram/ffffff',
    youtube: 'https://cdn.simpleicons.org/youtube/ffffff',
    tiktok: 'https://cdn.simpleicons.org/tiktok/ffffff',
    facebook: 'https://cdn.simpleicons.org/facebook/ffffff',
    twitter: 'https://cdn.simpleicons.org/x/ffffff',
    linkedin: 'https://cdn.simpleicons.org/linkedin/ffffff',
    github: 'https://cdn.simpleicons.org/github/ffffff',
    twitch: 'https://cdn.simpleicons.org/twitch/ffffff',
    discord: 'https://cdn.simpleicons.org/discord/ffffff',
    whatsapp: 'https://cdn.simpleicons.org/whatsapp/ffffff',
    telegram: 'https://cdn.simpleicons.org/telegram/ffffff',
    amazon: 'https://cdn.simpleicons.org/amazon/ffffff',
    spotify: 'https://cdn.simpleicons.org/spotify/ffffff',
    apple: 'https://cdn.simpleicons.org/apple/ffffff',
    email: 'https://cdn.simpleicons.org/gmail/ffffff',
    website: 'https://cdn.simpleicons.org/globe/ffffff',
    link: 'https://img.icons8.com/ios-glyphs/30/link.png'
  };
  return iconMap[normalized] || 'https://img.icons8.com/ios-glyphs/30/link.png';
};

const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    youtube: 'bg-red-600',
    tiktok: 'bg-black',
    facebook: 'bg-blue-600',
    twitter: 'bg-blue-400',
    linkedin: 'bg-blue-700',
    github: 'bg-gray-800',
    twitch: 'bg-purple-600',
    discord: 'bg-indigo-500',
    whatsapp: 'bg-green-500',
    telegram: 'bg-blue-500',
    amazon: 'bg-orange-500',
    spotify: 'bg-green-600',
    apple: 'bg-black',
    email: 'bg-gray-500',
    website: 'bg-gray-600'
  };
  return colors[platform.toLowerCase()] || 'bg-gray-600';
};

export default function LinksTab({
  links,
  onAddLink,
  onDeleteLink,
  onEditLink,
  canAddMoreLinks,
  linksCount,
  maxLinks,
  isPremium
}: LinksTabProps) {
  const [editingLink, setEditingLink] = useState<any>(null);

  const handleEdit = (link: any) => {
    if (isPremium) {
      setEditingLink(link);
    } else {
      alert('✨ Edit link feature is available for Premium users only. Upgrade to edit your links!');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={onAddLink} disabled={!canAddMoreLinks} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm flex items-center gap-1 transition ${!canAddMoreLinks ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Add Link ({linksCount}/{maxLinks})
        </button>
      </div>

      {links.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center border border-white/20">
          <Link2 className="w-12 h-12 mx-auto mb-2 text-white/40" />
          <p className="text-white/60">No links yet</p>
          <button onClick={onAddLink} className="mt-3 text-purple-300 underline text-sm">Add your first link</button>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => {
            const platform = link.title?.toLowerCase() || '';
            const bgColor = getPlatformColor(platform);
            const iconUrl = getIconUrl(platform);

            return (
              <div key={link.id} className={`${bgColor} rounded-xl p-3 sm:p-4 text-white flex items-center gap-3 group hover:scale-[1.02] transition-transform shadow-sm`}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <img src={iconUrl} alt={link.title} className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                </div>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 font-medium text-sm sm:text-base hover:underline truncate">
                  {link.title}
                </a>
                <div className="flex items-center gap-2">
                  {/* Edit button - only for premium users */}
                  {isPremium && (
                    <button
                      onClick={() => handleEdit(link)}
                      className="text-white/70 hover:text-white transition p-1"
                      title="Edit link"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteLink(link.id)}
                    className="text-white/70 hover:text-white transition text-xl p-1"
                    title="Delete link"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Link Modal */}
      {editingLink && onEditLink && (
        <EditLinkModal
          link={editingLink}
          onClose={() => setEditingLink(null)}
          onSave={onEditLink}
          isPremium={isPremium}
        />
      )}
    </div>
  );
}