import fs from 'fs';
import matter from 'gray-matter';

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * 清理标题中的 markdown 格式标记（粗体、斜体、代码、链接等）
 */
function cleanHeadingText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // **bold**
    .replace(/__(.+?)__/g, '$1') // __bold__
    .replace(/\*(.+?)\*/g, '$1') // *italic*
    .replace(/_(.+?)_/g, '$1') // _italic_
    .replace(/~~(.+?)~~/g, '$1') // ~~strikethrough~~
    .replace(/`(.+?)`/g, '$1') // `code`
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // [text](url)
    .trim();
}

/**
 * 从 Markdown 内容中提取标题，用于生成目录
 */
export function extractHeadings(md: string): TocHeading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: TocHeading[] = [];
  let match;

  while ((match = headingRegex.exec(md)) !== null) {
    const level = match[1].length;
    const rawText = match[2].trim();
    const text = cleanHeadingText(rawText);
    // 生成与 rehype-slug 一致的 slugify ID（使用清理后的文本）
    const id = text
      .toLowerCase()
      .replace(/[^\w一-鿿\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    headings.push({ id, text, level });
  }

  return headings;
}

/**
 * 从本地路径解析 markdown 文件
 *
 * @param filePath 文件路径
 * @param withContent 是否返回内容
 */
export function parseMdFromFile(filePath: string, withContent = false) {
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  if (!fileContent) return null;

  try {
    const { data, content } = matter(fileContent);
    return withContent ? { postMeta: data, content } : { postMeta: data };
  } catch (error) {
    console.error(`Error parsing frontmatter in ${filePath}:`, error);
    return null;
  }
}

export function cleanMarkdown(md: string) {
  // 1. <empty-block/> → 段落分隔
  md = md.replace(/<empty-block\/>/g, '\n\n');

  // 2. {color="..."} → Notion 内联颜色标记，移除
  md = md.replace(/\s*\{color="[^"]*"\}/g, '');

  // 3. <span> → 移除标签保留内容（避免 rehype-raw 嵌套解析冲突）
  md = md.replace(/<span\b[^>]*>(.*?)<\/span>/gis, '$1');

  // 4. 清理表格 align 属性
  md = md.replace(/<(td|th)\s+align="[^"]*">/gi, '<$1>');

  // 4. 移除空段落
  md = md.replace(/<p>\s*<\/p>/gi, '');

  return md;
}
