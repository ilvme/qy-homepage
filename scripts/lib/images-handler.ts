import axios from 'axios';
import fs from 'fs';
import path from 'path';

/**
 * 下载 Markdown 中的远程图片并替换为本地路径
 *
 * @param markdown  - Markdown 原文
 * @param imagesDir - 图片存放根目录（如 public/notion-images）
 * @param slug      - 子目录名（如文章 slug 或说说 page_id）
 * @param urlPath   - 替换后的 URL 路径前缀（如 /notion-images/posts）
 */
export async function downloadAndReplaceImages(
  markdown: string,
  imagesDir: string,
  slug: string,
  urlPath: string,
): Promise<string> {
  const imageUrls = extractImageUrls(markdown);

  if (imageUrls.length === 0) {
    return markdown;
  }

  console.log(`Found ${imageUrls.length} images in post`);

  let processedMarkdown = markdown;
  let imageIndex = 1;

  for (const url of imageUrls) {
    // 跳过非 Notion 的图片
    if (!url.includes('notion.so') && !url.includes('amazonaws.com')) {
      continue;
    }

    const fileName = generateSafeFileName(url, imageIndex);
    const destPath = path.join(imagesDir, slug, fileName);

    // 如果文件已存在，跳过下载
    if (fs.existsSync(destPath)) {
      console.log(`  ⊘ Skipped (exists): ${fileName}`);
    } else {
      const success = await downloadImage(url, destPath);
      if (!success) {
        console.log(`  ✗ Failed to download: ${url}`);
        continue;
      }
    }

    // 替换 Markdown 中的图片链接为本地路径
    const localPath = `${urlPath}/${slug}/${fileName}`;
    processedMarkdown = processedMarkdown.replace(url, localPath);
    imageIndex++;
  }

  return processedMarkdown;
}

// 下载单个图片文件
async function downloadImage(
  url: string,
  dest: string,
): Promise<string | false> {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const writer = fs.createWriteStream(dest);

  try {
    const response = await axios({
      method: 'get',
      url,
      responseType: 'stream',
      timeout: 30000,
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(dest));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`  ✗ Download error: ${url}`, error);
    return false;
  }
}

// 从 Markdown 中提取所有图片链接
function extractImageUrls(markdown: string): string[] {
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const urls: string[] = [];
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    urls.push(match[2]);
  }

  return [...new Set(urls)];
}

// 生成安全的文件名
function generateSafeFileName(url: string, index: number): string {
  const extMatch = url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'png';
  return `image_${index}.${ext}`;
}
