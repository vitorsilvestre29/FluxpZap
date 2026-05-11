import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const typebotBaseUrl = process.env.TYPEBOT_BASE_URL;

    if (!typebotBaseUrl) return [];

    return [
      {
        source: '/_fluxo-builder/:path*',
        destination: `${typebotBaseUrl}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
