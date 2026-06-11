import axios from 'axios';
import fs from 'fs';
import path from 'path';

// 下载并替换 Markdown 中的图片链接
export async function downloadAndReplaceImages(
  markdown: string,
  imagesDir: string,
  slug: string,
): Promise<string> {
  const imageUrls = extractImageUrls(markdown);

  if (imageUrls.length === 0) {
    return markdown;
  }

  console.log(`Found ${imageUrls.length} images in post`);

  let processedMarkdown = markdown;
  let imageIndex = 1;

  for (const url of imageUrls) {
    // 跳过非 Notion 的图片（可选）
    if (!url.includes('notion.so') && !url.includes('amazonaws.com')) {
      continue;
    }

    const fileName = generateSafeFileName(url, imageIndex);
    const destPath = path.join(imagesDir, slug, fileName);

    // 如果文件已存在，跳过下载
    if (fs.existsSync(destPath)) {
      console.log(`  ⊘ Skipped (exists): ${fileName}`);
    } else {
      // 下载图片
      const success = await downloadImage(url, destPath);
      if (!success) {
        console.log(`  ✗ Failed to download: ${url}`);
        continue;
      }
    }

    // 替换 Markdown 中的图片链接为本地路径
    const localPath = `/notion-images/words/${slug}/${fileName}`;
    processedMarkdown = processedMarkdown.replace(url, localPath);
    imageIndex++;
  }

  return processedMarkdown;
}

// 下载单个图片文件
async function downloadImage(url: string, dest: string) {
  // 确保目录存在
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const writer = fs.createWriteStream(dest);

  const response = await axios({
    method: 'get',
    url: url,
    responseType: 'stream',
    timeout: 30000,
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve(dest));
    writer.on('error', reject);
  });
}

// 从 Markdown 中提取所有图片链接
function extractImageUrls(markdown: string): string[] {
  // 匹配 Markdown 图片格式: ![alt](url)
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const urls: string[] = [];
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    urls.push(match[2]);
  }

  return [...new Set(urls)]; // 去重
}

// 生成安全的文件名
function generateSafeFileName(url: string, index: number): string {
  // 从 URL 中提取扩展名，如果没有则使用 .png 默认值
  const extMatch = url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'png';
  return `image_${index}.${ext}`;
}
