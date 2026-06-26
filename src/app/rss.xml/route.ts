import RSS from 'rss';
import { getAllPosts } from '@/libs/content-loader';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://shenjuehan.dev';
const SITE_TITLE = '和光同尘';
const SITE_DESCRIPTION = '个人主页 - 记录生活与技术';

export async function GET() {
  const posts = await getAllPosts();

  const feed = new RSS({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site_url: SITE_URL,
    feed_url: `${SITE_URL}/rss.xml`,
    language: 'zh-CN',
    pubDate: new Date().toISOString(),
  });

  for (const post of posts) {
    if (post.status !== 'published') continue;

    feed.item({
      title: post.title,
      description: post.summary || post.title,
      url: `${SITE_URL}/posts/${post.slug}`,
      guid: `${SITE_URL}/posts/${post.slug}`,
      date: post.date,
      categories: post.tags,
    });
  }

  return new Response(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
