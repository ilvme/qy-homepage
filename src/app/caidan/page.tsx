import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';

export const metadata: Metadata = {
  title: '彩蛋',
  description: '一些不对外开放但有趣的东西',
  robots: 'noindex, nofollow',
};

const eggs = [
  {
    title: '旧版说说',
    description: '往日时光机，从 flomo 时代遗留下来的 580+ 条碎碎念。',
    href: '/caidan/daily-words',
  },
];

export default function CaidanPage() {
  return (
    <div className="py-8 max-w-2xl">
      <PageHero
        title="🥚 彩蛋"
        description="这里藏着一些不对外开放但我觉得有趣的东西。"
      />

      <ul className="space-y-3">
        {eggs.map((egg) => (
          <li key={egg.href}>
            <Link
              href={egg.href}
              className="block border border-border rounded-lg px-5 py-4 bg-card hover:border-foreground/20 transition-colors"
            >
              <span className="font-medium">{egg.title}</span>
              <span className="text-sm text-secondary block mt-0.5">
                {egg.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
