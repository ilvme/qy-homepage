import fs from 'fs';
import path from 'path';
import { notion, fetchAllPages } from './lib/notion-client';
import { convertPageToMarkdown } from './lib/notion-md-converter';
import { mapArticlePage, getArticlesDatabaseId } from './lib/mappers';
import { syncCover, nowLocal, loadSyncState, saveSyncState, needsStateSync, cleanOrphanedFiles } from './lib/sync-utils';
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

  const state = loadSyncState();
  let updated = 0;
  let skipped = 0;

  for (const item of items) {
    const key = `posts/${item.slug}`;
    if (!needsStateSync(state, key, item.last_edited_time)) {
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

  // 清理 Notion 中已删除的本地文件
  const knownIds = new Set(items.map((i) => i.slug));
  const deleted = cleanOrphanedFiles(CONTENT_DIR, knownIds, state, 'posts/', MEDIA_DIR);

  saveSyncState(state);

  console.log(
    `\nDone: ${updated} updated, ${skipped} skipped, ${deleted} cleaned, ${items.length} total`,
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
