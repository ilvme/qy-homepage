import Link from 'next/link';
import {
  Cooking,
  FileText,
  Film,
  Message,
  Share,
  Sponsor,
  User,
  Users,
} from '@/components/icons';
import { siteConfig } from '@/site.config';
import HomeFeed from './_components/HomeFeed';

/** 首页卡片图标：config 只存数据，图标映射留在展示层 */
const HOME_ICONS: Record<string, typeof FileText> = {
  '/posts': FileText,
  '/words': Message,
  '/cooking': Cooking,
  '/taste': Film,
  '/awaken': Share,
  '/friends': Users,
  '/about': User,
  '/sponsor': Sponsor,
};

/** 首页探索卡片：目标是补充曝光，不复读顶栏与页脚已有的入口 */
const HOME_LINKS = siteConfig.navLinks.filter((l) =>
  l.surfaces.includes('home'),
);

export default async function Home() {
  return (
    <div className="py-8 space-y-16">
      {/* Hero Section */}
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-normal">
          {siteConfig.hero.greeting}
        </h1>
        <p className="text-secondary leading-relaxed text-base max-w-xl">
          {siteConfig.hero.intro}
        </p>
      </section>

      {/* 最近更新：文章 + 说说混排 */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-base font-semibold">最近更新</h2>
        </div>
        <HomeFeed />
      </section>

      {/* Site Sections */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">探索</h2>
        <div className="grid grid-cols-3 gap-3">
          {HOME_LINKS.map((item) => {
            const Icon = HOME_ICONS[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                className="block p-4 rounded-xl border border-border hover:-translate-y-0.5 hover:bg-muted/60 transition-all duration-200 group"
              >
                <h3 className="font-medium transition-colors flex items-center gap-1.5">
                  {Icon && <Icon size={15} className="shrink-0" />}
                  {item.label}
                </h3>
                {item.desc && (
                  <p className="text-xs text-secondary mt-1">{item.desc}</p>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
