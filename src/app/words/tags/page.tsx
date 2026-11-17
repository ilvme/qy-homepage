import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { PageHero } from '@/components/ui/PageHero';
import { Rss } from '@/components/icons';
import { getAllWordTags } from '@/libs/words-loader';

export const metadata: Metadata = {
  title: '说说标签',
  description: '说说标签汇总',
};

export default async function WordsTagsPage() {
  const tags = await getAllWordTags();

  return (
    <div className="py-8">
      <PageHero
        title="说说标签"
        description={`共 ${tags.length} 个标签`}
        action={
          <div className="flex items-center gap-3">
            <Link
              href="/words/monthly"
              className="inline-flex p-1.5 text-sm text-secondary hover:text-foreground transition-colors"
            >
              月刊
            </Link>
            <Link
              href="/words"
              className="inline-flex p-1.5 text-sm text-secondary hover:text-foreground transition-colors"
            >
              时间流
            </Link>
            <a
              href="/words/rss.xml"
              title="RSS 订阅"
              className="inline-flex p-1.5 text-secondary hover:text-foreground transition-colors"
            >
              <Rss size={16} />
            </a>
          </div>
        }
      />

      {tags.length === 0 ? (
        <EmptyShower />
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
          {tags.map((tag) => (
            <Link
              key={tag.label}
              href={`/words/tags/${tag.label}`}
              className="group flex flex-col gap-0.5 min-w-0"
            >
              <span className="text-base leading-tight truncate">
                #{tag.label}
              </span>
              <span className="font-mono text-xs text-secondary tabular-nums transition-colors group-hover:text-foreground">
                {tag.count} 条
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
