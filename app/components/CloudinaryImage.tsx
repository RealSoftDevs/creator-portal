// app/components/CloudinaryImage.tsx
'use client';

import { CldImage } from 'next-cloudinary';
import { useState, useEffect } from 'react';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
}

export default function CloudinaryImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  priority = false,
  quality = 80
}: CloudinaryImageProps) {
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset when src changes
    setError(false);
    setImageSrc(src);
    setIsLoading(true);
  }, [src]);

  // For local images (JPG, PNG, etc. from public folder)
  if (src && (src.startsWith('/images/') || src.startsWith('/api/') || src.match(/\.(jpg|jpeg|png|gif|webp)$/i))) {
    return (
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => {
            console.log(`✅ Image loaded successfully: ${src}`);
            setIsLoading(false);
          }}
          onError={(e) => {
            console.error(`Failed to load image: ${src}`);
            setError(true);
            setIsLoading(false);
            // Try to use a fallback
            setImageSrc(`https://placehold.co/${width}x${height}?text=${encodeURIComponent(alt || 'Image')}`);
          }}
        />
      </div>
    );
  }

  // For external URLs (like Cloudinary, Unsplash, etc.)
  if (src && (src.startsWith('http') || src.startsWith('https')) && !error) {
    return (
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => {
            console.log(`✅ External image loaded: ${src.substring(0, 100)}`);
            setIsLoading(false);
          }}
          onError={() => {
            console.error(`Failed to load external image: ${src}`);
            setError(true);
            setIsLoading(false);
            setImageSrc(`https://placehold.co/${width}x${height}?text=${encodeURIComponent(alt || 'Image')}`);
          }}
        />
      </div>
    );
  }

  // For data URLs (base64)
  if (src && src.startsWith('data:image')) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        onError={() => setError(true)}
      />
    );
  }

  // For Cloudinary images
  if (src && src.includes('cloudinary.com') && !error) {
    const getPublicId = (url: string): string | null => {
      try {
        const urlParts = url.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex === -1) return null;

        let startIndex = uploadIndex + 1;
        if (urlParts[startIndex] && urlParts[startIndex].startsWith('v')) {
          startIndex++;
        }

        const publicIdWithExt = urlParts.slice(startIndex).join('/');
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
        return publicId;
      } catch (err) {
        console.error('Error extracting public ID:', err);
        return null;
      }
    };

    const publicId = getPublicId(src);

    if (publicId) {
      return (
        <div className="relative w-full h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          <CldImage
            src={publicId}
            alt={alt}
            width={width}
            height={height}
            quality={quality}
            format="auto"
            loading={priority ? 'eager' : 'lazy'}
            className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            onLoad={() => {
              console.log(`✅ Cloudinary image loaded: ${publicId}`);
              setIsLoading(false);
            }}
            onError={() => {
              console.error(`Failed to load Cloudinary image: ${publicId}`);
              setError(true);
              setIsLoading(false);
            }}
          />
        </div>
      );
    }
  }

  // Fallback placeholder
  return (
    <div
      className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}
      style={{ width: width ? `${width}px` : 'auto', height: height ? `${height}px` : 'auto', minHeight: '100px' }}
    >
      <div className="text-center">
        <div className="text-4xl mb-1">🛍️</div>
        <p className="text-xs text-gray-400">{alt || 'Product image'}</p>
      </div>
    </div>
  );
}