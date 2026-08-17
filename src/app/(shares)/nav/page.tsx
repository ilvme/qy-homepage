import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { getAllNavSites } from '@/libs/nav-loader';
import NavCard from './_components/NavCard';
import SideNav from './_components/SideNav';

export const metadata: Metadata = {
  title: '导航',
  description: '常用网站导航 — AI、前端生态、社区、博客等',
};

export const dynamic = 'force-dynamic';

export default async function NavPage() {
  const categories = await getAllNavSites();

  if (categories.length === 0) {
    return (
      <div className="py-8">
        <PageHero title="导航" description="常用网站导航" />
        <EmptyShower />
      </div>
    );
  }

  return (
    <div className="py-8">
      <PageHero
        title="导航"
        description="收集整理的常用网站，按分类排列。"
      />

      {/* 内容 + 目录：左侧分类卡片，右侧 sticky 分类目录 */}
      <div className="mt-8 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:gap-12 xl:items-start">
        <div>
          {categories.map((cat) => (
            <section
              key={cat.key}
              id={cat.key}
              data-nav-section
              className="mb-10"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {cat.label}
                <span className="text-sm text-muted-foreground font-normal">
                  {cat.sites.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.sites.map((site) => (
                  <NavCard key={site.title} site={site} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* 桌面端：分类目录 sticky 在右侧 */}
        <aside className="hidden xl:block xl:sticky xl:top-20 w-36">
          <SideNav categories={categories} />
        </aside>
      </div>
    </div>
  );
}
