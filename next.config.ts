// next.config.ts
import type { NextConfig } from "next";
module.exports = {
  allowedDevOrigins: ['192.168.1.26'],
}


const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],

  images: {
    // Allow all external domains (for development)
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
    // Allow local images
    localPatterns: [
      {
        pathname: '/images/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    dangerouslyAllowSVG: true,
    // Disable the image optimization for external URLs to avoid the proxy issue
    unoptimized: true,
  },

  compress: true,
  reactStrictMode: true,
  swcMinify: true,

  experimental: {
    optimizePackageImports: ['lucide-react', 'next-cloudinary'],
  },
};

export default nextConfig;