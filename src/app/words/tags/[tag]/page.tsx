import type { Metadata } from 'next';
import Link from 'next/link';
import WordCard from '@/app/words/_components/WordCard';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { getWordsByTag } from '@/libs/words-loader';
import { siteConfig } from '@/site.config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const decoded = tag.includes('%') ? decodeURIComponent(tag) : tag;
  return {
    title: `#${decoded}`,
    description: `带有标签「${decoded}」的说说`,
  };
}

export default async function WordsByTag({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  let { tag } = await params;
  tag = tag.includes('%') ? decodeURIComponent(tag) : tag;

  const words = await getWordsByTag(tag);

  const currentPage = Math.max(
    1,
    parseInt((await searchParams).page ?? '1', 10) || 1,
  );
  const pageSize = siteConfig.pagination.wordsPageSize;
  const totalPages = Math.ceil(words.length / pageSize);
  const pagedWords = words.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-normal">
          <span>#{tag}</span>
        </h1>
        <p className="text-secondary text-base mt-1">共 {words.length} 条说说。</p>
      </header>

      {pagedWords.length === 0 ? (
        <EmptyShower />
      ) : (
        <div className="space-y-4">
          {pagedWords.map((word) => (
            <WordCard
              key={word?.postMeta.page_id}
              post={word as { postMeta: any; content: string }}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          <div className="w-20">
            {currentPage > 1 && (
              <Link
                href={`/words/tags/${tag}?page=${currentPage - 1}`}
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
                href={`/words/tags/${tag}?page=${currentPage + 1}`}
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
