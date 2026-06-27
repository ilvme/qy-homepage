import type { PostMetadata } from '../types';
import { createMdHandler } from './md-handler';
import { fetchAllPages } from './notion-client';

/**
 * 将 Notion 原始 page 对象映射为 PostMetadata
 */
export function mapArticlePage(page: any): PostMetadata {
  const coverUrl =
    page.cover?.type === 'external' ? page.cover.external.url : undefined;
  const iconUrl =
    page.icon?.type === 'external' ? page.icon.external.url : undefined;

  return {
    page_id: page.id,
    last_edited_time: page.last_edited_time,
    cover: coverUrl,
    icon: iconUrl,

    title: page.properties.title.title[0].plain_text,
    type: page.properties.type.select?.name,
    slug: page.properties.slug.rich_text[0].plain_text,
    category: page.properties.category.select?.name,
    tags: page.properties.tags.multi_select.map(
      (tag: { name: string }) => tag.name,
    ),
    date: page.properties.date.date?.start,
    summary: page.properties.summary.rich_text[0]?.plain_text,
    status: page.properties.status.select?.name,
    last_fetch_time: page.properties.last_fetch_time.date?.start,
  };
}

/**
 * 生成 MD 文件内容（frontmatter + 正文）
 */
export function generateMdContent(postMeta: PostMetadata, content: string) {
  return `---
title: "${postMeta.title.replace(/"/g, '\\"')}"
slug: "${postMeta.slug}"
date: "${postMeta.date}"
category: "${postMeta.category}"
tags: [${postMeta.tags.map((tag) => `"${tag}"`).join(', ')}]
status: "${postMeta.status}"
type: "${postMeta.type}"
last_fetch_time: "${postMeta.last_fetch_time}"
last_edited_time: "${postMeta.last_edited_time}"
page_id: "${postMeta.page_id}"
summary: "${postMeta.summary ?? ''}"
cover: "${postMeta.cover ?? ''}"
icon: "${postMeta.icon ?? ''}"
---

${content}`;
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
    generateContent: generateMdContent,
  });
}
