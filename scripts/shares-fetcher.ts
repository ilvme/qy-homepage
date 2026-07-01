import fs from 'fs';
import path from 'path';
import { fetchAllPages, notion } from './lib/notion-client';
import { convertPageToMarkdown } from './lib/notion-md-converter';
import {
  cleanOrphanedFiles,
  loadSyncState,
  needsStateSync,
  nowISO,
  saveSyncState,
  syncCover,
} from './lib/sync-utils';
import type { ShareMetadata } from './types';

const CONTENT_DIR = path.resolve(process.cwd(), 'content/shares');
const MEDIA_DIR = path.resolve(process.cwd(), 'public/notion-images/shares');
const MEDIA_URL = '/notion-images/shares';

/** 将 Notion 分享数据库的 page 映射为 ShareMetadata */
function mapSharePage(page: any): ShareMetadata {
  // cover 优先取自定义属性，否则用 Notion 页面封面
  const coverUrl =
    page.properties.cover?.url ||
    page.properties.cover?.rich_text?.[0]?.plain_text ||
    (page.cover?.type === 'external'
      ? page.cover.external?.url
      : page.cover?.file?.url);

  const iconObj = page.icon;
  let iconUrl: string | undefined;
  if (iconObj) {
    iconUrl =
      iconObj.type === 'external' ? iconObj.external?.url : iconObj.file?.url;
  }

  return {
    page_id: page.id,
    last_edited_time: page.last_edited_time,
    cover: coverUrl,
    icon: iconUrl,

    title: page.properties.title?.title[0]?.plain_text ?? '',
    type: page.properties.type?.select?.name ?? 'taste',
    slug:
      page.properties.slug?.rich_text[0]?.plain_text ||
      page.id.replace(/-/g, ''),
    category: page.properties.category?.select?.name ?? '',
    tags:
      page.properties.tags?.multi_select?.map(
        (tag: { name: string }) => tag.name,
      ) ?? [],
    date: page.properties.date?.date?.start ?? null,
    summary: page.properties.summary?.rich_text[0]?.plain_text ?? '',
    author: page.properties.author?.rich_text[0]?.plain_text,
    link: page.properties.link?.url,
    status: page.properties.status?.select?.name ?? 'published',
    last_fetched_time: page.properties.last_fetched_time?.date?.start ?? null,
  };
}

/** 生成 frontmatter YAML 字符串 */
function formatFrontmatter(meta: ShareMetadata, lastFetchTime: string): string {
  const fm: string[] = [];
  fm.push(`title: "${meta.title.replace(/"/g, '\\"')}"`);
  fm.push(`slug: "${meta.slug}"`);
  fm.push(`date: "${meta.date ?? ''}"`);
  fm.push(`category: "${meta.category || ''}"`);
  fm.push(`tags: [${(meta.tags || []).map((t) => `"${t}"`).join(', ')}]`);
  fm.push(`status: "${meta.status}"`);
  fm.push(`type: "${meta.type}"`);
  fm.push(`author: "${meta.author || ''}"`);
  fm.push(`link: "${meta.link || ''}"`);
  fm.push(`last_fetched_time: "${lastFetchTime}"`);
  fm.push(`last_edited_time: "${meta.last_edited_time}"`);
  fm.push(`page_id: "${meta.page_id}"`);
  fm.push(`summary: "${meta.summary || ''}"`);
  fm.push(`cover: "${meta.cover || ''}"`);
  fm.push(`icon: "${meta.icon || ''}"`);
  return fm.join('\n');
}

export async function fetchShares() {
  const databaseId = process.env.NOTION_SHARE_DATABASE_ID;
  if (!databaseId) {
    console.log('[Shares] NOTION_SHARE_DATABASE_ID not set, skipping.');
    return;
  }

  console.log('[Shares] Fetching from Notion...');
  const items = await fetchAllPages(databaseId, mapSharePage, {
    filter: { property: 'status', select: { equals: 'published' } },
    sorts: [{ property: 'date', direction: 'descending' }],
  });

  if (!items || items.length === 0) {
    console.log('[Shares] No items found.');
    return;
  }

  console.log(`[Shares] Found ${items.length} items...\n`);

  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  const state = loadSyncState();
  let updated = 0;
  let skipped = 0;

  for (const item of items) {
    const fileKey = item.title;
    const key = `shares/${fileKey}`;
    if (!needsStateSync(state, key, item.last_edited_time)) {
      skipped++;
      console.log(`⊘ Skipped (up-to-date): ${fileKey}`);
      continue;
    }

    console.log(`→ Fetching: ${item.title}`);

    const markdown = await convertPageToMarkdown(
      notion,
      item.page_id,
      fileKey,
      {
        mediaDir: 'public/notion-images/shares',
        mediaUrlPath: MEDIA_URL,
      },
    );
    if (!markdown) {
      console.error(`✗ No content returned for: ${item.title}`);
      continue;
    }

    // 下载封面图
    item.cover = await syncCover(item.cover, MEDIA_DIR, MEDIA_URL, fileKey);

    const now = nowISO();
    const fm = formatFrontmatter(item, now);
    const fullContent = `---\n${fm}\n---\n\n${markdown}`;

    fs.writeFileSync(
      path.join(CONTENT_DIR, `${fileKey}.md`),
      fullContent,
      'utf-8',
    );
    state[key] = item.last_edited_time;
    console.log(`✓ Saved: ${fileKey}.md`);
    updated++;
  }

  // 清理 Notion 中已删除的本地文件（shares 以 title 为文件标识）
  const knownIds = new Set(items.map((i) => i.title).filter(Boolean));
  const deleted = cleanOrphanedFiles(CONTENT_DIR, knownIds, state, 'shares/', MEDIA_DIR);

  saveSyncState(state);

  console.log(
    `\nDone: ${updated} updated, ${skipped} skipped, ${deleted} cleaned, ${items.length} total`,
  );
}

export async function main() {
  await fetchShares();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
