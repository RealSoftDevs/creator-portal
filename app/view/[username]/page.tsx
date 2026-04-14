'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTemplateById } from '@/lib/templates/index';
import PlatformIcon from '@/app/components/PlatformIcon';

interface SocialLink {
  id: string;
  title: string;
  url: string;
  platform?: string;
  iconUrl?: string;
}

interface Product {
  id: string;
  title: string;
  imageUrl: string;
  buyLink: string;
  price: string;
  platform: string;
}

interface PortalData {
  title: string;
  bio: string;
  userName: string;
  slug: string;
  links: SocialLink[];
  products: Product[];
  templateId?: string;
  primaryColor?: string;
  backgroundImage?: string;
  backgroundType?: string;
  gradientStart?: string;
  gradientEnd?: string;
  textColor?: string;
  fontFamily?: string;
}

// Platform background colors
const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    instagram: 'bg-[#E4405F]',
    youtube: 'bg-[#FF0000]',
    tiktok: 'bg-[#000000]',
    facebook: 'bg-[#1877F2]',
    twitter: 'bg-[#000000]',
    x: 'bg-[#000000]',
    linkedin: 'bg-[#0A66C2]',
    github: 'bg-[#181717]',
    twitch: 'bg-[#9146FF]',
    discord: 'bg-[#5865F2]',
    whatsapp: 'bg-[#25D366]',
    telegram: 'bg-[#26A5E4]',
    amazon: 'bg-[#FF9900]',
    myntra: 'bg-[#E91E63]',
    flipkart: 'bg-[#2874F0]',
    spotify: 'bg-[#1DB954]',
    apple: 'bg-[#000000]',
    snapchat: 'bg-[#FFFC00]',
    pinterest: 'bg-[#BD081C]',
    reddit: 'bg-[#FF4500]',
    email: 'bg-[#D14836]',
    phone: 'bg-[#25D366]',
    website: 'bg-[#6B7280]',
    linktree: 'bg-[#39E09B]'
  };
  return colors[platform.toLowerCase()] || 'bg-gray-600';
};

export default function UserViewPage() {
  const params = useParams();
  const username = params?.username as string;
  const [portal, setPortal] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!username) {
      setError(true);
      setLoading(false);
      return;
    }

    // First try to find by username (premium custom URL)
    fetch(`/api/portal/public?username=${encodeURIComponent(username)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          // If not found, try by slug (free tier fallback)
          fetch(`/api/portal/public?slug=${encodeURIComponent(username)}`)
            .then(res2 => res2.json())
            .then(data2 => {
              if (data2.error) {
                setError(true);
              } else {
                setPortal(data2);
              }
              setLoading(false);
            });
        } else {
          setPortal(data);
          setLoading(false);
        }
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !portal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Page Not Found</h1>
          <p className="text-gray-500 mt-2">This creator page doesn't exist</p>
        </div>
      </div>
    );
  }

  const template = getTemplateById(portal.templateId || 'template1');
  const fontFamilyClass = portal.fontFamily || 'font-sans';

  const backgroundStyle: React.CSSProperties = {};

  if (portal.backgroundType === 'gradient' && portal.gradientStart && portal.gradientEnd) {
    backgroundStyle.background = `linear-gradient(135deg, ${portal.gradientStart}, ${portal.gradientEnd})`;
  } else if (portal.backgroundType === 'image' && portal.backgroundImage) {
    backgroundStyle.backgroundImage = `url(${portal.backgroundImage})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
    backgroundStyle.backgroundAttachment = 'fixed';
  } else {
    backgroundStyle.backgroundColor = portal.primaryColor || template.defaultBackground;
  }

  const customTextColorStyle = { color: portal.textColor || template.defaultTextColor };
  const socialAccounts = portal.links || [];
  const products = portal.products || [];

  return (
    <div className={`min-h-screen ${fontFamilyClass}`} style={backgroundStyle}>
      {portal.backgroundImage && (
        <div className="fixed inset-0 bg-black/40 pointer-events-none" />
      )}

      <div className="relative z-10 max-w-md mx-auto px-4 py-8">
        {/* Profile Section */}
        <div className="text-center mb-8" style={customTextColorStyle}>
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl mb-3 shadow-lg">
            {portal.userName?.charAt(0).toUpperCase() || '👤'}
          </div>
          <h1 className="text-2xl font-bold">{portal.title || portal.userName}</h1>
          {portal.bio && (
            <p className="mt-2 text-sm opacity-80">{portal.bio}</p>
          )}
        </div>

        {/* Gallery Section */}
        {products.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={customTextColorStyle}>
              🖼️ Gallery
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <a
                  key={product.id}
                  href={product.buyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="p-2">
                    <div className="font-medium text-sm truncate text-gray-900">{product.title}</div>
                    {product.price && <div className="text-xs text-green-600 font-semibold">{product.price}</div>}
                    <div className="text-xs text-blue-500 mt-1">Shop now →</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Links Section */}
        {socialAccounts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={customTextColorStyle}>
              🔗 Links
            </h2>
            <div className="space-y-3">
              {socialAccounts.map((link) => {
                const platform = link.title?.toLowerCase() || '';
                const bgColor = getPlatformColor(platform);

                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${bgColor} rounded-xl p-4 text-white flex items-center gap-3 hover:scale-[1.02] transition-transform shadow-sm group`}
                  >
                    <PlatformIcon
                      platform={platform}
                      customIconUrl={link.iconUrl}
                      className="w-6 h-6"
                    />
                    <span className="flex-1 font-medium">{link.title}</span>
                    <span className="text-white/70 group-hover:translate-x-1 transition">→</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-xs opacity-60" style={customTextColorStyle}>
          <p>Powered by cre8tive</p>
        </div>
      </div>
    </div>
  );
}