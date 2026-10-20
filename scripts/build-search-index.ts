import fs from 'node:fs';
import path from 'node:path';
import matter from '@11ty/gray-matter';
import { glob } from 'glob';

/**
 * 构建博客搜索索引：扫描 content/posts → public/search-index.json
 * 由 package.json 的 dev/build 命令在 next 构建前执行，保证索引与页面内容一致。
 * 产物在 .gitignore 中忽略（每次构建重新生成）。
 */

const POSTS_DIR = path.resolve(process.cwd(), 'content/posts');
const OUT_FILE = path.resolve(process.cwd(), 'public/search-index.json');

export interface SearchDoc {
  type: 'post';
  slug: string;
  title: string;
  category?: string;
  tags?: string[];
  date?: string | null;
  summary?: string;
  /** 去除 markdown 语法后的纯文本正文，用于索引与摘要展示 */
  content: string;
}

/** 轻量去除 markdown 语法，保留可读文本 */
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDate(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).getTime();
  }
  const t = new Date(dateStr).getTime();
  return Number.isNaN(t) ? 0 : t;
}

async function main() {
  const files = await glob(path.join(POSTS_DIR, '*.md'));

  const docs: SearchDoc[] = files
    .map((file) => {
      const raw = fs.readFileSync(file, 'utf-8');
      const { data, content } = matter(raw);
      return { data, content } as {
        data: Record<string, unknown>;
        content: string;
      };
    })
    .filter(({ data }) => data.status === 'published')
    .map(
      ({ data, content }): SearchDoc => ({
        type: 'post',
        slug: String(data.slug ?? ''),
        title: String(data.title ?? ''),
        category: data.category ? String(data.category) : undefined,
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : undefined,
        date: data.date ? String(data.date).slice(0, 10) : null,
        summary: data.summary ? String(data.summary) : undefined,
        content: stripMarkdown(content),
      }),
    )
    .filter((doc) => doc.slug && doc.title)
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));

  const payload = { version: 1, docs };
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(payload)}\n`);

  const size = fs.statSync(OUT_FILE).size;
  console.log(
    `搜索索引：${docs.length} 篇 → ${OUT_FILE}（${(size / 1024).toFixed(0)} KB）`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
