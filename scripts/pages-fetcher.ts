import fs from 'fs';
import path from 'path';
import { notion, fetchAllPages } from './lib/notion-client';
import { convertPageToMarkdown } from './lib/notion-md-converter';
import { mapArticlePage, getArticlesDatabaseId } from './lib/mappers';
import { needsSync } from './lib/sync-utils';
import type { PostMetadata } from './types';

const CONTENT_DIR = path.resolve(process.cwd(), 'content/pages');
const MEDIA_DIR = path.resolve(process.cwd(), 'public/notion-images/pages');
const MEDIA_URL = '/notion-images/pages';

/** 生成 frontmatter YAML 字符串（页面字段比文章少） */
function formatFrontmatter(meta: PostMetadata, lastFetchTime: string): string {
  const fm: string[] = [];
  fm.push(`title: "${meta.title.replace(/"/g, '\\"')}"`);
  fm.push(`slug: "${meta.slug}"`);
  fm.push(`date: "${meta.date}"`);
  fm.push(`page_id: "${meta.page_id}"`);
  fm.push(`last_edited_time: "${meta.last_edited_time}"`);
  fm.push(`last_fetch_time: "${lastFetchTime}"`);
  fm.push(`type: "${meta.type}"`);
  return fm.join('\n');
}

export async function fetchPages() {
  const dbId = getArticlesDatabaseId();

  console.log('[Pages] Fetching from Notion (type: "page")...');
  const items = await fetchAllPages(dbId, mapArticlePage, {
    filter: {
      and: [
        { property: 'status', select: { equals: 'published' } },
        { property: 'type', select: { equals: 'page' } },
      ],
    },
    sorts: [{ property: 'date', direction: 'descending' }],
  });

  if (!items || items.length === 0) {
    console.log('[Pages] No items found.');
    return;
  }

  console.log(`[Pages] Found ${items.length} items...\n`);

  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  let updated = 0;
  let skipped = 0;

  for (const item of items) {
    if (!needsSync(CONTENT_DIR, item.slug, item.last_edited_time)) {
      skipped++;
      console.log(`⊘ Skipped (up-to-date): ${item.slug}`);
      continue;
    }

    console.log(`→ Fetching: ${item.title}`);

    const markdown = await convertPageToMarkdown(notion, item.page_id, item.slug, {
      mediaDir: 'public/notion-images/pages',
      mediaUrlPath: MEDIA_URL,
    });
    if (!markdown) {
      console.error(`✗ No content returned for: ${item.title}`);
      continue;
    }

    const now = new Date().toISOString();
    const fm = formatFrontmatter(item, now);
    const fullContent = `---\n${fm}\n---\n\n${markdown}`;

    fs.writeFileSync(
      path.join(CONTENT_DIR, `${item.slug}.md`),
      fullContent,
      'utf-8',
    );
    console.log(`✓ Saved: ${item.slug}.md`);
    updated++;
  }

  console.log(
    `\nDone: ${updated} updated, ${skipped} skipped, ${items.length} total`,
  );
}

export async function main() {
  await fetchPages();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
