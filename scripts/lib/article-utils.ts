import type { PostMetadata } from '../types';
import { createMdHandler } from './md-handler';
import { fetchAllPages } from './notion-client';

/**
 * 将 Notion 原始 page 对象映射为 PostMetadata
 */
export function mapArticlePage(page: any): PostMetadata {
  const coverObj = page.cover;
  let coverUrl: string | undefined;
  if (coverObj) {
    coverUrl =
      coverObj.type === 'external'
        ? coverObj.external?.url
        : coverObj.file?.url;
  }

  const iconObj = page.icon;
  let iconUrl: string | undefined;
  if (iconObj) {
    iconUrl =
      iconObj.type === 'external' ? iconObj.external?.url : iconObj.file?.url;
  }

  return {
    page_id: page.id,
    last_edited_time: page.last_edited_time,
    cover: coverUrl,
    icon: iconUrl,

    title: page.properties.title.title[0].plain_text,
    type: page.properties.type.select?.name,
    slug: page.properties.slug.rich_text[0].plain_text,
    category: page.properties.category.select?.name,
    tags: page.properties.tags?.multi_select?.map(
      (tag: { name: string }) => tag.name,
    ),
    date: page.properties.date?.date?.start ?? page.created_time,
    summary: page.properties.summary.rich_text[0]?.plain_text,
    status: page.properties.status.select?.name,
    last_fetch_time: page.properties.last_fetch_time.date?.start,
  };
}

/**
 * 获取并校验 articles 数据库 ID
 */
export function getArticlesDatabaseId(): string {
  if (!process.env.NOTION_ARTICLES_DATABASE_ID) {
    console.error('Error: NOTION_ARTICLES_DATABASE_ID is not set in .env');
    process.exit(1);
  }
  return process.env.NOTION_ARTICLES_DATABASE_ID;
}

/**
 * 按 type 拉取并写入本地
 */
export async function fetchByType(
  type: string,
  handler: (items: PostMetadata[]) => Promise<void>,
  label: string,
) {
  const databaseId = getArticlesDatabaseId();

  console.log(`[${label}] Fetching from Notion (type: "${type}")...`);
  const items = await fetchAllPages(databaseId, mapArticlePage, {
    filter: {
      and: [
        { property: 'status', select: { equals: 'published' } },
        { property: 'type', select: { equals: type } },
      ],
    },
    sorts: [{ property: 'date', direction: 'descending' }],
  });

  if (!items || items.length === 0) {
    console.log(`[${label}] No items found.`);
    return;
  }

  console.log(`[${label}] Found ${items.length} items...\n`);
  await handler(items);
}

/**
 * 创建针对特定输出目录的 handler
 */
export function createHandler(
  contentDir: string,
  mediaDir: string,
  mediaUrlPath: string,
) {
  return createMdHandler<PostMetadata>({
    contentDir,
    media: { mediaDir, mediaUrlPath },
    getFileKey: (item) => item.slug,
    generateContent: (meta, content) => {
      const fm: string[] = [];
      fm.push(`title: "${meta.title.replace(/"/g, '\\"')}"`);
      fm.push(`slug: "${meta.slug}"`);
      fm.push(`date: "${meta.date ?? meta.last_edited_time}"`);
      if (meta.category) fm.push(`category: "${meta.category}"`);
      if (meta.tags?.length)
        fm.push(`tags: [${meta.tags.map((t) => `"${t}"`).join(', ')}]`);
      fm.push(`status: "${meta.status}"`);
      fm.push(`type: "${meta.type}"`);
      fm.push(`last_fetch_time: "${meta.last_fetch_time}"`);
      fm.push(`last_edited_time: "${meta.last_edited_time}"`);
      fm.push(`page_id: "${meta.page_id}"`);
      if (meta.summary) fm.push(`summary: "${meta.summary}"`);
      if (meta.cover) fm.push(`cover: "${meta.cover}"`);
      if (meta.icon) fm.push(`icon: "${meta.icon}"`);
      return `---\n${fm.join('\n')}\n---\n\n${content}`;
    },
  });
}
