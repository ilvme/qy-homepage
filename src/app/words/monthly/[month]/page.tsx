import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import WordCard from '@/app/words/_components/WordCard';
import { PageHero } from '@/components/ui/PageHero';
import { getWordsGroupedByMonth } from '@/libs/words-loader';

interface MonthlyPageProps {
  params: Promise<{ month: string }>;
}

const MONTH_KEY_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function generateMetadata({ params }: MonthlyPageProps): Promise<Metadata> {
  const { month } = await params;
  if (!MONTH_KEY_RE.test(month)) return { title: '说说月刊' };
  const [y, m] = month.split('-').map(Number);
  return { title: `说说月刊 · ${y} 年 ${m} 月` };
}

export default async function WordsMonthlyMonth({ params }: MonthlyPageProps) {
  const { month } = await params;
  if (!MONTH_KEY_RE.test(month)) notFound();

  const groups = await getWordsGroupedByMonth();
  const index = groups.findIndex((g) => g.key === month);
  if (index === -1) notFound();

  const group = groups[index];
  // groups 时间倒序：上一月（更早）在后，下一月（更新）在前
  const older = groups[index + 1];
  const newer = groups[index - 1];

  // 跨年时补年份，同年只显示月份
  const label = (g: typeof group) =>
    g.year === group.year ? `${g.month} 月` : `${g.year} 年 ${g.month} 月`;

  return (
    <div className="py-8">
      <PageHero
        title={`${group.year} 年 ${group.month} 月`}
        description={`共 ${group.words.length} 条`}
        action={
          <Link
            href="/words/monthly"
            className="inline-flex p-1.5 text-sm text-secondary hover:text-foreground transition-colors"
          >
            返回月刊
          </Link>
        }
      />

      <div className="space-y-4 mt-10">
        {group.words.map((word) => (
          <WordCard
            key={word.postMeta.page_id}
            post={word as { postMeta: any; content: string }}
          />
        ))}
      </div>

      <nav className="flex items-center justify-between mt-6 pt-6">
        <div className="w-24">
          {older && (
            <Link
              href={`/words/monthly/${older.key}`}
              className="text-sm text-secondary hover:text-foreground transition-colors"
            >
              ← {label(older)}
            </Link>
          )}
        </div>

        <span className="text-sm text-secondary">
          {group.year} 年 {group.month} 月
        </span>

        <div className="w-24 text-right">
          {newer && (
            <Link
              href={`/words/monthly/${newer.key}`}
              className="text-sm text-secondary hover:text-foreground transition-colors"
            >
              {label(newer)} →
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
