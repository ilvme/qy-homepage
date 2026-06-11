import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { toLocalMarkdown } from './md-handler';
import { fetchAllPages } from './notion-supports';
import type { PostMetadata } from './types';

function extractArticleMeta(page: PageObjectResponse): PostMetadata {
  return {
    page_id: page.id,
    last_edited_time: page.last_edited_time,
    cover: page.cover?.external?.url,
    icon: page.icon?.external?.url,

    title: page.properties.title.title[0].plain_text,
    type: page.properties.type.select?.name,
    slug: page.properties.slug.rich_text[0].plain_text,
    category: page.properties.category.select?.name,
    tags: page.properties.tags.multi_select.map((tag) => tag.name),
    date: page.properties.date.date?.start,
    summary: page.properties.summary.rich_text[0]?.plain_text,
    status: page.properties.status.select?.name,
    last_fetch_time: page.properties.last_fetch_time.date?.start,
  };
}

/**
 * Markdown 文件内容构建
 * @param postMeta
 * @param content
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
summary: "${postMeta.summary}"
cover: "${postMeta.cover}"
icon: "${postMeta.icon}"
---   

${content}`;
}

async function main() {
  if (!process.env.NOTION_ARTICLES_DATABASE_ID) {
    console.error(
      'Error: NOTION_ARTICLES_DATABASE_ID is not set in .env.local',
    );
    process.exit(1);
  }

  console.log('Fetching posts from Notion...');
  const posts = await fetchAllPages(process.env.NOTION_ARTICLES_DATABASE_ID);

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
