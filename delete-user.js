// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],

  // Ensure static files are served correctly
  images: {
    domains: ['localhost'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },

  // Allow serving static files from public directory
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ];
  },

  compress: true,
  reactStrictMode: true,
  swcMinify: true,

  experimental: {
    optimizePackageImports: ['lucide-react', 'next-cloudinary'],
  },
};

module.exports = {
  allowedDevOrigins: ['192.168.1.32'],
  ...nextConfig,
};

export default nextConfig;