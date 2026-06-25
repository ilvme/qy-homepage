import { glob } from 'glob';
import path from 'path';
import { parseMdFromFile } from '@/libs/content-supports';
import type { MediaMetadata } from '../../scripts/types';

export interface MediaWithContent extends MediaMetadata {
  content: string;
}

const MEDIA_DIR = path.join(process.cwd(), 'content', 'media');

/**
 * 获取所有书影音条目
 */
export async function getAllMedia(): Promise<MediaMetadata[]> {
  const pattern = path.join(MEDIA_DIR, '*.md');
  const files = await glob(pattern);

  const items = files
    .map((file) => parseMdFromFile(file))
    .map((item) => item?.postMeta as MediaMetadata)
    .filter((item) => item !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  console.log('本地书影音条目：', items.length);

  return items;
}

/**
 * 按类型筛选（书/电影/音乐）
 */
export async function getMediaByType(type: string): Promise<MediaMetadata[]> {
  const all = await getAllMedia();
  return all.filter((item) => item.type === type);
}
