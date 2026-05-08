// app/view/[username]/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getTemplateById } from '@/lib/templates/index';
import PlatformIcon from '@/app/components/PlatformIcon';
import { getCategoryById } from '@/lib/categories';

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
  description?: string;
  imageUrl: string;
  buyLink: string;
  price: string;
  platform: string;
  category?: string;
}

interface PortalData {
  title: string;
  bio: string;
  userName: string;
  displayName?: string;
  avatarUrl?: string;
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
  isPremium?: boolean;
  customUsername?: string | null;
}

// Platform background colors
const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    youtube: 'bg-red-600',
    tiktok: 'bg-black',
    facebook: 'bg-blue-600',
    twitter: 'bg-blue-400',
    x: 'bg-blue-400',
    linkedin: 'bg-blue-700',
    github: 'bg-gray-800',
    twitch: 'bg-purple-600',
    discord: 'bg-indigo-500',
    whatsapp: 'bg-green-500',
    telegram: 'bg-blue-500',
    amazon: 'bg-orange-500',
    myntra: 'bg-pink-600',
    flipkart: 'bg-blue-800',
    spotify: 'bg-green-600',
    apple: 'bg-black',
    snapchat: 'bg-yellow-400',
    pinterest: 'bg-red-700',
    reddit: 'bg-orange-600',
    email: 'bg-gray-500',
    phone: 'bg-green-500',
    website: 'bg-gray-600',
    linktree: 'bg-green-600'
  };
  return colors[platform.toLowerCase()] || 'bg-gray-600';
};

// Truncate text helper
const truncateText = (text: string, maxLength: number = 60) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Detect device type
const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return deviceType;
};

export default function UserViewPage() {
  const params = useParams();
  const username = params?.username as string;
  const [portal, setPortal] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const deviceType = useDeviceType();

  useEffect(() => {
    if (!username) {
      setError(true);
      setLoading(false);
      return;
    }

    fetch(`/api/portal/public?username=${encodeURIComponent(username)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(true);
        } else {
          setPortal(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !portal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Page Not Found</h1>
          <p className="text-gray-500 mt-2">This creator page doesn't exist</p>
        </div>
      </div>
    );
  }

  const template = getTemplateById(portal.templateId || 'template1');
  const fontFamilyClass = portal.fontFamily || 'font-sans';

  // Build background style
  const backgroundStyle: React.CSSProperties = {};

  let backgroundImageUrl = portal.backgroundImage;
  if (backgroundImageUrl && !backgroundImageUrl.startsWith('http') && !backgroundImageUrl.startsWith('/')) {
    backgroundImageUrl = `/${backgroundImageUrl}`;
  }

  if (portal.backgroundType === 'image' && backgroundImageUrl) {
    backgroundStyle.backgroundImage = `url(${backgroundImageUrl})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
    backgroundStyle.backgroundAttachment = deviceType === 'mobile' ? 'scroll' : 'fixed';
    backgroundStyle.minHeight = '100vh';
  } else if (portal.backgroundType === 'gradient' && portal.gradientStart && portal.gradientEnd) {
    backgroundStyle.background = `linear-gradient(135deg, ${portal.gradientStart}, ${portal.gradientEnd})`;
  } else {
    backgroundStyle.backgroundColor = portal.primaryColor || template.defaultBackground;
  }

  // Use display name
  const displayTitle = portal.displayName || (portal.title && portal.title !== 'My Creator Portal' ? portal.title : portal.userName);
  const displayBio = portal.bio || '';
  const displayTextColor = portal.textColor || template.defaultTextColor;
  const customTextColorStyle = { color: displayTextColor };
  const socialAccounts = portal.links || [];
  const products = portal.products || [];

  // Layout configuration
  const isMobile = deviceType === 'mobile';
  const productsPerRow = isMobile ? 2 : (deviceType === 'tablet' ? 3 : 4);
  const maxWidth = isMobile ? 'max-w-md' : 'max-w-6xl';

  return (
    <div className={`min-h-screen ${fontFamilyClass}`} style={backgroundStyle}>
      {portal.backgroundType === 'image' && backgroundImageUrl && (
        <div className="fixed inset-0 bg-black/30 pointer-events-none" />
      )}

      <div className={`relative z-10 ${maxWidth} mx-auto px-4 py-8 ${isMobile ? '' : 'px-6'}`}>
        {/* Profile Section */}
        <div className="text-center mb-10" style={customTextColorStyle}>
          <div className="relative inline-block">
            {portal.avatarUrl ? (
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden ring-4 ring-white/20 shadow-lg">
                <img
                  src={portal.avatarUrl}
                  alt={displayTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-28 h-28 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl shadow-lg';
                      fallback.textContent = displayTitle?.charAt(0).toUpperCase() || '👤';
                      parent.parentElement?.insertBefore(fallback, parent);
                      parent.remove();
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-28 h-28 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl shadow-lg">
                {displayTitle?.charAt(0).toUpperCase() || '👤'}
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold mt-4 mb-2">{displayTitle}</h1>

          {displayBio && (
            <div className="mt-3 max-w-lg mx-auto">
              <p className="text-base opacity-85 whitespace-pre-wrap leading-relaxed">
                {displayBio}
              </p>
            </div>
          )}
        </div>

        {/* Social Links Section */}
        {socialAccounts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 justify-center" style={customTextColorStyle}>
              <span className="text-xl">🔗</span> Connect With Me
              <span className="text-xs opacity-60">({socialAccounts.length})</span>
            </h2>
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
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
                    <span className="text-white/70 group-hover:translate-x-1 transition text-lg">→</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Product Gallery */}
        {products.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 justify-center" style={customTextColorStyle}>
              <span className="text-xl">🛍️</span> My Products
              <span className="text-xs opacity-60">({products.length})</span>
            </h2>

            <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${productsPerRow}, minmax(0, 1fr))` }}>
              {products.map((product) => {
                // Fix image URL - ensure it's absolute
                let imageUrl = product.imageUrl;
                if (imageUrl && imageUrl.startsWith('//')) {
                  imageUrl = 'https:' + imageUrl;
                }
                if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                  imageUrl = '/' + imageUrl;
                }

                const category = getCategoryById(product.category || 'misc');
                const categoryName = category?.name || '';
                const categoryIcon = category?.icon || '';

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    {/* Category Badge */}
                    {categoryName && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white flex items-center gap-1">
                          <span>{categoryIcon}</span>
                          <span>{categoryName}</span>
                        </div>
                      </div>
                    )}

                    <a href={product.buyLink} target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden">
                      <div className="relative w-full aspect-square bg-gray-100">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => {
                              console.error('Image failed to load:', imageUrl);
                              e.currentTarget.src = 'https://placehold.co/400x400?text=No+Image';
                              e.currentTarget.onerror = null;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🛍️</div>
                              <p className="text-xs text-gray-400">No image</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </a>

                    <div className="p-3 flex-1 flex flex-col">
                      <a href={product.buyLink} target="_blank" rel="noopener noreferrer">
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 hover:text-blue-600 transition">
                          {product.title}
                        </h3>
                      </a>

                      {product.price && (
                        <p className="text-lg font-bold text-green-600 mt-1">{product.price}</p>
                      )}

                      {product.description && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                            {product.description}
                          </p>
                        </div>
                      )}

                      <div className="mt-3">
                        <a
                          href={product.buyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white text-sm font-medium py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          Shop Now →
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-6 border-t border-white/20 text-xs opacity-60" style={customTextColorStyle}>
          <p>© {new Date().getFullYear()} {displayTitle} • Powered by CreatorPortal</p>
        </div>
      </div>
    </div>
  );
}