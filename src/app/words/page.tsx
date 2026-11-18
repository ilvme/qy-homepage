import type { Metadata } from 'next';
import Link from 'next/link';
import WordCard from '@/app/words/_components/WordCard';
import { Calendar, Rss, Tag } from '@/components/icons';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { PageHero } from '@/components/ui/PageHero';
import Pagination from '@/components/ui/Pagination';
import { paginate } from '@/libs/paginate';
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
  const words = await getAllWords();
  const { page: pageParam } = await searchParams;

  const {
    currentPage,
    totalPages,
    pagedItems: pagedWords,
  } = paginate(words, pageParam, siteConfig.pagination.wordsPageSize);

  return (
    <div className="py-8 space-y-4">
      <PageHero
        title="说说"
        description="生活碎片、猫咪日常，以及一些吐槽。"
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/words/tags"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-secondary hover:text-foreground hover:border-foreground/30 hover:bg-muted/60 transition-colors"
            >
              <Tag size={14} className="shrink-0" />
              标签
            </Link>
            <Link
              href="/words/monthly"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-secondary hover:text-foreground hover:border-foreground/30 hover:bg-muted/60 transition-colors"
            >
              <Calendar size={14} className="shrink-0" />
              月刊
            </Link>
            <a
              href="/words/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-secondary hover:text-foreground hover:border-foreground/30 hover:bg-muted/60 transition-colors"
            >
              <Rss size={14} className="shrink-0" />
              订阅
            </a>
          </div>
        }
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/words"
      />
    </div>
  );
}
