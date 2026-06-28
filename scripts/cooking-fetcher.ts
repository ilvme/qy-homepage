import { generateMdContent, mapArticlePage } from './lib/article-utils';
import { createMdHandler } from './lib/md-handler';
import { fetchAllPages } from './lib/notion-client';
import type { PostMetadata } from './types';

const toLocalMarkdown = createMdHandler<PostMetadata>({
  contentDir: 'content/cooking',
  media: {
    mediaDir: 'public/notion-images/cooking',
    mediaUrlPath: '/notion-images/cooking',
  },
  getFileKey: (item) => item.slug,
  generateContent: generateMdContent,
});

export async function fetchCooking() {
  const databaseId = process.env.NOTION_COOKING_DATABASE_ID;
  if (!databaseId) {
    console.log('[Cooking] NOTION_COOKING_DATABASE_ID not set, skipping.');
    return;
  }

  console.log('[Cooking] Fetching from Notion...');
  const items = await fetchAllPages(databaseId, mapArticlePage, {
    filter: { property: 'status', select: { equals: 'published' } },
    sorts: [{ property: 'date', direction: 'descending' }],
  });
  console.log(items);

  if (!items || items.length === 0) {
    console.log('[Cooking] No items found.');
    return;
  }

  console.log(`[Cooking] Found ${items.length} items...\n`);
  await toLocalMarkdown(items);
}

export async function main() {
  await fetchCooking();
}

// 支持独立运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
