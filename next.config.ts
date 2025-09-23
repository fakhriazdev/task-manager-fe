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
        destination: 'https://project-manager-2u5p.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
