import fs from 'fs';
import path from 'path';
import matter from '@11ty/gray-matter';
import { downloadImage } from './notion-md-converter';

/**
 * 增量检查：对比本地 MD 文件的 last_edited_time 与 Notion 返回的值
 * FORCE_SYNC=true 时始终返回 true
 */
export function needsSync(
  contentDir: string,
  key: string,
  lastEditedTime: string,
): boolean {
  if (process.env.FORCE_SYNC === 'true') return true;

  const filePath = path.join(contentDir, `${key}.md`);
  if (!fs.existsSync(filePath)) return true;

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);
    return lastEditedTime !== data.last_edited_time;
  } catch {
    return true;
  }
}

/**
 * 下载封面图片到本地，返回本地 URL 路径
 * 非 Notion 图片（如外部 URL）直接返回原 URL
 */
export async function syncCover(
  url: string | undefined,
  mediaDir: string,
  mediaUrlPath: string,
  key: string,
): Promise<string | undefined> {
  if (!url) return undefined;

  const coverDir = path.join(mediaDir, key);
  const coverUrlPath = `${mediaUrlPath}/${key}`;

  if (!fs.existsSync(coverDir)) {
    fs.mkdirSync(coverDir, { recursive: true });
  }

  return downloadImage(url, coverDir, coverUrlPath);
}
