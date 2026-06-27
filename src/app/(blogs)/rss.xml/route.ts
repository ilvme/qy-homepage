import RSS from 'rss';
import { getAllPosts } from '@/libs/content-loader';
import { siteConfig } from '@/site.config';

export async function GET() {
  const posts = await getAllPosts();

  const feed = new RSS({
    title: siteConfig.title,
    description: siteConfig.description,
    site_url: siteConfig.url,
    feed_url: `${siteConfig.url}${siteConfig.rss.path}`,
    language: 'zh-CN',
    pubDate: new Date().toISOString(),
  });

  for (const post of posts) {
    if (post.status !== 'published') continue;

    feed.item({
      title: post.title,
      description: post.summary || post.title,
      url: `${siteConfig.url}/posts/${post.slug}`,
      guid: `${siteConfig.url}/posts/${post.slug}`,
      date: post.date,
      categories: post.tags,
    });
  }

  return new Response(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${siteConfig.rss.cacheMaxAge}, s-maxage=${siteConfig.rss.cacheMaxAge}`,
    },
  });
}
