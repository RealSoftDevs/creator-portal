// next.config.ts
import type { NextConfig } from "next";
module.exports = {
  allowedDevOrigins: ['192.168.1.26'],
}

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],

  // Configure images to allow external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    localPatterns: [
      {
        pathname: '/images/**',
      },
      {
        pathname: '/api/image-proxy/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    dangerouslyAllowSVG: true,
  },

  compress: true,
  reactStrictMode: true,

  // Remove swcMinify - it's not valid in Next.js 16

  experimental: {
    optimizePackageImports: ['lucide-react', 'next-cloudinary'],
  },
};

// Add allowedDevOrigins for network access
export const allowedDevOrigins = ['192.168.1.26'];

export default nextConfig;