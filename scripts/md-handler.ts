import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { generateArticleMdContent } from './articles-fetcher';
import { downloadAndReplaceImages } from './images-handler';
import { fetchPagePureMdContent } from './notion-supports';
import type { PostMetadata } from './types';

/**
 * 将 Notion 页面转换为 Markdown
 * @param posts 文章信息
 */
export async function toLocalMarkdown(posts: PostMetadata[]) {
  const contentDir = path.join(process.cwd(), 'content', 'posts');
  const imagesDir = path.join(
    process.cwd(),
    'public',
    'notion-images',
    'posts',
  );

  // 确保目录存在
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // 遍历页面，获取并处理 Markdown
  for (const post of posts) {
    try {
      // 获取 Markdown 格式的内容
      const markdown = await fetchPagePureMdContent(post);

      // 从 markdown 中读取图片链接，并下载图片到 public/notion-images 目录, 并替换 markdown 中的图片链接
      const processedMarkdown = await downloadAndReplaceImages(
        markdown ?? '',
        imagesDir,
        post.slug,
      );

      // 组合 Frontmatter 和 Markdown 内容
      const fullContent = generateArticleMdContent(post, processedMarkdown);

      // 生成文件名
      const fileName = `${post.slug}.md`;
      const filePath = path.join(contentDir, fileName);

      // 写入文件
      fs.writeFileSync(filePath, fullContent, 'utf-8');
      console.log(`✓ Saved: ${fileName}`);
    } catch (error) {
      console.error(`✗ Failed to process post "${post.title}":`, error.message);
    }
  }

  console.log(`\nTotal processed: ${posts.length} posts`);
}
