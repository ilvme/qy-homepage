import { glob } from 'glob';
import path from 'path';
import { cleanMarkdown, parseMdFromFile } from '@/libs/content-supports';
import type { CollectionMetadata } from '../../scripts/types';

export interface CollectionWithContent extends CollectionMetadata {
  content: string;
}

const COLLECTIONS_DIR = path.join(process.cwd(), 'content', 'collections');

/**
 * 获取所有收藏条目
 */
export async function getAllCollections(): Promise<CollectionMetadata[]> {
  const pattern = path.join(COLLECTIONS_DIR, '*.md');
  const files = await glob(pattern);

  const items = files
    .map((file) => parseMdFromFile(file))
    .map((item) => item?.postMeta as CollectionMetadata)
    .filter((item) => item !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  console.log('本地收藏条目：', items.length);

  return items;
}

/**
 * 获取指定收藏条目的详细内容
 */
export async function getCollectionByPageId(pageId: string): Promise<CollectionWithContent | null> {
  const filePath = path.join(COLLECTIONS_DIR, `${pageId}.md`);
  const parsed = parseMdFromFile(filePath, true);
  if (!parsed) return null;

  return {
    ...(parsed.postMeta as CollectionMetadata),
    content: cleanMarkdown(parsed.content ?? ''),
  };
}

/**
 * 按分类筛选
 */
export async function getCollectionsByCategory(category: string): Promise<CollectionMetadata[]> {
  const all = await getAllCollections();
  return all.filter((item) => item.category === category);
}
