import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://task-manager-sms6.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
