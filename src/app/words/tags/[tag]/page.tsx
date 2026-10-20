import type { Metadata } from 'next';
import WordCard from '@/app/words/_components/WordCard';
import { EmptyShower } from '@/components/ui/EmptyShower';
import Pagination from '@/components/ui/Pagination';
import { paginate } from '@/libs/paginate';
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
  const { page: pageParam } = await searchParams;

  const {
    currentPage,
    totalPages,
    pagedItems: pagedWords,
  } = paginate(words, pageParam, siteConfig.pagination.wordsPageSize);

  return (
    <div className="py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-normal">
          <span>#{tag}</span>
        </h1>
        <p className="text-secondary text-base mt-1">
          共 {words.length} 条说说。
        </p>
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/words/tags/${tag}`}
      />
    </div>
  );
}
