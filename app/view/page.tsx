// app/view/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { getTemplateById } from '@/lib/templates/index';
import PlatformIcon from '@/app/components/PlatformIcon';
import CloudinaryImage from '@/app/components/CloudinaryImage';
import { useEffect, useState, Suspense } from 'react';

// Define interfaces
interface SocialLink {
  id: string;
  title: string;
  url: string;
  platform?: string;
  iconUrl?: string;
  clicks?: number;
  order?: number;
}

interface Product {
  id: string;
  title: string;
  imageUrl: string;
  buyLink: string;
  price: string;
  platform: string;
  isDummy?: boolean;
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

function ViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get('slug');
  const [portal, setPortal] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) {
      setError(true);
      setLoading(false);
      return;
    }

    fetch(`/api/portal/public?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👁️ PUBLIC PAGE - Background Debug');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('backgroundType:', data.backgroundType);
        console.log('backgroundImage:', data.backgroundImage);
        console.log('primaryColor:', data.primaryColor);
        console.log('isPremium:', data.isPremium);
        console.log('customUsername:', data.customUsername);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (data.error) {
          setError(true);
          setLoading(false);
          return;
        }

        // If user is premium and has a custom username (different from slug), redirect
        if (data.isPremium && data.customUsername && data.customUsername !== slug) {
          console.log(`🔄 Redirecting premium user from slug to custom URL: /view/${data.customUsername}`);
          router.replace(`/view/${data.customUsername}`);
          return;
        }

        setPortal(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !portal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Portal Not Found</h1>
          <p className="text-gray-500 mt-2">This creator portal doesn't exist</p>
        </div>
      </div>
    );
  }

  const template = getTemplateById(portal.templateId || 'template1');
  const fontFamilyClass = portal.fontFamily || 'font-sans';

  // Build background style
  const backgroundStyle: React.CSSProperties = {};

  // Process background image URL if needed
  let backgroundImageUrl = portal.backgroundImage;
  if (backgroundImageUrl && !backgroundImageUrl.startsWith('http') && !backgroundImageUrl.startsWith('/')) {
    backgroundImageUrl = `/${backgroundImageUrl}`;
  }

  console.log('🎨 Applying background style:');
  console.log('  Type:', portal.backgroundType);
  console.log('  Image URL:', backgroundImageUrl);
  console.log('  Color:', portal.primaryColor);

  if (portal.backgroundType === 'image' && backgroundImageUrl) {
    backgroundStyle.backgroundImage = `url(${backgroundImageUrl})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
    backgroundStyle.backgroundAttachment = 'fixed';
    backgroundStyle.minHeight = '100vh';
    console.log('✅ Using background image');
  } else if (portal.backgroundType === 'gradient' && portal.gradientStart && portal.gradientEnd) {
    backgroundStyle.background = `linear-gradient(135deg, ${portal.gradientStart}, ${portal.gradientEnd})`;
    console.log('✅ Using gradient');
  } else {
    backgroundStyle.backgroundColor = portal.primaryColor || template.defaultBackground;
    console.log('✅ Using solid color:', backgroundStyle.backgroundColor);
  }

  const displayTextColor = portal.textColor || template.defaultTextColor;
  const customTextColorStyle = { color: displayTextColor };
  const socialAccounts = portal.links || [];
  const products = portal.products || [];

  return (
    <div className={`min-h-screen ${fontFamilyClass}`} style={backgroundStyle}>
      {/* Semi-transparent overlay for better text readability on image backgrounds */}
      {portal.backgroundType === 'image' && backgroundImageUrl && (
        <div className="fixed inset-0 bg-black/30 pointer-events-none" />
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

        {/* Product Gallery with Optimized Images */}
        {products.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={customTextColorStyle}>
              🖼️ Gallery
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {products.slice(0, 4).map((product) => (
                <a
                  key={product.id}
                  href={product.buyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group"
                >
                  <CloudinaryImage
                    src={product.imageUrl}
                    alt={product.title}
                    width={400}
                    height={400}
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

        {/* Social Links Section */}
        {socialAccounts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={customTextColorStyle}>
              🔗 Connect With Me
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
          <p>Powered by CreatorPortal</p>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function ViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <ViewContent />
    </Suspense>
  );
}