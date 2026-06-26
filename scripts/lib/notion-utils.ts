/**
 * 清理从 Notion 获取的 Markdown 中的非标准内容
 *
 * - <empty-block/> 不是合法 HTML，转换为两个换行（段落分隔）
 * - <span> 标签内部可能嵌套 markdown 语法（如 **bold**），
 *   rehype-raw 无法正确解析此类混合内容，因此移除 span 标签保留内容
 * - 其余 HTML 标签（<details>/<summary>/<strong>/<em>/<br>/<div>）保留，
 *   由渲染侧的 rehype-raw 处理
 */
export function cleanNotionMarkdown(md: string): string {
  // 1. <empty-block/> → 段落分隔（markdown 用空行分隔段落）
  md = md.replace(/<empty-block\/>/g, '\n\n');

  // 2. <span> → 移除标签保留内容（避免 rehype-raw 嵌套解析冲突）
  md = md.replace(/<span\b[^>]*>(.*?)<\/span>/gis, '$1');

  return md;
}
