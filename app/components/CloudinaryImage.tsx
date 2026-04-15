'use client';

import { CldImage } from 'next-cloudinary';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function CloudinaryImage({ src, alt, width = 400, height = 400, className = '' }: CloudinaryImageProps) {
  // Extract public ID from Cloudinary URL
  const getPublicId = (url: string) => {
    if (!url.includes('cloudinary')) return url;
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return `creator-portal/products/${filename.split('.')[0]}`;
  };

  // If it's not a Cloudinary URL, use regular img
  if (!src.includes('cloudinary')) {
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <CldImage
      src={getPublicId(src)}
      alt={alt}
      width={width}
      height={height}
      crop="fill"
      quality="auto"
      format="auto"
      className={className}
    />
  );
}