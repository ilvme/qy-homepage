import Link from 'next/link';
import {
  Bookmark,
  Cooking,
  FileText,
  Message,
  Share,
  User,
} from '@/components/icons';
import { siteConfig } from '@/site.config';
import HomeFeed from './_components/HomeFeed';

export default async function Home() {
  return (
    <div className="py-8 space-y-16">
      {/* Hero Section */}
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-normal">
          {siteConfig.hero.greeting}
        </h1>
        <p className="text-secondary leading-relaxed text-base max-w-xl">
          {siteConfig.hero.intro}
        </p>
      </section>

      {/* 最近更新：文章 + 说说混排 */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-medium">最近更新</h2>
          <Link
            href="/posts"
            className="text-sm text-secondary transition-colors hover:text-brand"
          >
            全部文章
          </Link>
        </div>
        <HomeFeed />
      </section>

      {/* Site Sections */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">探索</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              href: '/posts',
              label: '文章',
              desc: '博文笔记',
              Icon: FileText,
            },
            {
              href: '/words',
              label: '说说',
              desc: '随笔心情',
              Icon: Message,
            },
            {
              href: '/cooking',
              label: '食者',
              desc: '下厨记录',
              Icon: Cooking,
            },
            {
              href: '/taste',
              label: '书影音',
              desc: '书影音收藏',
              Icon: Bookmark,
            },
            {
              href: '/awaken',
              label: '分享',
              desc: '语录与感悟',
              Icon: Share,
            },
            {
              href: '/about',
              label: '关于',
              desc: '我与小站',
              Icon: User,
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block p-4 rounded-xl border border-border hover:-translate-y-0.5 hover:shadow-sm hover:border-brand/40 hover:bg-muted/60 transition-all duration-200 group"
            >
              <h3 className="font-medium group-hover:text-brand transition-colors flex items-center gap-1.5">
                <item.Icon size={15} className="shrink-0 text-brand" />
                {item.label}
              </h3>
              <p className="text-xs text-secondary mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
