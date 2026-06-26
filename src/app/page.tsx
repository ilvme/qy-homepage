import Link from 'next/link';
import { siteConfig } from '@/site.config';
import Typewriter from '@/components/ui/Typewriter';

export default async function Home() {
  return (
    <div className="py-8 space-y-16">
      {/* Hero Section */}
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          <Typewriter text={siteConfig.hero.greeting} />
        </h1>
        <p className="text-secondary leading-relaxed text-base max-w-xl">
          {siteConfig.hero.intro}
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/posts"
            className="inline-flex items-center gap-1 text-sm px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            浏览文章
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>箭头</title>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <Link
            href="/words"
            className="inline-flex items-center gap-1 text-sm px-4 py-2 rounded-full border border-border hover:bg-muted transition-colors"
          >
            查看说说
          </Link>
        </div>
      </section>

      {/* Site Sections */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">探索</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/posts', label: '文章', desc: '博文笔记' },
            { href: '/words', label: '说说', desc: '随笔心情' },
            { href: '/share', label: '分享', desc: '书影收藏' },
            { href: '/about', label: '关于', desc: '我与小站' },
            { href: '/friends', label: '友链', desc: '朋友小站' },
            { href: '/sponsor', label: '赞赏', desc: '一杯咖啡' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block p-4 rounded-xl border border-border hover:bg-muted transition-colors group"
            >
              <h3 className="font-medium group-hover:text-foreground transition-colors">
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
