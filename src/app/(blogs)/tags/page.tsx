import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { PageHero } from '@/components/ui/PageHero';
import { getAllTags } from '@/libs/content-loader';

export const metadata: Metadata = {
  title: 'Tags',
  description: '文章标签',
};

export default async function TagsPage() {
  const tags = await getAllTags();

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
              href={`/tags/${tag.label}`}
              className="hover:underline"
            >
              <span className="">#</span>
              {tag.label}
              <span className="pl-1 text-secondary">{tag.count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
