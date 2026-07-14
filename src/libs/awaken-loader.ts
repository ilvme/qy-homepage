import { glob } from 'glob';
import path from 'path';
import { parseDate, parseMdFromFile, toLocalDateStr } from '@/libs/content-supports';
import type { ShareMetadata } from '../../scripts/types';

export interface ShareWithContent extends ShareMetadata {
  content: string;
}

const SHARES_DIR = path.join(process.cwd(), 'content/shares/awaken');

/** 获取所有 awaken 条目 */
export async function getAllAwaken() {
  const pattern = path.join(SHARES_DIR, '*.md');
  const files = await glob(pattern);

  const items = files
    .map((file) => parseMdFromFile(file))
    .filter((item): item is NonNullable<typeof item> => item != null)
    .map((item) => item.postMeta as ShareMetadata)
    .sort((a, b) => b.last_edited_time.localeCompare(a.last_edited_time))
    .map((p) => ({ ...p, date: toLocalDateStr(p.date) }));

  return items;
}

/** 获取指定 title 的 awaken 条目 */
export async function getAwakenBySlug(
  title: string,
): Promise<ShareWithContent | null> {
  const filePath = path.join(SHARES_DIR, `${title}.md`);
  const parsed = parseMdFromFile(filePath, true);
  if (!parsed?.postMeta) return null;

  const meta = parsed.postMeta as ShareMetadata;
  return {
    ...meta,
    date: toLocalDateStr(meta.date),
    content: parsed.content ?? '',
  };
}

/** 获取所有分类 */
export async function getAllAwakenCategories() {
  const items = await getAllAwaken();
  const set = new Set<string>();
  for (const item of items) {
    if (item.category) set.add(item.category);
  }
  return Array.from(set);
}

/** 按分类过滤 */
export async function getAwakenByCategory(category: string) {
  const items = await getAllAwaken();
  return items.filter((item) => item.category === category);
}
