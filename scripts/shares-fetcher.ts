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

const CONTENT_ROOT = path.resolve(process.cwd(), 'content/shares');
const MEDIA_ROOT = path.resolve(process.cwd(), 'public/notion-images/shares');
const MEDIA_URL_ROOT = '/notion-images/shares';

/** 将 Notion 分享数据库的 page 映射为 ShareMetadata */
function mapSharePage(page: any): ShareMetadata {
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

  console.log(`[Shares] Found ${items.length} items.\n`);

  // 按 type 分组
  const groups = new Map<string, ShareMetadata[]>();
  for (const item of items) {
    const t = item.type || 'other';
    if (!groups.has(t)) groups.set(t, []);
    groups.get(t)!.push(item);
  }

  const state = loadSyncState();
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalCleaned = 0;

  for (const [type, typeItems] of groups) {
    const contentDir = path.join(CONTENT_ROOT, type);
    const mediaDir = path.join(MEDIA_ROOT, type);
    const mediaUrl = `${MEDIA_URL_ROOT}/${type}`;

    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    console.log(`\n── ${type} (${typeItems.length}) ──`);

    for (const item of typeItems) {
      const fileKey = item.title;
      const key = `shares/${type}/${fileKey}`;
      if (!needsStateSync(state, key, item.last_edited_time)) {
        totalSkipped++;
        console.log(`⊘ Skipped (up-to-date): ${fileKey}`);
        continue;
      }

      console.log(`→ Fetching: ${item.title}`);

      const markdown = await convertPageToMarkdown(
        notion,
        item.page_id,
        fileKey,
        {
          mediaDir: `public/notion-images/shares/${type}`,
          mediaUrlPath: mediaUrl,
        },
      );
      if (!markdown) {
        console.error(`✗ No content returned for: ${item.title}`);
        continue;
      }

      // 下载封面图
      item.cover = await syncCover(item.cover, mediaDir, mediaUrl, fileKey);

      const now = nowISO();
      const fm = formatFrontmatter(item, now);
      const fullContent = `---\n${fm}\n---\n\n${markdown}`;

      fs.writeFileSync(
        path.join(contentDir, `${fileKey}.md`),
        fullContent,
        'utf-8',
      );
      state[key] = item.last_edited_time;
      console.log(`✓ Saved: ${fileKey}.md`);
      totalUpdated++;
    }

    // 清理该 type 下的孤儿文件
    const knownIds = new Set(typeItems.map((i) => i.title).filter(Boolean));
    totalCleaned += cleanOrphanedFiles(
      contentDir,
      knownIds,
      state,
      `shares/${type}/`,
      mediaDir,
    );
  }

  // 清理旧的扁平 .md 文件（迁移前残留）
  if (fs.existsSync(CONTENT_ROOT)) {
    const oldFiles = fs
      .readdirSync(CONTENT_ROOT, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith('.md'));
    for (const f of oldFiles) {
      const p = path.join(CONTENT_ROOT, f.name);
      fs.unlinkSync(p);
      console.log(`🗑 Cleaned old flat file: ${f.name}`);
    }
    // 也清理旧扁平目录下的封面图片目录
    const oldDirs = fs
      .readdirSync(CONTENT_ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !groups.has(d.name));
    // 不自动删除未知目录，可能是手动创建的
  }

  // 清理旧的 sync-state 键（扁平结构）
  for (const key of Object.keys(state)) {
    if (key.startsWith('shares/') && key.split('/').length === 2) {
      delete state[key];
    }
  }

  saveSyncState(state);

  console.log(
    `\nDone: ${totalUpdated} updated, ${totalSkipped} skipped, ${totalCleaned} cleaned, ${items.length} total`,
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
