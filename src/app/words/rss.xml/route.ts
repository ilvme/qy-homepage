import RSS from 'rss';
import { mdToFeedHtml, plainText } from '@/libs/feed-supports';
import { getAllWords } from '@/libs/words-loader';
import { siteConfig } from '@/site.config';

/** feed 条数上限，避免全量输出过大 */
const MAX_ITEMS = 50;

export async function GET() {
  const words = await getAllWords();

  const feed = new RSS({
    title: `${siteConfig.title} · 说说`,
    description: '碎片化的思考与记录',
    site_url: `${siteConfig.url}/words`,
    feed_url: `${siteConfig.url}${siteConfig.rss.wordsPath}`,
    language: 'zh-CN',
    pubDate: new Date().toISOString(),
  });

  // getAllWords 已按时间倒序、过滤未来日期；索引对应列表分页位置
  const pageSize = siteConfig.pagination.wordsPageSize;

  words.slice(0, MAX_ITEMS).forEach((word, index) => {
    const meta = word.postMeta;
    const text = plainText(word.content ?? '');

    // 链接直达该条说说所在的分页
    const page = Math.floor(index / pageSize) + 1;
    const url = `${siteConfig.url}/words?page=${page}`;
    const date =
      meta.date ?? meta.last_edited_time ?? new Date(0).toISOString();

    feed.item({
      title: text.length > 40 ? `${text.slice(0, 40)}…` : text || date,
      description: text.length > 120 ? `${text.slice(0, 120)}…` : text,
      url,
      guid: `${url}#${meta.page_id}`,
      date,
      categories: meta.tags,
      custom_elements: [
        { 'content:encoded': { _cdata: mdToFeedHtml(word.content ?? '') } },
      ],
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${siteConfig.rss.cacheMaxAge}, s-maxage=${siteConfig.rss.cacheMaxAge}`,
    },
  });
}
