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
last_fetch_time: "${postMeta.last_fetch_time}"
last_edited_time: "${postMeta.last_edited_time}"
page_id: "${postMeta.page_id}"
---   

${content}`;
}

async function main() {
  if (!process.env.NOTION_WORDS_DATABASE_ID) {
    console.error(
      'Error: NOTION_ARTICLES_DATABASE_ID is not set in .env.local',
    );
    process.exit(1);
  }

  console.log('Fetching posts from Notion...');
  const posts = await fetchAllPages(process.env.NOTION_WORDS_DATABASE_ID);

  if (!posts || posts.length === 0) {
    console.log('No posts found.');
    return;
  }

  console.log(`Found ${posts.length} posts...\n`);

  await toLocalMarkdown(posts);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
