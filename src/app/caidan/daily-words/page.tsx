import fs from 'fs';
import type { Metadata } from 'next';
import Link from 'next/link';
import path from 'path';

export const metadata: Metadata = {
  title: '旧版说说',
  description: '往日时光机 — 过去的碎碎念',
};

const PAGE_SIZE = 50;

interface OldWord {
  title: string;
  date: string;
}

/**
 * 将中文日期字符串转换为统一格式
 * "2026年6月17日 10:36 (UTC)" → "2026/6/17 10:36"
 * "2022年5月26日 11:23" → "2022/5/26 11:23"
 */
function formatDate(raw: string): string {
  const match = raw.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{2}):(\d{2})/);
  if (match) {
    const [, year, month, day, hour, minute] = match;
    return `${year}/${Number(month)}/${Number(day)} ${hour}:${minute}`;
  }
  return raw.replace(' (UTC)', '').trim();
}

/**
 * 解析 CSV：处理引号包裹的字段（含内嵌换行和逗号）
 */
function parseCSV(content: string): OldWord[] {
  const rows: OldWord[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];

    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (
      (ch === '\n' || (ch === '\r' && content[i + 1] === '\n')) &&
      !inQuotes
    ) {
      if (ch === '\r') i++;

      if (field) {
        const lastComma = field.lastIndexOf(',');
        if (lastComma !== -1) {
          const title = field.slice(0, lastComma).trim();
          const dateStr = field.slice(lastComma + 1).trim();
          rows.push({ title, date: formatDate(dateStr) });
        }
        field = '';
      }
      continue;
    }

    field += ch;
  }

  if (field) {
    const lastComma = field.lastIndexOf(',');
    if (lastComma !== -1) {
      const title = field.slice(0, lastComma).trim();
      const dateStr = field.slice(lastComma + 1).trim();
      rows.push({ title, date: formatDate(dateStr) });
    }
  }

  return rows;
}

/** 读取并解析 CSV，跳过 header 行 */
function loadWords(): OldWord[] {
  const csvPath = path.join(process.cwd(), 'content/old-words/old-words.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  return parseCSV(content).slice(1); // 跳过 header
}

export default async function DailyWordsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const words = loadWords();
  const { page: pageParam } = await searchParams;

  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const totalPages = Math.ceil(words.length / PAGE_SIZE);
  const pagedWords = words.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">旧版说说</h1>
        <p className="text-secondary text-base mt-1">
          往日时光机 · 共 {words.length} 条碎碎念
        </p>
      </header>

      <div className="space-y-4">
        {pagedWords.map((word, i) => (
          <article
            key={`${currentPage}-${i + ''}`}
            className="border border-border rounded-lg px-4 py-3 bg-card"
          >
            <time className="text-xs text-muted-foreground block mb-1.5">
              {word.date}
            </time>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {word.title}
            </p>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          <div className="w-20">
            {currentPage > 1 && (
              <Link
                href={`/caidan/daily-words?page=${currentPage - 1}`}
                className="text-sm text-secondary hover:text-foreground transition-colors"
              >
                ← 上一页
              </Link>
            )}
          </div>

          <span className="text-sm text-secondary">
            {currentPage} / {totalPages}
          </span>

          <div className="w-20 text-right">
            {currentPage < totalPages && (
              <Link
                href={`/caidan/daily-words?page=${currentPage + 1}`}
                className="text-sm text-secondary hover:text-foreground transition-colors"
              >
                下一页 →
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
