'use client';

import type MiniSearch from 'minisearch';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Search as SearchIcon } from '@/components/icons';
import { tokenize } from '@/libs/search-tokenizer';

interface SearchDoc {
  slug: string;
  title: string;
  category?: string;
  date?: string | null;
  summary?: string;
  content: string;
}

interface ResultItem extends SearchDoc {
  snippet: string;
}

interface IndexBundle {
  docs: SearchDoc[];
  miniSearch: MiniSearch;
}

const RESULT_LIMIT = 8;
const RECENT_LIMIT = 5;

/** 索引与 MiniSearch 实例的模块级缓存：首次唤起才加载，之后零开销 */
let indexCache: IndexBundle | null = null;
let indexPromise: Promise<IndexBundle> | null = null;

async function loadIndex(): Promise<IndexBundle> {
  if (indexCache) return indexCache;
  indexPromise ??= (async () => {
    const [{ default: MiniSearch }, res] = await Promise.all([
      import('minisearch'),
      fetch('/search-index.json'),
    ]);
    if (!res.ok) throw new Error(`索引加载失败：${res.status}`);
    const { docs } = (await res.json()) as { docs: SearchDoc[] };
    const miniSearch = new MiniSearch({
      idField: 'slug',
      fields: ['title', 'summary', 'content', 'category', 'tags'],
      storeFields: ['slug', 'title', 'category', 'date', 'summary', 'content'],
      tokenize,
      searchOptions: {
        prefix: true,
        combineWith: 'AND',
        boost: { title: 3, category: 2, tags: 2, summary: 2, content: 1 },
      },
    });
    miniSearch.addAll(docs);
    indexCache = { docs, miniSearch };
    return indexCache;
  })();
  return indexPromise;
}

/** 从正文提取首个命中附近的上下文片段 */
function extractSnippet(content: string, query: string, radius = 24): string {
  const q = query.trim();
  if (!q || !content) return '';
  let idx = content.indexOf(q);
  if (idx < 0) {
    // 整串未在正文出现（可能命中在标题）：依次尝试查询内的相邻 bigram，再退首个单字
    const cjk = q.match(/[一-鿿]+/);
    for (let i = 0; idx < 0 && cjk && i + 2 <= cjk[0].length; i++) {
      idx = content.indexOf(cjk[0].slice(i, i + 2));
    }
    if (idx < 0) {
      for (const ch of q) {
        const i = content.indexOf(ch);
        if (i >= 0) {
          idx = i;
          break;
        }
      }
    }
  }
  if (idx < 0) return '';
  const start = Math.max(0, idx - radius);
  const end = Math.min(content.length, idx + q.length + radius);
  return `${start > 0 ? '…' : ''}${content.slice(start, end)}${end < content.length ? '…' : ''}`;
}

/** 命中词高亮（子串级，符合中文搜索直觉） */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q || !text.includes(q)) return <>{text}</>;
  const parts = text.split(q);
  return (
    <>
      {parts.map((part, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 纯展示的分片静态列表，无重排风险
        <span key={i}>
          {i > 0 && (
            <mark className="bg-transparent text-brand font-medium">{q}</mark>
          )}
          {part}
        </span>
      ))}
    </>
  );
}

export default function SearchPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 打开：重置状态、聚焦输入框、锁定滚动、加载索引
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setDebounced('');
    setActive(0);
    inputRef.current?.focus();
    loadIndex()
      .then(({ docs }) => {
        setReady(true);
        setTotal(docs.length);
      })
      .catch(() => setFailed(true));
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // 输入防抖
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 150);
    return () => clearTimeout(timer);
  }, [query]);

  // 查询（空查询显示最近文章）
  useEffect(() => {
    if (!open || !ready) return;
    const q = debounced.trim();
    if (!q) {
      loadIndex().then(({ docs }) => {
        setResults(
          docs.slice(0, RECENT_LIMIT).map((d) => ({ ...d, snippet: '' })),
        );
        setActive(0);
      });
      return;
    }
    loadIndex().then(({ miniSearch }) => {
      const hits = miniSearch
        .search(q)
        .slice(0, RESULT_LIMIT)
        .map((hit) => {
          const doc = hit as unknown as SearchDoc;
          return { ...doc, snippet: extractSnippet(doc.content ?? '', q) };
        });
      setResults(hits);
      setActive(0);
    });
  }, [debounced, ready, open]);

  // 选中项滚动到可视区
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const go = (item: ResultItem) => {
    onClose();
    router.push(`/posts/${item.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      const item = results[active];
      if (item) go(item);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const q = debounced.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="搜索文章"
    >
      {/* 遮罩：button 承载点击关闭，避免 div 交互的 a11y 问题 */}
      <button
        type="button"
        aria-label="关闭搜索"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 cursor-default"
      />

      <div className="relative mx-4 mt-[12vh] flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg max-h-[70vh]">
        {/* 输入行 */}
        <div className="flex shrink-0 items-center gap-2.5 border-b border-border px-4">
          <SearchIcon size={18} className="shrink-0 text-secondary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索文章…"
            aria-label="搜索文章"
            className="flex-1 bg-transparent py-3.5 text-base outline-none placeholder:text-muted-foreground"
          />
          <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-secondary">
            ESC
          </kbd>
        </div>

        {/* 结果列表 */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2">
          {failed ? (
            <div className="px-3 py-8 text-center text-sm text-secondary">
              索引加载失败，请刷新重试
            </div>
          ) : !ready ? (
            <div className="px-3 py-8 text-center text-sm text-secondary">
              索引加载中…
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-secondary">
              {q ? '没有找到相关文章' : '暂无文章'}
            </div>
          ) : (
            <>
              {!q && (
                <div className="px-3 pb-1 pt-2 text-xs text-muted-foreground">
                  最近文章
                </div>
              )}
              {results.map((item, i) => (
                <button
                  type="button"
                  key={item.slug}
                  data-idx={i}
                  onClick={() => go(item)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left ${
                    i === active ? 'bg-muted' : ''
                  }`}
                >
                  <span className="text-sm font-medium text-foreground">
                    <Highlight text={item.title} query={q} />
                  </span>
                  <span className="truncate text-xs text-secondary">
                    {item.category ?? ''}
                    {item.category && ' · '}
                    {item.date ?? ''}
                    {item.snippet && ` · ${item.snippet}`}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* 底部提示 */}
        <div className="flex shrink-0 items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <span>↑↓ 选择 · Enter 打开 · Esc 关闭</span>
          <span>共 {total} 篇</span>
        </div>
      </div>
    </div>
  );
}
