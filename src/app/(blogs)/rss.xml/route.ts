import RSS from 'rss';
import { getAllPosts, getPostBySlug } from '@/libs/content-loader';
import { mdToFeedHtml } from '@/libs/feed-supports';
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

    // summary 作摘要，content:encoded 输出全文 HTML
    const full = await getPostBySlug(post.slug);
    const html = full?.content ? mdToFeedHtml(full.content) : '';

    feed.item({
      title: post.title,
      description: post.summary || post.title,
      url: `${siteConfig.url}/posts/${post.slug}`,
      guid: `${siteConfig.url}/posts/${post.slug}`,
      date: post.date ?? new Date(0).toISOString(),
      categories: post.tags,
      ...(html && {
        custom_elements: [{ 'content:encoded': { _cdata: html } }],
      }),
    });
  }

  return new Response(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${siteConfig.rss.cacheMaxAge}, s-maxage=${siteConfig.rss.cacheMaxAge}`,
    },
  });
}
