import fs from 'fs';
import path from 'path';
import { notion, fetchAllPages } from './lib/notion-client';
import { convertPageToMarkdown } from './lib/notion-md-converter';
import { mapArticlePage, getArticlesDatabaseId } from './lib/mappers';
import { needsSync, syncCover } from './lib/sync-utils';
import type { PostMetadata } from './types';

const CONTENT_DIR = path.resolve(process.cwd(), 'content/posts');
const MEDIA_DIR = path.resolve(process.cwd(), 'public/notion-images/posts');
const MEDIA_URL = '/notion-images/posts';

/** 生成 frontmatter YAML 字符串 */
function formatFrontmatter(meta: PostMetadata, lastFetchTime: string): string {
  const fm: string[] = [];
  fm.push(`title: "${meta.title.replace(/"/g, '\\"')}"`);
  fm.push(`slug: "${meta.slug}"`);
  fm.push(`date: "${meta.date ?? meta.last_edited_time}"`);
  if (meta.category) fm.push(`category: "${meta.category}"`);
  if (meta.tags?.length)
    fm.push(`tags: [${meta.tags.map((t) => `"${t}"`).join(', ')}]`);
  fm.push(`status: "${meta.status}"`);
  fm.push(`type: "${meta.type}"`);
  fm.push(`last_fetch_time: "${lastFetchTime}"`);
  fm.push(`last_edited_time: "${meta.last_edited_time}"`);
  fm.push(`page_id: "${meta.page_id}"`);
  if (meta.summary) fm.push(`summary: "${meta.summary}"`);
  if (meta.cover) fm.push(`cover: "${meta.cover}"`);
  if (meta.icon) fm.push(`icon: "${meta.icon}"`);
  return fm.join('\n');
}

export async function fetchArticles() {
  const dbId = getArticlesDatabaseId();

  console.log('[Articles] Fetching from Notion (type: "article")...');
  const items = await fetchAllPages(dbId, mapArticlePage, {
    filter: {
      and: [
        { property: 'status', select: { equals: 'published' } },
        { property: 'type', select: { equals: 'article' } },
      ],
    },
    sorts: [{ property: 'date', direction: 'descending' }],
  });

  if (!items || items.length === 0) {
    console.log('[Articles] No items found.');
    return;
  }

  console.log(`[Articles] Found ${items.length} items...\n`);

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
      mediaDir: 'public/notion-images/posts',
      mediaUrlPath: MEDIA_URL,
    });
    if (!markdown) {
      console.error(`✗ No content returned for: ${item.title}`);
      continue;
    }

    // 下载封面图
    item.cover = await syncCover(item.cover, MEDIA_DIR, MEDIA_URL, item.slug);

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
  await fetchArticles();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
