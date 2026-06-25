import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // next-mdx-remote 需要 transpilePackages 才能在 Turbopack 下正常工作
  transpilePackages: ['next-mdx-remote'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.notion.so',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
