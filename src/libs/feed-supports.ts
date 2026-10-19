import { marked } from 'marked';
import { siteConfig } from '@/site.config';

/** 相对路径转绝对地址（feed 阅读器无法解析站内相对路径） */
function absolutizeUrls(html: string): string {
  return html.replace(
    /(src|href)="\/(?!\/)/g,
    (_match, attr: string) => `${attr}="${siteConfig.url}/`,
  );
}

/**
 * Markdown → feed 正文 HTML
 * GFM 表格/任务列表原生支持；Notion 内容中的内联 HTML 原样保留
 */
export function mdToFeedHtml(md: string): string {
  return absolutizeUrls(marked.parse(md, { async: false }));
}

/** 提取纯文本（去图片/链接语法/HTML 标签/Markdown 标记），用于标题和摘要 */
export function plainText(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接保留文字
    .replace(/<[^>]+>/g, '') // HTML 标签
    .replace(/[#>*_~`|-]+/g, ' ') // Markdown 标记
    .replace(/\s+/g, ' ')
    .trim();
}
