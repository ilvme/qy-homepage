import fs from 'fs';
import path from 'path';
import { notion, fetchAllPages } from './lib/notion-client';
import { convertPageToMarkdown } from './lib/notion-md-converter';
import { syncCover, toLocalTime, nowLocal, loadSyncState, saveSyncState, needsStateSync } from './lib/sync-utils';
import type { PostMetadata } from './types';

const CONTENT_DIR = path.resolve(process.cwd(), 'content/cooking');
const MEDIA_DIR = path.resolve(process.cwd(), 'public/notion-images/cooking');
const MEDIA_URL = '/notion-images/cooking';

/** 将 Notion 下厨数据库的 page 映射为 PostMetadata */
function mapCookingPage(page: any): PostMetadata {
  const coverObj = page.cover;
  let coverUrl: string | undefined;
  if (coverObj) {
    coverUrl =
      coverObj.type === 'external'
        ? coverObj.external?.url
        : coverObj.file?.url;
  }

  const iconObj = page.icon;
  let iconUrl: string | undefined;
  if (iconObj) {
    iconUrl =
      iconObj.type === 'external' ? iconObj.external?.url : iconObj.file?.url;
  }

  return {
    page_id: page.id,
    last_edited_time: toLocalTime(page.last_edited_time)!,
    cover: coverUrl,
    icon: iconUrl,

    title: page.properties.title.title[0].plain_text,
    type: page.properties.type.select?.name,
    slug: page.properties.slug.rich_text[0].plain_text,
    category: page.properties.category.select?.name,
    tags: page.properties.tags?.multi_select?.map(
      (tag: { name: string }) => tag.name,
    ),
    date:
      toLocalTime(page.properties.date?.date?.start) ??
      toLocalTime(page.created_time)!,
    summary: page.properties.summary.rich_text[0]?.plain_text,
    status: page.properties.status.select?.name,
    last_fetched_time: toLocalTime(page.properties.last_fetched_time.date?.start) ?? null,
  };
}

/** 生成 frontmatter YAML 字符串 */
function formatFrontmatter(meta: PostMetadata, lastFetchTime: string): string {
  const fm: string[] = [];
  fm.push(`title: "${meta.title.replace(/"/g, '\\"')}"`);
  fm.push(`slug: "${meta.slug}"`);
  fm.push(`date: "${meta.date ?? meta.last_edited_time}"`);
  fm.push(`category: "${meta.category || ''}"`);
  fm.push(`tags: [${(meta.tags || []).map((t) => `"${t}"`).join(', ')}]`);
  fm.push(`status: "${meta.status}"`);
  fm.push(`type: "${meta.type}"`);
  fm.push(`last_fetched_time: "${lastFetchTime}"`);
  fm.push(`last_edited_time: "${meta.last_edited_time}"`);
  fm.push(`page_id: "${meta.page_id}"`);
  fm.push(`summary: "${meta.summary || ''}"`);
  fm.push(`cover: "${meta.cover || ''}"`);
  fm.push(`icon: "${meta.icon || ''}"`);
  return fm.join('\n');
}

export async function fetchCooking() {
  const databaseId = process.env.NOTION_COOKING_DATABASE_ID;
  if (!databaseId) {
    console.log('[Cooking] NOTION_COOKING_DATABASE_ID not set, skipping.');
    return;
  }

  console.log('[Cooking] Fetching from Notion...');
  const items = await fetchAllPages(databaseId, mapCookingPage, {
    filter: { property: 'status', select: { equals: 'published' } },
    sorts: [{ property: 'date', direction: 'descending' }],
  });

  if (!items || items.length === 0) {
    console.log('[Cooking] No items found.');
    return;
  }

  console.log(`[Cooking] Found ${items.length} items...\n`);

  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  const state = loadSyncState();
  let updated = 0;
  let skipped = 0;

  for (const item of items) {
    const key = `cooking/${item.slug}`;
    if (!needsStateSync(state, key, item.last_edited_time)) {
      skipped++;
      console.log(`⊘ Skipped (up-to-date): ${item.slug}`);
      continue;
    }

    console.log(`→ Fetching: ${item.title}`);

    const markdown = await convertPageToMarkdown(notion, item.page_id, item.slug, {
      mediaDir: 'public/notion-images/cooking',
      mediaUrlPath: MEDIA_URL,
    });
    if (!markdown) {
      console.error(`✗ No content returned for: ${item.title}`);
      continue;
    }

    // 下载封面图
    item.cover = await syncCover(item.cover, MEDIA_DIR, MEDIA_URL, item.slug);

    const now = nowLocal();
    const fm = formatFrontmatter(item, now);
    const fullContent = `---\n${fm}\n---\n\n${markdown}`;

    fs.writeFileSync(
      path.join(CONTENT_DIR, `${item.slug}.md`),
      fullContent,
      'utf-8',
    );
    state[key] = item.last_edited_time;
    console.log(`✓ Saved: ${item.slug}.md`);
    updated++;
  }

  saveSyncState(state);

  console.log(
    `\nDone: ${updated} updated, ${skipped} skipped, ${items.length} total`,
  );
}

export async function main() {
  await fetchCooking();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
