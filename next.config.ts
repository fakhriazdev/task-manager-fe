import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        },
      ],
    },
  ],
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
        destination: 'https://project-management-mje5.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
