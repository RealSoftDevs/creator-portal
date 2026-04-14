import type { NextConfig } from "next";
module.exports = {
  allowedDevOrigins: ['192.168.1.32'],
}

const nextConfig: NextConfig = {

  serverExternalPackages: ['@prisma/client'],
  // In Next.js 15+, allowedDevOrigins is part of experimental.serverActions or similar
  // but for simple dev origin allow-listing:
  experimental: {
  },
};

export default nextConfig;
