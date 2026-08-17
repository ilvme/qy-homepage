import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { PageHero } from '@/components/ui/PageHero';
import { getAllWordTags } from '@/libs/words-loader';

export const metadata: Metadata = {
  title: '说说标签',
  description: '说说标签汇总',
};

export default async function WordsTagsPage() {
  const tags = await getAllWordTags();

  return (
    <div className="py-8">
      <PageHero title="Tags" description={`共 ${tags.length} 个标签`} />

      {tags.length === 0 ? (
        <EmptyShower />
      ) : (
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
          {tags.map((tag) => (
            <Link
              key={tag.label}
              href={`/words/tags/${tag.label}`}
              className="hover:underline"
            >
              <span>#</span>
              {tag.label}
              <span className="pl-1 text-secondary">{tag.count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
