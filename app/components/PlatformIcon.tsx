'use client';

import { useState } from 'react';

interface PlatformIconProps {
  platform: string;
  customIconUrl?: string;
  className?: string;
}

// Official Simple Icons CDN URLs
const getIconUrl = (platform: string): string => {
  const normalized = platform.toLowerCase();
  
  const iconMap: Record<string, string> = {
    instagram: 'https://cdn.simpleicons.org/instagram/ffffff',
    youtube: 'https://cdn.simpleicons.org/youtube/ffffff',
    tiktok: 'https://cdn.simpleicons.org/tiktok/ffffff',
    facebook: 'https://cdn.simpleicons.org/facebook/ffffff',
    twitter: 'https://cdn.simpleicons.org/x/ffffff',
    x: 'https://cdn.simpleicons.org/x/ffffff',
    linkedin: 'https://cdn.simpleicons.org/linkedin/ffffff',
    github: 'https://cdn.simpleicons.org/github/ffffff',
    twitch: 'https://cdn.simpleicons.org/twitch/ffffff',
    discord: 'https://cdn.simpleicons.org/discord/ffffff',
    whatsapp: 'https://cdn.simpleicons.org/whatsapp/ffffff',
    telegram: 'https://cdn.simpleicons.org/telegram/ffffff',
    amazon: 'https://cdn.simpleicons.org/amazon/ffffff',
    myntra: 'https://img.icons8.com/color/48/myntra.png',
    flipkart: 'https://img.icons8.com/color/48/flipkart.png',
    spotify: 'https://cdn.simpleicons.org/spotify/ffffff',
    apple: 'https://cdn.simpleicons.org/apple/ffffff',
    snapchat: 'https://cdn.simpleicons.org/snapchat/000000',
    pinterest: 'https://cdn.simpleicons.org/pinterest/ffffff',
    reddit: 'https://cdn.simpleicons.org/reddit/ffffff',
    email: 'https://cdn.simpleicons.org/gmail/ffffff',
    gmail: 'https://cdn.simpleicons.org/gmail/ffffff',
    outlook: 'https://cdn.simpleicons.org/microsoftoutlook/ffffff',
    phone: 'https://cdn.simpleicons.org/whatsapp/ffffff',
    linktree: 'https://cdn.simpleicons.org/linktree/ffffff',
    website: 'https://cdn.simpleicons.org/globe/ffffff'
  };
  
  return iconMap[normalized] || 'https://cdn.simpleicons.org/link/ffffff';
};

export default function PlatformIcon({ platform, customIconUrl, className = 'w-6 h-6' }: PlatformIconProps) {
  const [hasError, setHasError] = useState(false);
  
  // Use custom icon if provided, otherwise use CDN
  const iconUrl = customIconUrl || getIconUrl(platform);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      console.error(`❌ ICON FAILED TO LOAD: ${platform}`);
      console.error(`   URL: ${iconUrl}`);
      console.error(`   Link title: ${platform}`);
    }
  };

  if (hasError) {
    return null;
  }

  return (
    <img
      src={iconUrl}
      alt={platform}
      className={className}
      onError={handleError}
    />
  );
}