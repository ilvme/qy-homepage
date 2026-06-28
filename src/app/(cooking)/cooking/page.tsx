import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllCooking, getAllCookingCategories } from '@/libs/cooking-loader';

export const metadata: Metadata = {
  title: '下厨',
  description: '自己动手做的好吃的',
};

export default async function CookingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [items, categories] = await Promise.all([
    getAllCooking(),
    getAllCookingCategories(),
  ]);
  const { category: activeCategory } = await searchParams;

  const filtered = activeCategory
    ? items.filter((i) => i.category === activeCategory)
    : items;

  return (
    <div className="py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">下厨</h1>
        <p className="text-secondary text-base mt-1">
          自己动手做的好吃的 · 共 {items.length} 道
        </p>
      </header>

      {/* 分类 Tab */}
      {categories.length > 0 && (
        <nav className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/cooking"
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              !activeCategory
                ? 'bg-foreground text-background border-foreground'
                : 'border-border bg-card text-secondary hover:border-foreground/30'
            }`}
          >
            全部
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/cooking?category=${cat}`}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                activeCategory === cat
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border bg-card text-secondary hover:border-foreground/30'
              }`}
            >
              {cat}
            </Link>
          ))}
        </nav>
      )}

      {/* 图片网格 */}
      {filtered.length === 0 ? (
        <p className="text-secondary text-sm py-16 text-center">暂无内容</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((item) => (
            <Link
              key={item.slug}
              href={`/cooking/${item.slug}`}
              className="group block border border-border rounded-lg overflow-hidden bg-card hover:border-foreground/20 transition-colors"
            >
              {/* 封面图 */}
              <div className="aspect-square bg-muted overflow-hidden">
                {item.cover ? (
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    暂无图片
                  </div>
                )}
              </div>
              {/* 标题 */}
              <div className="px-2.5 py-2">
                <span className="font-medium text-xs group-hover:text-foreground transition-colors">
                  {item.title}
                </span>
                {item.date && (
                  <span className="text-xs text-muted-foreground block mt-0.5">
                    {new Date(item.date).toLocaleDateString('zh-CN')}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
