import type { Metadata } from 'next';
import Link from 'next/link';
import CopyButton from '@/app/(shares)/awaken/_components/CopyButton';
import ExpandableContent from '@/app/(shares)/awaken/_components/ExpandableContent';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { getAllAwaken, getAwakenBySlug } from '@/libs/awaken-loader';
export const metadata: Metadata = {
  title: '唤醒',
  description: '台词、句子、古诗词古文',
};

export const dynamic = 'force-dynamic';

/** 去除 markdown 标记，获取纯文本用于复制 */
function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`[\]()>#+\-.!|{}]/g, '')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
}

export default async function AwakenPage() {
  const items = await getAllAwaken();

  // 随机选取一条，并加载正文
  const randomMeta = items[Math.floor(Math.random() * items.length)];
  const randomItem = randomMeta
    ? await getAwakenBySlug(randomMeta.title)
    : null;

  const plainText = randomItem ? stripMarkdown(randomItem.content) : '';

  return (
    <div className="py-8">
      <Link
        href="/awaken/all"
        className="text-sm text-foreground font-medium hover:underline"
      >
        查看全部（{items.length}）
      </Link>

      {/* 随机卡片 — 用留白替代边框 */}
      {randomItem && (
        <div className="max-w-xl mx-auto">
          {/* 换一条 — 卡片上方 */}
          <div className="text-center mb-4">
            <Link
              href="/awaken"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-border/40 rounded-full hover:border-border hover:bg-muted/50 text-secondary hover:text-foreground transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <title>换一条</title>
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              随机一条
            </Link>
          </div>

          <article className="relative px-4 py-8 sm:px-8 sm:py-10 rounded-lg bg-muted/30">
            {/* 装饰引号 */}
            <span
              className="absolute top-4 left-4 sm:top-5 sm:left-6 text-7xl text-muted-foreground/8 leading-none select-none"
              aria-hidden
            >
              “
            </span>

            {/* 正文 */}
            <ExpandableContent
              contentLength={randomItem.content.length}
              detailUrl={`/awaken/${randomItem.title}`}
            >
              <MarkdownRenderer
                content={randomItem.content}
                slug={false}
                highlight={false}
                className="text-base 2xl:text-lg leading-relaxed"
              />
            </ExpandableContent>

            {/* 出处 + 复制 */}
            <div className="mt-6 pt-4 border-t border-border/30 flex items-end justify-between">
              <div>
                <Link
                  href={`/awaken/${randomItem.title}`}
                  className="inline-block group"
                >
                  <span className="text-sm font-semibold text-foreground group-hover:underline underline-offset-4">
                    {randomItem.title}
                  </span>
                </Link>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                  {randomItem.author && <span>{randomItem.author}</span>}
                  {randomItem.category && <span>· {randomItem.category}</span>}
                </div>
                {randomItem.tags && randomItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {randomItem.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs text-muted-foreground/40"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <CopyButton text={plainText} />
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
