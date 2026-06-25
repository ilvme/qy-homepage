import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { PostMetadata } from '../types';
import { generateArticleMdContent } from './articles-fetcher';
import { downloadAndReplaceImages } from './images-handler';
import { fetchPagePureMdContent } from './notion-supports';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'notion-images', 'posts');

/**
 * 从本地 MD 文件读取上次同步的元信息
 */
function readLocalMeta(slug: string): { last_fetch_time: string | null; last_edited_time: string | null } | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
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

/**
 * 判断是否需要更新：比较 Notion 端的 last_edited_time 与本地的 last_edited_time
 */
function needsUpdate(post: PostMetadata): boolean {
  const local = readLocalMeta(post.slug);
  if (!local) return true; // 本地不存在，需要新建

  // 如果 Notion 的最后编辑时间比本地记录的新，则需要更新
  return post.last_edited_time !== local.last_edited_time;
}

/**
 * 将 Notion 页面转换为 Markdown
 * @param posts 文章信息
 */
export async function toLocalMarkdown(posts: PostMetadata[]) {
  // 确保目录存在
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  let updated = 0;
  let skipped = 0;

  // 遍历页面，获取并处理 Markdown
  for (const post of posts) {
    try {
      // 增量更新检查
      if (!needsUpdate(post)) {
        skipped++;
        console.log(`⊘ Skipped (up-to-date): ${post.slug}`);
        continue;
      }

      console.log(`→ Fetching: ${post.title}`);

      // 获取 Markdown 格式的内容
      const markdown = await fetchPagePureMdContent(post);
      if (!markdown) {
        console.error(`✗ No content returned for: ${post.title}`);
        continue;
      }

      // 从 markdown 中读取图片链接，并下载图片到 public/notion-images 目录, 并替换 markdown 中的图片链接
      const processedMarkdown = await downloadAndReplaceImages(
        markdown,
        IMAGES_DIR,
        post.slug,
      );

      // 更新 last_fetch_time 为当前时间
      const now = new Date().toISOString();
      const postWithFetchTime = { ...post, last_fetch_time: now };

      // 组合 Frontmatter 和 Markdown 内容
      const fullContent = generateArticleMdContent(postWithFetchTime, processedMarkdown);

      // 生成文件名
      const fileName = `${post.slug}.md`;
      const filePath = path.join(CONTENT_DIR, fileName);

      // 写入文件
      fs.writeFileSync(filePath, fullContent, 'utf-8');
      console.log(`✓ Saved: ${fileName}`);
      updated++;
    } catch (error) {
      console.error(`✗ Failed to process post "${post.title}":`, error);
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${posts.length} total`);
}
