import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://task-manager-rose-gamma.vercel.app//api/:path*',
      },
    ];
  },
};

export default nextConfig;
