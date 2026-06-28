import fs from 'fs';
import matter from '@11ty/gray-matter';
import path from 'path';
import { notion } from './notion-client';
import {
  convertPageToMarkdown,
  downloadImage,
  type ConverterConfig,
} from './notion-md-converter';

/** 基础元数据 —— 所有类型至少包含这些字段 */
export interface BaseMeta {
  page_id: string;
  last_edited_time: string;
  last_fetch_time: string | null;
  title: string;
}

/** MdHandler 的配置项 */
export interface MdHandlerConfig<T extends BaseMeta> {
  /** 内容输出目录，如 content/posts */
  contentDir: string;
  /** 图片配置 */
  media: ConverterConfig;
  /** 从元数据中提取文件标识符（文章用 slug，说说用 page_id） */
  getFileKey: (item: T) => string;
  /** 生成完整 MD 文件内容（frontmatter + 正文） */
  generateContent: (item: T, markdown: string) => string;
  /** 当 markdown 内容为空时的回退函数，返回替代内容或 null 跳过 */
  emptyContentFallback?: (item: T) => string | null;
}

/**
 * 工厂：创建 toLocalMarkdown 函数
 *
 * 返回的函数负责：增量检查 → notion-to-md 转换（含图片下载） → 写文件
 */
export function createMdHandler<T extends BaseMeta>(
  config: MdHandlerConfig<T>,
) {
  const { media, getFileKey, generateContent, emptyContentFallback } = config;
  const contentDir = path.resolve(process.cwd(), config.contentDir);

  function readLocalMeta(key: string): {
    last_fetch_time: string | null;
    last_edited_time: string | null;
  } | null {
    const filePath = path.join(contentDir, `${key}.md`);
    if (!fs.existsSync(filePath)) return null;

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(content);
      return {
        last_fetch_time: data.last_fetch_time ?? null,
        last_edited_time: data.last_edited_time ?? null,
      };
    } catch {
      return null;
    }
  }

  function needsUpdate(item: T): boolean {
    if (process.env.FORCE_SYNC === 'true') return true;

    const key = getFileKey(item);
    const local = readLocalMeta(key);
    if (!local) return true;
    return item.last_edited_time !== local.last_edited_time;
  }

  return async function toLocalMarkdown(items: T[]) {
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    let updated = 0;
    let skipped = 0;

    for (const item of items) {
      const key = getFileKey(item);

      try {
        if (!needsUpdate(item)) {
          skipped++;
          console.log(`⊘ Skipped (up-to-date): ${key}`);
          continue;
        }

        console.log(`→ Fetching: ${item.title}`);

        let markdown = await convertPageToMarkdown(
          notion,
          item.page_id,
          key,
          media,
        );
        if (!markdown) {
          const fallback = emptyContentFallback?.(item);
          if (fallback) {
            console.log(`→ Content empty, using fallback for: ${item.title}`);
            markdown = fallback;
          } else {
            console.error(`✗ No content returned for: ${item.title}`);
            continue;
          }
        }

        // 下载 cover 图片到本地（处理 Notion 文件上传的过期 URL）
        const cover = (item as any).cover as string | undefined;
        if (cover) {
          const coverDir = path.resolve(process.cwd(), media.mediaDir, key);
          const coverUrlPath = `${media.mediaUrlPath}/${key}`;
          if (!fs.existsSync(coverDir)) {
            fs.mkdirSync(coverDir, { recursive: true });
          }
          const localCover = await downloadImage(cover, coverDir, coverUrlPath);
          (item as any).cover = localCover;
        }

        const now = new Date().toISOString();
        const itemWithFetchTime = { ...item, last_fetch_time: now };

        const fullContent = generateContent(itemWithFetchTime, markdown);
        const fileName = `${key}.md`;
        const filePath = path.join(contentDir, fileName);

        fs.writeFileSync(filePath, fullContent, 'utf-8');
        console.log(`✓ Saved: ${fileName}`);
        updated++;
      } catch (error) {
        console.error(`✗ Failed to process "${item.title}":`, error);
      }
    }

    console.log(
      `\nDone: ${updated} updated, ${skipped} skipped, ${items.length} total`,
    );
  };
}
