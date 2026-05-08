// app/components/OptimizedImage.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  priority = false,
  quality = 75,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');

  useEffect(() => {
    if (!src) {
      setError(true);
      return;
    }

    // Optimize Cloudinary URLs
    if (src.includes('cloudinary.com')) {
      const url = new URL(src);
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('f', 'auto');
      url.searchParams.set('w', width.toString());
      url.searchParams.set('h', height.toString());
      url.searchParams.set('c', 'limit');
      setOptimizedSrc(url.toString());
    }
    // Proxy external images
    else if (src.startsWith('http')) {
      setOptimizedSrc(`/api/image-proxy?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`);
    }
    else {
      setOptimizedSrc(src);
    }
  }, [src, width, height, quality]);

  if (error || !optimizedSrc) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs text-gray-400 mt-1">No image</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} transition-opacity duration-300`}
        priority={priority}
        quality={quality}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        onError={() => setError(true)}
      />
    </div>
  );
}