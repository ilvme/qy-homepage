import type { PostMetadata } from './types';
import { fetchAllPages } from './lib/notion-client';
import { createMdHandler } from './lib/md-handler';

/**
 * 将 Notion 原始 page 对象映射为 PostMetadata
 */
function mapArticlePage(page: any): PostMetadata {
  const coverUrl =
    page.cover?.type === 'external'
      ? page.cover.external.url
      : undefined;
  const iconUrl =
    page.icon?.type === 'external'
      ? page.icon.external.url
      : undefined;

  return {
    page_id: page.id,
    last_edited_time: page.last_edited_time,
    cover: coverUrl,
    icon: iconUrl,

    title: page.properties.title.title[0].plain_text,
    type: page.properties.type.select?.name,
    slug: page.properties.slug.rich_text[0].plain_text,
    category: page.properties.category.select?.name,
    tags: page.properties.tags.multi_select.map((tag: { name: string }) => tag.name),
    date: page.properties.date.date?.start,
    summary: page.properties.summary.rich_text[0]?.plain_text,
    status: page.properties.status.select?.name,
    last_fetch_time: page.properties.last_fetch_time.date?.start,
  };
}

/**
 * 生成文章 MD 文件内容（frontmatter + 正文）
 */
export function generateArticleMdContent(
  postMeta: PostMetadata,
  content: string,
) {
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

const toLocalMarkdown = createMdHandler<PostMetadata>({
  contentDir: 'content/posts',
  imagesDir: 'public/notion-images/posts',
  imageUrlPath: '/notion-images/posts',
  getFileKey: (item) => item.slug,
  generateContent: generateArticleMdContent,
});

export async function main() {
  if (!process.env.NOTION_ARTICLES_DATABASE_ID) {
    console.error(
      'Error: NOTION_ARTICLES_DATABASE_ID is not set in .env',
    );
    process.exit(1);
  }

  console.log('[Articles] Fetching posts from Notion...');
  const posts = await fetchAllPages(
    process.env.NOTION_ARTICLES_DATABASE_ID,
    mapArticlePage,
    {
      filter: {
        property: 'status',
        select: { equals: 'published' },
      },
      sorts: [{ property: 'date', direction: 'descending' }],
    },
  );

  if (!posts || posts.length === 0) {
    console.log('[Articles] No posts found.');
    return;
  }

  console.log(`[Articles] Found ${posts.length} posts...\n`);

  await toLocalMarkdown(posts);
}

// 支持独立运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
