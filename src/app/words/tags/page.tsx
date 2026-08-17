import type { Metadata } from 'next';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { PageHero } from '@/components/ui/PageHero';
import TagCloud from '@/components/ui/TagCloud';
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
        <TagCloud tags={tags} basePath="/words/tags" />
      )}
    </div>
  );
}
