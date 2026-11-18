import type { Metadata } from 'next';
import Link from 'next/link';
import { List, Rss, Tag } from '@/components/icons';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { PageHero } from '@/components/ui/PageHero';
import {
  getAllWords,
  getWordsGroupedByMonth,
  type WordsMonthGroup,
} from '@/libs/words-loader';

export const metadata: Metadata = {
  title: '说说月刊',
  description: '按月归档的碎碎念',
};

export default async function WordsMonthlyIndex() {
  const [words, groups] = await Promise.all([
    getAllWords(),
    getWordsGroupedByMonth(),
  ]);

  // 月份倒序 → 按年份分组，年份也倒序
  const yearMap = new Map<number, WordsMonthGroup[]>();
  for (const group of groups) {
    const list = yearMap.get(group.year) ?? [];
    list.push(group);
    yearMap.set(group.year, list);
  }

  return (
    <div className="py-8">
      <PageHero
        title="说说月刊"
        description="按月归档的碎碎念，另一种翻阅方式。"
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

      {words.length === 0 ? (
        <EmptyShower />
      ) : (
        <div className="mt-12 space-y-10">
          {[...yearMap.entries()].map(([year, yearGroups]) => {
            const total = yearGroups.reduce(
              (sum, g) => sum + g.words.length,
              0,
            );
            return (
              <section key={year}>
                <h2 className="flex items-baseline gap-2">
                  <span className="text-lg font-bold tracking-tight">
                    {year} 年
                  </span>
                  <span className="font-mono text-xs text-secondary tabular-nums">
                    {total} 条
                  </span>
                </h2>
                <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-4 md:grid-cols-6">
                  {yearGroups.map((group) => (
                    <Link
                      key={group.key}
                      href={`/words/monthly/${group.key}`}
                      className="group flex flex-col gap-0.5"
                    >
                      <span className="text-base leading-tight">
                        {group.month} 月
                      </span>
                      <span className="font-mono text-xs text-secondary tabular-nums transition-colors group-hover:text-foreground">
                        {group.words.length} 条
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
