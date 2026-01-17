import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint during build (last resort)
  eslint: {
    ignoreDuringBuilds: true
  },
  // Empty turbopack config to silence warnings
  turbopack: {}
};

export default nextConfig;
