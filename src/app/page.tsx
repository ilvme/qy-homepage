import Link from 'next/link';
import Typewriter from '@/components/ui/Typewriter';
import { siteConfig } from '@/site.config';

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              href: '/posts',
              label: '文章',
              desc: '博文笔记',
              icon: (
                <>
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </>
              ),
            },
            {
              href: '/words',
              label: '说说',
              desc: '随笔心情',
              icon: (
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              ),
            },
            {
              href: '/taste',
              label: '风味',
              desc: '书影音收藏',
              icon: (
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              ),
            },
            {
              href: '/awaken',
              label: '唤醒',
              desc: '语录与感悟',
              icon: (
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              ),
            },
            {
              href: '/about',
              label: '关于',
              desc: '我与小站',
              icon: (
                <>
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </>
              ),
            },
            {
              href: '/friends',
              label: '友链',
              desc: '朋友小站',
              icon: (
                <>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </>
              ),
            },
            {
              href: '/sponsor',
              label: '赞赏',
              desc: '一杯咖啡',
              icon: (
                <>
                  <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                  <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                  <line x1="6" y1="2" x2="6" y2="4" />
                  <line x1="10" y1="2" x2="10" y2="4" />
                  <line x1="14" y1="2" x2="14" y2="4" />
                </>
              ),
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block p-4 rounded-xl border border-border hover:bg-muted transition-colors group"
            >
              <h3 className="font-medium group-hover:text-foreground transition-colors flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-muted-foreground"
                >
                  {item.icon}
                </svg>
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
