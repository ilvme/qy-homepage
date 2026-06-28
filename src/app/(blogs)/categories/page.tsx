import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { getAllCategories, getAllPosts } from '@/libs/content-loader';

export const metadata: Metadata = {
  title: '分类',
  description: '文章分类',
};

export default async function CategoriesPage() {
  const [categories, posts] = await Promise.all([
    getAllCategories(),
    getAllPosts(),
  ]);

  const categoryCounts = new Map<string, number>();
  for (const p of posts) {
    if (p.category) {
      categoryCounts.set(p.category, (categoryCounts.get(p.category) ?? 0) + 1);
    }
  }

  return (
    <div className="py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">分类</h1>
        <p className="text-secondary text-base mt-1">
          共 {categories.length} 个分类
        </p>
      </header>

      {categories.length === 0 ? (
        <EmptyState message="还没有分类" />
      ) : (
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
          <Link
            key={cat}
            href={`/categories/${cat}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            {cat}
            <span className="text-xs text-secondary">
              {categoryCounts.get(cat) ?? 0}
            </span>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
