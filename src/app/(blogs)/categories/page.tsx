import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { PageHero } from '@/components/ui/PageHero';
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
      <PageHero title="分类" description={`共 ${categories.length} 个分类`} />

      {categories.length === 0 ? (
        <EmptyShower />
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
