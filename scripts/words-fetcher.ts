import { createMdHandler } from './lib/md-handler';
import { fetchAllPages } from './lib/notion-client';
import type { WordMetadata } from './types';

/**
 * 将 Notion 原始 page 对象映射为 WordMetadata
 */
function mapWordPage(page: any): WordMetadata {
  return {
    page_id: page.id,
    last_edited_time: page.last_edited_time,
    title: page.properties.title?.title[0]?.plain_text,
    tags: page.properties.tags.multi_select.map(
      (tag: { name: string }) => tag.name,
    ),
    date: page.properties.date.date?.start,
    status: page.properties.status.select?.name,
    from: page.properties.from.select?.name,
    last_fetch_time: page.properties.last_fetch_time.date?.start,
  };
}

/**
 * 生成说说 MD 文件内容（frontmatter + 正文）
 */
export function generateWordMdContent(postMeta: WordMetadata, content: string) {
  return `---
title: "${postMeta.title.replace(/"/g, '\\"')}"
date: "${postMeta.date ?? postMeta.last_edited_time}"
tags: [${postMeta.tags.map((tag) => `"${tag}"`).join(', ')}]
status: "${postMeta.status}"
from: "${postMeta.from ?? ''}"
last_fetch_time: "${postMeta.last_fetch_time}"
last_edited_time: "${postMeta.last_edited_time}"
page_id: "${postMeta.page_id}"
---

${content}`;
}

const toLocalMarkdown = createMdHandler<WordMetadata>({
  contentDir: 'content/words',
  media: { mediaDir: 'public/notion-images/words', mediaUrlPath: '/notion-images/words' },
  getFileKey: (item) => item.title,
  generateContent: generateWordMdContent,
  emptyContentFallback: (item) => item.title || null,
});

export async function main() {
  if (!process.env.NOTION_WORDS_DATABASE_ID) {
    console.error('Error: NOTION_WORDS_DATABASE_ID is not set in .env');
    process.exit(1);
  }

  console.log('[Words] Fetching words from Notion...');
  const posts = await fetchAllPages(
    process.env.NOTION_WORDS_DATABASE_ID,
    mapWordPage,
    {
      sorts: [{ property: 'date', direction: 'descending' }],
    },
  );

  if (!posts || posts.length === 0) {
    console.log('[Words] No words found.');
    return;
  }

  console.log(`[Words] Found ${posts.length} words...\n`);

  await toLocalMarkdown(posts);
}

// 支持独立运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
