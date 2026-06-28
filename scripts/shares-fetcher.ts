import type { PostMetadata } from './types';
import { generateMdContent } from './lib/article-utils';
import { createMdHandler } from './lib/md-handler';
import { fetchAllPages } from './lib/notion-client';

/**
 * 将 Notion 分享数据库的 page 映射为 PostMetadata
 */
function mapSharePage(page: any): PostMetadata {
  const coverUrl =
    page.cover?.type === 'external' ? page.cover.external.url : undefined;
  const iconUrl =
    page.icon?.type === 'external' ? page.icon.external.url : undefined;

  return {
    page_id: page.id,
    last_edited_time: page.last_edited_time,
    cover: coverUrl,
    icon: iconUrl,

    title: page.properties.title?.title[0]?.plain_text ?? '',
    type: 'share',
    slug:
      page.properties.slug?.rich_text[0]?.plain_text ||
      page.id.replace(/-/g, ''),
    category: page.properties.category?.select?.name ?? '',
    tags:
      page.properties.tags?.multi_select?.map(
        (tag: { name: string }) => tag.name,
      ) ?? [],
    date:
      page.properties.date?.date?.start ?? page.last_edited_time,
    summary: page.properties.summary?.rich_text[0]?.plain_text ?? '',
    status: page.properties.status?.select?.name ?? 'published',
    last_fetch_time:
      page.properties.last_fetch_time?.date?.start ?? null,
  };
}

const toLocalMarkdown = createMdHandler<PostMetadata>({
  contentDir: 'content/shares',
  media: {
    mediaDir: 'public/notion-images/shares',
    mediaUrlPath: '/notion-images/shares',
  },
  getFileKey: (item) => item.slug,
  generateContent: generateMdContent,
});

export async function fetchShares() {
  const databaseId = process.env.NOTION_SHARE_DATABASE_ID;
  if (!databaseId) {
    console.log('[Shares] NOTION_SHARE_DATABASE_ID not set, skipping.');
    return;
  }

  console.log('[Shares] Fetching from Notion...');
  const items = await fetchAllPages(databaseId, mapSharePage, {
    filter: { property: 'status', select: { equals: 'published' } },
    sorts: [{ property: 'date', direction: 'descending' }],
  });

  if (!items || items.length === 0) {
    console.log('[Shares] No items found.');
    return;
  }

  console.log(`[Shares] Found ${items.length} items...\n`);
  await toLocalMarkdown(items);
}

export async function main() {
  await fetchShares();
}

// 支持独立运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
