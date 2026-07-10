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

      {/* Desktop: fixed sidebar outside the 800px content area to the left */}
      <aside
        className="hidden xl:block fixed z-10 w-36"
        style={{
          left: `max(1.5rem, calc((100vw - 800px) / 2 - 10rem))`,
          top: '5rem',
        }}
      >
        <SideNav categories={categories} />
      </aside>

      {/* Main Content */}
      <div className="mt-8">
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
    </div>
  );
}
