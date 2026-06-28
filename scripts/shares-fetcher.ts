import type { ShareMetadata } from './types';
import { createMdHandler } from './lib/md-handler';
import { fetchAllPages } from './lib/notion-client';

/**
 * 将 Notion 分享数据库的 page 映射为 ShareMetadata
 */
function mapSharePage(page: any): ShareMetadata {
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
    date: page.properties.date?.date?.start ?? page.last_edited_time,
    summary: page.properties.summary?.rich_text[0]?.plain_text ?? '',
    author: page.properties.author?.rich_text[0]?.plain_text,
    link: page.properties.link?.url,
    status: page.properties.status?.select?.name ?? 'published',
    last_fetch_time: page.properties.last_fetch_time?.date?.start ?? null,
  };
}

const toLocalMarkdown = createMdHandler<ShareMetadata>({
  contentDir: 'content/shares',
  media: {
    mediaDir: 'public/notion-images/shares',
    mediaUrlPath: '/notion-images/shares',
  },
  getFileKey: (item) => item.slug,
  generateContent: (meta, content) => {
    const fm: string[] = [];
    // 始终写出的字段
    fm.push(`title: "${meta.title.replace(/"/g, '\\"')}"`);
    fm.push(`slug: "${meta.slug}"`);
    fm.push(`date: "${meta.date ?? meta.last_edited_time}"`);
    if (meta.category) fm.push(`category: "${meta.category}"`);
    if (meta.tags?.length)
      fm.push(`tags: [${meta.tags.map((t) => `"${t}"`).join(', ')}]`);
    fm.push(`status: "${meta.status}"`);
    fm.push(`type: "${meta.type}"`);
    if (meta.author) fm.push(`author: "${meta.author}"`);
    if (meta.link) fm.push(`link: "${meta.link}"`);
    fm.push(`last_fetch_time: "${meta.last_fetch_time}"`);
    fm.push(`last_edited_time: "${meta.last_edited_time}"`);
    fm.push(`page_id: "${meta.page_id}"`);
    if (meta.summary) fm.push(`summary: "${meta.summary}"`);
    if (meta.cover) fm.push(`cover: "${meta.cover}"`);
    if (meta.icon) fm.push(`icon: "${meta.icon}"`);
    return `---\n${fm.join('\n')}\n---\n\n${content}`;
  },
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
