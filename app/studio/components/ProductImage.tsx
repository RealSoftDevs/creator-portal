// app/studio/components/ProductImage.tsx
'use client';

import { useState, useEffect } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function ProductImage({ src, alt, className = '', priority = false }: ProductImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    setError(false);
    setLoaded(false);

    // Handle empty or invalid src
    if (!src || src === '' || src === 'null' || src === 'undefined') {
      setError(true);
      setLoaded(true);
      setImgSrc(null);
      return;
    }

    // Handle different image URL formats
    let finalUrl = src;

    try {
      // Fix relative URLs from Amazon
      if (src.startsWith('//')) {
        finalUrl = 'https:' + src;
      }
      // Fix missing protocol (but not data URLs or local paths)
      else if (!src.startsWith('http') && !src.startsWith('/') && !src.startsWith('data:') && !src.startsWith('blob:')) {
        finalUrl = `/images/products/${src}`;
      }
      // Handle absolute paths
      else if (src.startsWith('/')) {
        finalUrl = src;
      }

      setImgSrc(finalUrl);
    } catch (err) {
      console.error('Error processing image URL:', err);
      setError(true);
      setLoaded(true);
      setImgSrc(null);
    }
  }, [src]);

  // Don't render img if src is invalid
  if (error || !src || src === '' || src === 'null' || src === 'undefined' || !imgSrc) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-3xl">🛍️</div>
          <p className="text-xs text-gray-400">No image</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 object-cover`}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          console.error(`Failed to load image: ${src}`);
          setError(true);
          setLoaded(true);
        }}
      />
    </div>
  );
}