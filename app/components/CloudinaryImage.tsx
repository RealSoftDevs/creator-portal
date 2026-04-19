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

  useEffect(() => {
    // Reset error when src changes
    setError(false);
    setImageSrc(src);
  }, [src]);

  // For local images (JPG, PNG, etc. from public folder)
  if (src && (src.startsWith('/images/') || src.startsWith('/api/')) && !error) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        onError={(e) => {
          console.error(`Failed to load image: ${src}`);
          setError(true);
          // Try to use a fallback
          setImageSrc('https://placehold.co/400x400?text=Image+Not+Found');
        }}
        onLoad={() => {
          console.log(`✅ Image loaded successfully: ${src}`);
        }}
      />
    );
  }

  // For non-Cloudinary images or when there's an error
  if (!src || (!src.includes('cloudinary.com') && !src.startsWith('data:image')) || error) {
    // Return a nice placeholder with the product name
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

  // For data URLs (base64)
  if (src.startsWith('data:image')) {
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

  if (!publicId) {
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

  return (
    <CldImage
      src={publicId}
      alt={alt}
      width={width}
      height={height}
      quality={quality}
      format="auto"
      loading={priority ? 'eager' : 'lazy'}
      className={className}
      onError={() => {
        console.error(`Failed to load Cloudinary image: ${publicId}`);
        setError(true);
      }}
    />
  );
}