import type { Metadata } from 'next';
import Link from 'next/link';
import WordCard from '@/app/words/_components/WordCard';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { PageHero } from '@/components/ui/PageHero';
import { getAllWords } from '@/libs/words-loader';
import { siteConfig } from '@/site.config';

export const metadata: Metadata = {
  title: '说说',
  description: '碎片化的思考与记录',
};

export default async function ShuoShuo({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const [words] = await Promise.all([getAllWords()]);
  const { page: pageParam } = await searchParams;

  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const totalPages = Math.ceil(words.length / siteConfig.pagination.wordsPageSize);
  const pagedWords = words.slice(
    (currentPage - 1) * siteConfig.pagination.wordsPageSize,
    currentPage * siteConfig.pagination.wordsPageSize,
  );

  return (
    <div className="py-8 space-y-4">
      <PageHero
        title="说说"
        description="生活碎片、猫咪日常，以及一些忍不住的吐槽。"
      />

      {words.length === 0 ? (
        <EmptyShower />
      ) : (
        <div className="space-y-4 mt-10">
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
                href={`/words?page=${currentPage - 1}`}
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
                href={`/words?page=${currentPage + 1}`}
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
