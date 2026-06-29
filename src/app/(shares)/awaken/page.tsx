import type { Metadata } from 'next';
import Link from 'next/link';
import AwakenCard from '@/app/(shares)/awaken/_components/AwakenCard';
import { PageHero } from '@/components/ui/PageHero';
import { getAllAwaken, getAllAwakenCategories } from '@/libs/awaken-loader';
import { siteConfig } from '@/site.config';

export const metadata: Metadata = {
  title: '分享',
  description: '绵薄之力',
};

export default async function AwakenPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const [items, categories] = await Promise.all([
    getAllAwaken(),
    getAllAwakenCategories(),
  ]);
  const { category: activeCategory, page: pageParam } = await searchParams;

  // 统计各分类数量
  const categoryCounts = new Map<string, number>();
  for (const item of items) {
    if (item.category) {
      categoryCounts.set(
        item.category,
        (categoryCounts.get(item.category) ?? 0) + 1,
      );
    }
  }

  const filtered = activeCategory
    ? items.filter((i) => i.category === activeCategory)
    : items;

  const pageSize = siteConfig.pagination.awakenPageSize;
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const categoryQS = activeCategory ? `category=${activeCategory}&` : '';

  return (
    <div className="py-8">
      <PageHero
        title="唤醒"
        description={`台词、句子、古文诗词，共 ${items.length} 篇`}
      />

      {/* 分类 Tab */}
      {categories.length > 0 && (
        <nav className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
          <Link
            href="/awaken"
            className={`text-sm transition-colors ${
              !activeCategory
                ? 'text-foreground font-semibold'
                : 'text-secondary hover:text-foreground'
            }`}
          >
            全部（{items.length}）
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/awaken?category=${cat}`}
              className={`text-sm transition-colors ${
                activeCategory === cat
                  ? 'text-foreground font-semibold'
                  : 'text-secondary hover:text-foreground'
              }`}
            >
              {cat}（{categoryCounts.get(cat) ?? 0}）
            </Link>
          ))}
        </nav>
      )}

      {/* 文字列表 */}
      <div className="divide-y divide-border">
        {pagedItems.map((item) => (
          <AwakenCard key={item.title} item={item} />
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          <div className="w-16">
            {currentPage > 1 && (
              <Link
                href={`/awaken?${categoryQS}page=${currentPage - 1}`}
                className="text-sm text-secondary hover:text-foreground transition-colors"
              >
                ← 上一页
              </Link>
            )}
          </div>

          <span className="text-sm text-secondary">
            {currentPage} / {totalPages}
          </span>

          <div className="w-16 text-right">
            {currentPage < totalPages && (
              <Link
                href={`/awaken?${categoryQS}page=${currentPage + 1}`}
                className="text-sm text-secondary hover:text-foreground transition-colors"
              >
                下一页 →
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
