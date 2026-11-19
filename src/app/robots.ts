import type { MetadataRoute } from 'next';
import { siteConfig } from '@/site.config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // 彩蛋页与发布接口不走搜索索引；Web 发布页已移除，接口仍供快捷指令调用
        disallow: ['/caidan', '/api/'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
