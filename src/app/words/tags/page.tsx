import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, List, Rss } from '@/components/icons';
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
      <PageHero
        title="说说标签"
        description={`共 ${tags.length} 个标签`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/words/monthly"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-secondary hover:text-foreground hover:border-foreground/30 hover:bg-muted/60 transition-colors"
            >
              <Calendar size={14} className="shrink-0" />
              月刊
            </Link>
            <Link
              href="/words"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-secondary hover:text-foreground hover:border-foreground/30 hover:bg-muted/60 transition-colors"
            >
              <List size={14} className="shrink-0" />
              时间流
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
