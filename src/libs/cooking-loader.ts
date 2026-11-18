import { glob } from 'glob';
import path from 'path';
import { cache } from 'react';
import { parseDate, parseMdFromFile, toLocalDateStr } from '@/libs/content-supports';
import type { PostMetadata } from '../../scripts/types';

export interface PostWithContent extends PostMetadata {
  content: string;
}

const COOKING_DIR = path.join(process.cwd(), 'content/cooking');

/** 获取所有烹饪记录（请求级缓存） */
export const getAllCooking = cache(async () => {
  const pattern = path.join(COOKING_DIR, '*.md');
  const files = await glob(pattern);

  return files
    .map((file) => parseMdFromFile(file))
    .filter((item): item is NonNullable<typeof item> => item != null)
    .map((item) => item.postMeta as PostMetadata)
    .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())
    .map((p) => ({ ...p, date: toLocalDateStr(p.date) }));
});

/** 获取指定 slug 的记录（按 slug 缓存） */
export const getCookingBySlug = cache(async (
  slug: string,
): Promise<PostWithContent | null> => {
  const filePath = path.join(COOKING_DIR, `${slug}.md`);
  const parsed = parseMdFromFile(filePath, true);
  if (!parsed?.postMeta) return null;

  const meta = parsed.postMeta as PostMetadata;
  return {
    ...meta,
    date: toLocalDateStr(meta.date),
    content: parsed.content ?? '',
  };
});

/** 获取所有分类 */
export async function getAllCookingCategories() {
  const items = await getAllCooking();
  const set = new Set<string>();
  items.forEach((item) => {
    if (item.category) set.add(item.category);
  });
  return Array.from(set);
}

/** 按分类过滤 */
export async function getCookingByCategory(category: string) {
  const items = await getAllCooking();
  return items.filter((item) => item.category === category);
}
