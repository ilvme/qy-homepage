import RSS from 'rss';
import { WORDS_DESCRIPTION } from '@/app/words/_meta';
import { mdToFeedHtml, plainText } from '@/libs/feed-supports';
import { getAllWords } from '@/libs/words-loader';
import { siteConfig } from '@/site.config';

export async function GET() {
  const words = await getAllWords();

  const feed = new RSS({
    title: `${siteConfig.title} · 说说`,
    description: WORDS_DESCRIPTION,
    site_url: `${siteConfig.url}/words`,
    feed_url: `${siteConfig.url}${siteConfig.rss.wordsPath}`,
    language: siteConfig.language,
    pubDate: new Date().toISOString(),
  });

  // getAllWords 已按时间倒序、过滤未来日期；索引对应列表分页位置
  const pageSize = siteConfig.pagination.wordsPageSize;

  words.slice(0, siteConfig.rss.wordsMaxItems).forEach((word, index) => {
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
