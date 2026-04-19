// app/components/OptimizedImage.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
}

export default function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  width = 800, 
  height = 800,
  priority = false,
  quality = 80
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [error, setError] = useState(false);
  
  useEffect(() => {
    // Process image URL
    let processedUrl = src;
    
    // If it's a local filesystem path, use proxy
    if (src && (src.match(/^[A-Za-z]:\\/) || src.includes(':\\'))) {
      processedUrl = `/api/image-proxy?url=${encodeURIComponent(src)}`;
    } 
    // If it's a remote URL, use proxy for better performance and caching
    else if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
      // Only proxy external URLs to avoid CORS and improve caching
      if (!src.includes(window.location.hostname)) {
        processedUrl = `/api/image-proxy?url=${encodeURIComponent(src)}`;
      }
    }
    // For local public paths, use as is
    else if (src && !src.startsWith('/api/')) {
      processedUrl = src.startsWith('/') ? src : `/${src}`;
    }
    
    setImageSrc(processedUrl);
  }, [src]);
  
  if (!imageSrc || error) {
    // Return placeholder on error
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: width ? `${width}px` : 'auto', height: height ? `${height}px` : 'auto' }}
      >
        <span className="text-gray-400 text-sm">📷</span>
      </div>
    );
  }
  
  // Use Next.js Image for optimization
  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      quality={quality}
      onError={() => setError(true)}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}