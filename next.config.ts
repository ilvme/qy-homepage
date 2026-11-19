import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // 博客圈标识直接引用官方托管的图，不存本地副本：
    // 标识的意义就是「我是这个圈子的成员」，官方换图时跟着变，也不会有一份
    // 没人记得更新的旧副本。pathname 收窄到各自的 logo 目录，避免优化器
    // 被当成任意远程图片的代理。
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.foreverblog.cn',
        pathname: '/assets/logo/**',
      },
      {
        protocol: 'https',
        hostname: 'www.boyouquan.com',
        pathname: '/assets/images/sites/logo/**',
      },
    ],
  },
};

export default nextConfig;
