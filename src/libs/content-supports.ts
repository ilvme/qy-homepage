import fs from 'fs';
import matter from '@11ty/gray-matter';

/**
 * 解析日期字符串为 Date 对象
 * 纯日期（YYYY-MM-DD）JS 会当 UTC 零点，手动按本地时间构造
 * 带时间的 ISO 字符串自带时区，直接交给 Date 解析
 */
export function parseDate(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(dateStr);
}

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * 与 rehype-slug 保持一致的 slugify 实现
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** 清理标题中的 markdown 格式标记 */
function cleanHeadingText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim();
}

/** 从 Markdown 提取 h2/h3 标题用于 TOC */
export function extractHeadings(md: string): TocHeading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: TocHeading[] = [];
  let match;

  while ((match = headingRegex.exec(md)) !== null) {
    const level = match[1].length;
    const rawText = match[2].trim();
    const text = cleanHeadingText(rawText);
    const id = slugify(text);
    headings.push({ id, text, level });
  }

  return headings;
}

/** 从本地路径解析 markdown 文件 */
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
