import { toLocalMarkdown } from './md-handler';
import { fetchAllPages } from './notion-supports';
import type { ShuoShuoMetadata } from './types';

/**
 * Markdown 文件内容构建
 * @param postMeta
 * @param content
 */
export function generateShuoShuoMdContent(
  postMeta: ShuoShuoMetadata,
  content: string,
) {
  return `---
title: "${postMeta.title.replace(/"/g, '\\"')}"
from: "${postMeta.from}"
date: "${postMeta.date}"
tags: [${postMeta.tags.map((tag) => `"${tag}"`).join(', ')}]
status: ${postMeta.status}
last_fetch_time: "${postMeta.last_fetch_time}"
last_edited_time: "${postMeta.last_edited_time}"
page_id: "${postMeta.page_id}"
---   

${content}`;
}

async function main() {
  if (!process.env.NOTION_SHUOSHUO_DATABASE_ID) {
    console.error(
      'Error: NOTION_SHUOSHUO_DATABASE_ID is not set in .env.local',
    );
    process.exit(1);
  }

  console.log('Fetching posts from Notion...');
  const posts = await fetchAllPages(process.env.NOTION_SHUOSHUO_DATABASE_ID);

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
