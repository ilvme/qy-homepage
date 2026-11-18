import type { Metadata } from 'next';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { PageHero } from '@/components/ui/PageHero';
import TagCloud from '@/components/ui/TagCloud';
import { getAllTags } from '@/libs/content-loader';

export const metadata: Metadata = {
  title: '标签',
  description: '文章标签',
};

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <div className="py-8">
      <PageHero title="标签" description={`共 ${tags.length} 个标签`} />

      {tags.length === 0 ? (
        <EmptyShower />
      ) : (
        <TagCloud tags={tags} basePath="/tags" />
      )}
    </div>
  );
}
