import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vhoqg7ntpng7mxpr.public.blob.vercel-storage.com",
        pathname: "/**", // allow semua path
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:1000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
