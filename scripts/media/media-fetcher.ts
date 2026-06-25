import { toLocalMarkdown } from './md-handler';
import { fetchAllPages } from './notion-supports';

export async function main() {
  if (!process.env.NOTION_MEDIA_DATABASE_ID) {
    console.error('Error: NOTION_MEDIA_DATABASE_ID is not set in .env');
    process.exit(1);
  }

  console.log('[Media] Fetching media from Notion...');
  const items = await fetchAllPages(process.env.NOTION_MEDIA_DATABASE_ID);

  if (!items || items.length === 0) {
    console.log('[Media] No media found.');
    return;
  }

  console.log(`[Media] Found ${items.length} items...\n`);

  await toLocalMarkdown(items);
}

// 支持独立运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
