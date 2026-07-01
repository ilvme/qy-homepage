import fs from 'fs';
import path from 'path';
import { notion, fetchAllPages } from './lib/notion-client';
import { convertPageToMarkdown } from './lib/notion-md-converter';
import { nowISO, loadSyncState, saveSyncState, needsStateSync, cleanOrphanedFiles } from './lib/sync-utils';
import type { WordMetadata } from './types';

const CONTENT_DIR = path.resolve(process.cwd(), 'content/words');
const MEDIA_DIR = path.resolve(process.cwd(), 'public/notion-images/words');
const MEDIA_URL = '/notion-images/words';

/** 将 Notion 说说数据库的 page 映射为 WordMetadata */
function mapWordPage(page: any): WordMetadata {
  return {
    page_id: page.id,
    last_edited_time: page.last_edited_time,
    title: page.properties.title?.title[0]?.plain_text,
    tags: page.properties.tags?.multi_select?.map(
      (tag: { name: string }) => tag.name,
    ),
    date: page.properties.date?.date?.start ?? null,
    status: page.properties.status.select?.name,
    from: page.properties.from.select?.name,
    last_fetched_time: page.properties.last_fetched_time?.date?.start ?? null,
  };
}

/** 生成 frontmatter YAML 字符串 */
function formatFrontmatter(meta: WordMetadata, lastFetchTime: string): string {
  const fm: string[] = [];
  fm.push(`title: "${meta.title.replace(/"/g, '\\"')}"`);
  fm.push(`date: "${meta.date ?? ''}"`);
  fm.push(`tags: [${(meta.tags || []).map((t) => `"${t}"`).join(', ')}]`);
  fm.push(`status: "${meta.status}"`);
  fm.push(`from: "${meta.from || ''}"`);
  fm.push(`last_fetched_time: "${lastFetchTime}"`);
  fm.push(`last_edited_time: "${meta.last_edited_time}"`);
  fm.push(`page_id: "${meta.page_id}"`);
  return fm.join('\n');
}

export async function fetchWords() {
  const databaseId = process.env.NOTION_WORDS_DATABASE_ID;
  if (!databaseId) {
    console.error('Error: NOTION_WORDS_DATABASE_ID is not set in .env');
    process.exit(1);
  }

  console.log('[Words] Fetching from Notion...');
  const items = await fetchAllPages(databaseId, mapWordPage, {
    filter: { property: 'status', select: { equals: 'published' } },
    sorts: [{ property: 'date', direction: 'descending' }],
  });

  if (!items || items.length === 0) {
    console.log('[Words] No words found.');
    return;
  }

  console.log(`[Words] Found ${items.length} words...\n`);

  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  const state = loadSyncState();
  let updated = 0;
  let skipped = 0;

  for (const item of items) {
    // 说说以 title 作为文件标识符
    const fileKey = item.title;
    if (!fileKey) {
      console.log('⊘ Skipped: empty title');
      continue;
    }

    const key = `words/${fileKey}`;
    if (!needsStateSync(state, key, item.last_edited_time)) {
      skipped++;
      console.log(`⊘ Skipped (up-to-date): ${fileKey}`);
      continue;
    }

    console.log(`→ Fetching: ${item.title}`);

    const markdown = await convertPageToMarkdown(notion, item.page_id, fileKey, {
      mediaDir: 'public/notion-images/words',
      mediaUrlPath: MEDIA_URL,
    });

    // 说说内容可能为空（纯标题），用 title 做回退
    const content = markdown || item.title || null;
    if (!content) {
      console.error(`✗ No content returned for: ${item.title}`);
      continue;
    }

    const now = nowISO();
    const fm = formatFrontmatter(item, now);
    const fullContent = `---\n${fm}\n---\n\n${content}`;

    fs.writeFileSync(
      path.join(CONTENT_DIR, `${fileKey}.md`),
      fullContent,
      'utf-8',
    );
    state[key] = item.last_edited_time;
    console.log(`✓ Saved: ${fileKey}.md`);
    updated++;
  }

  // 清理 Notion 中已删除的本地文件（words 以 title 为文件标识）
  const knownIds = new Set(items.map((i) => i.title).filter(Boolean));
  const deleted = cleanOrphanedFiles(CONTENT_DIR, knownIds, state, 'words/', MEDIA_DIR);

  saveSyncState(state);

  console.log(
    `\nDone: ${updated} updated, ${skipped} skipped, ${deleted} cleaned, ${items.length} total`,
  );
}

export async function main() {
  await fetchWords();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
