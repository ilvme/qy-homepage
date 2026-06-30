import fs from 'fs';
import matter from '@11ty/gray-matter';

/** 补零 */
function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** ISO 时间戳转为中国时区 YYYY-MM-DDTHH:mm:ss */
function toChinaTimeStr(d: Date): string {
  const china = new Date(d.getTime() + 8 * 3600 * 1000);
  return `${china.getUTCFullYear()}-${pad(china.getUTCMonth() + 1)}-${pad(china.getUTCDate())}T${pad(china.getUTCHours())}:${pad(china.getUTCMinutes())}:${pad(china.getUTCSeconds())}`;
}

/**
 * 将 Notion 日期转为中国时区 YYYY-MM-DD（去时间）
 * 纯日期原样返回，ISO 时间戳转为中国日期
 */
export function toLocalDateStr(iso: string | null): string | null {
  if (!iso) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return toChinaTimeStr(d).substring(0, 10);
}

/**
 * 将 Notion 日期转为中国时区（保留时间）
 * 纯日期原样返回，ISO 时间戳转为中国时间 YYYY-MM-DDTHH:mm:ss
 */
export function toLocalTimeStr(iso: string | null): string | null {
  if (!iso) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return toChinaTimeStr(d);
}

/**
 * 解析日期字符串为 Date
 * 纯日期（YYYY-MM-DD）手动构造避免 UTC 偏差
 * ISO 字符串自带时区，直接交给 Date
 */
export function parseDate(dateStr: string | null): Date {
  if (!dateStr) return new Date(0);
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
