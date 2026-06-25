import type { WordMetadata } from '../types';
import { toLocalMarkdown } from './md-handler';
import { fetchAllPages } from './notion-supports';

/**
 * Markdown 文件内容构建
 * @param postMeta
 * @param content
 */
export function generateWordMdContent(postMeta: WordMetadata, content: string) {
  return `---
title: "${postMeta.title.replace(/"/g, '\\"')}"
date: "${postMeta.date ?? ''}"
tags: [${postMeta.tags.map((tag) => `"${tag}"`).join(', ')}]
status: "${postMeta.status}"
from: "${postMeta.from ?? ''}"
last_fetch_time: "${postMeta.last_fetch_time}"
last_edited_time: "${postMeta.last_edited_time}"
page_id: "${postMeta.page_id}"
---   

${content}`;
}

export async function main() {
  if (!process.env.NOTION_WORDS_DATABASE_ID) {
    console.error(
      'Error: NOTION_WORDS_DATABASE_ID is not set in .env',
    );
    process.exit(1);
  }

  console.log('[Words] Fetching words from Notion...');
  const posts = await fetchAllPages(process.env.NOTION_WORDS_DATABASE_ID);

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
