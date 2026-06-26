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
  // 1. <empty-block/> 序列 → 等比空行
  //    1 个 → \n\n（段落分隔，即 1 个空行）
  //    2 个 → \n\n<br />\n\n（2 个空行）
  //    N 个 → \n\n + (N-1) 个 <br /> + \n\n
  md = md.replace(/(<empty-block\/>\n?)+/g, (match) => {
    const count = (match.match(/<empty-block\/>/g) || []).length;
    if (count === 1) return '\n\n';
    return '\n\n' + '<br />\n'.repeat(count - 1) + '\n';
  });

  // 2. Notion 文本块之间用单个 \n 分隔，标准 Markdown 会忽略它
  //    添加两个尾随空格使其变成硬换行（Markdown line break）
  md = md.replace(/([^\n])\n(?=[^\n])/g, '$1  \n');

  // 3. {color="..."} → Notion 内联颜色标记，移除
  md = md.replace(/\s*\{color="[^"]*"\}/g, '');

  // 4. <span> → 移除标签保留内容（避免 rehype-raw 嵌套解析冲突）
  md = md.replace(/<span\b[^>]*>(.*?)<\/span>/gis, '$1');

  // 5. 清理表格 align 属性
  md = md.replace(/<(td|th)\s+align="[^"]*">/gi, '<$1>');

  // 6. 移除空段落
  md = md.replace(/<p>\s*<\/p>/gi, '');

  return md;
}
