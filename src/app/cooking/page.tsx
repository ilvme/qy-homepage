import type { Metadata } from 'next';
import Link from 'next/link';
import { ImageGallery } from '@/app/cooking/_components/ImageGallery';
import { PageHero } from '@/components/ui/PageHero';
import { getAllCooking, getAllCookingCategories } from '@/libs/cooking-loader';
import { siteConfig } from '@/site.config';

export const metadata: Metadata = {
  title: '下厨',
  description: '自己动手做的好吃的',
};

export default async function CookingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const [items, categories] = await Promise.all([
    getAllCooking(),
    getAllCookingCategories(),
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

  const pageSize = siteConfig.pagination.cookingPageSize;
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // 分类切换时跳回第一页
  const categoryQS = activeCategory ? `category=${activeCategory}&` : '';

  return (
    <div className="py-8">
      <PageHero
        title="食者"
        description={`自己动手做的好吃的，共 ${items.length} 道`}
      />

      {/* 分类 Tab */}
      {categories.length > 0 && (
        <nav className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
          <Link
            href="/cooking"
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
              href={`/cooking?category=${cat}`}
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

      {/* 图片网格 */}
      <ImageGallery items={pagedItems} baseUrl="/cooking" />

      {/* 分页 */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          <div className="w-16">
            {currentPage > 1 && (
              <Link
                href={`/cooking?${categoryQS}page=${currentPage - 1}`}
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
                href={`/cooking?${categoryQS}page=${currentPage + 1}`}
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
