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
    .replace(/\*\*(.+?)\*\*/g, '$1')       // **bold**
    .replace(/__(.+?)__/g, '$1')           // __bold__
    .replace(/\*(.+?)\*/g, '$1')           // *italic*
    .replace(/_(.+?)_/g, '$1')             // _italic_
    .replace(/~~(.+?)~~/g, '$1')           // ~~strikethrough~~
    .replace(/`(.+?)`/g, '$1')             // `code`
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')    // [text](url)
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
  // 1. 移除所有 span 标签（保留内容）
  md = md.replace(/<span\b[^>]*>(.*?)<\/span>/gis, '$1');

  // 2. 修复 strong/em 嵌套问题：将 <strong> 转为 **，<em> 转为 *
  md = md.replace(/<strong\b[^>]*>(.*?)<\/strong>/gis, '**$1**');
  md = md.replace(/<em\b[^>]*>(.*?)<\/em>/gis, '*$1*');
  md = md.replace(/<b\b[^>]*>(.*?)<\/b>/gis, '**$1**');
  md = md.replace(/<i\b[^>]*>(.*?)<\/i>/gis, '*$1*');

  // 3. 移除 div 标签
  md = md.replace(/<div\b[^>]*>(.*?)<\/div>/gis, '$1');

  // 4. 将 <br> 转为两个空格 + 换行（或者直接删掉）
  md = md.replace(/<br\s*\/?>/gi, '  \n');

  // 5. 清理表格中可能导致问题的 align 属性
  md = md.replace(/<(td|th)\s+align="[^"]*">/gi, '<$1>');

  // 6. 移除空段落或孤立的标签
  md = md.replace(/<p>\s*<\/p>/gi, '');

  return md;
}
