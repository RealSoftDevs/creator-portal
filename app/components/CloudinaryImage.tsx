// app/components/CloudinaryImage.tsx
'use client';

import { CldImage } from 'next-cloudinary';
import { useState } from 'react';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  crop?: 'fill' | 'fit' | 'auto' | 'crop' | 'scale' | 'limit' | 'mfit' | 'lfill' | 'pad' | 'lpad' | 'mpad' | 'thumb' | 'imagga_crop' | 'imagga_scale' | 'fill_pad';
}

export default function CloudinaryImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  priority = false,
  quality = 80,
  crop = 'fill'
}: CloudinaryImageProps) {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(src);

  // Extract public ID from various Cloudinary URL formats
  const getPublicId = (url: string): string | null => {
    if (!url || !url.includes('cloudinary.com')) return null;

    try {
      // Handle different Cloudinary URL formats:
      // Format 1: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/creator-portal/products/abc123.jpg
      // Format 2: https://res.cloudinary.com/cloud_name/image/upload/creator-portal/products/abc123.jpg

      const urlParts = url.split('/');
      // Find the upload marker position
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) return null;

      // Get the part after 'upload' (skip version number if present)
      let startIndex = uploadIndex + 1;
      if (urlParts[startIndex] && urlParts[startIndex].startsWith('v')) {
        startIndex++; // Skip version number like v1234567890
      }

      // Get the remaining path
      const publicIdWithExt = urlParts.slice(startIndex).join('/');
      // Remove file extension
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');

      return publicId;
    } catch (err) {
      console.error('Error extracting public ID:', err);
      return null;
    }
  };

  // For non-Cloudinary images or when there's an error
  if (!src || (!src.includes('cloudinary.com') && !src.startsWith('data:image')) || error) {
    // Return placeholder for broken images
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width: width ? `${width}px` : 'auto', height: height ? `${height}px` : 'auto', minHeight: '100px' }}
      >
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs text-gray-400 mt-1">Image not found</p>
        </div>
      </div>
    );
  }

  // For data URLs (base64) or external URLs
  if (src.startsWith('data:image') || (src.startsWith('http') && !src.includes('cloudinary.com'))) {
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
  const publicId = getPublicId(src);

  if (!publicId) {
    // Fallback to regular img if can't extract public ID
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

  // Use Cloudinary for optimized delivery
  return (
    <CldImage
      src={publicId}
      alt={alt}
      width={width}
      height={height}
      crop={crop}
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