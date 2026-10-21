import type { Metadata } from 'next';
import WordCard from '@/app/words/_components/WordCard';
import { Rss } from '@/components/icons';
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
          <a
            href="/words/rss.xml"
            title="RSS 订阅"
            className="inline-flex p-1.5 text-secondary hover:text-brand transition-colors"
          >
            <Rss size={16} />
          </a>
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
