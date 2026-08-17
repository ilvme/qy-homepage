import type { Metadata } from 'next';
import Link from 'next/link';
import PostItem from '@/app/(blogs)/_components/PostItem';
import { getPostsByCategory } from '@/libs/content-loader';
import { siteConfig } from '@/site.config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const decoded = category.includes('%')
    ? decodeURIComponent(category)
    : category;
  return {
    title: `📁 ${decoded}`,
    description: `分类「${decoded}」下的文章列表`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  let { category } = await params;
  category = category.includes('%') ? decodeURIComponent(category) : category;

  const posts = await getPostsByCategory(category);
  const { page: pageParam } = await searchParams;

  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const totalPages = Math.ceil(posts.length / siteConfig.pagination.pageSize);
  const pagedPosts = posts.slice(
    (currentPage - 1) * siteConfig.pagination.pageSize,
    currentPage * siteConfig.pagination.pageSize,
  );

  return (
    <div className="py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{category}</h1>
        <p className="text-secondary text-base mt-1">
          共 {posts.length} 篇文章属于此分类。
        </p>
      </header>

      <div className="space-y-6">
        {pagedPosts.map((post) => (
          <PostItem key={post.slug} postMetadata={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          <div className="w-20">
            {currentPage > 1 && (
              <Link
                href={`/categories/${category}?page=${currentPage - 1}`}
                className="text-sm text-secondary hover:text-foreground transition-colors"
              >
                ← 上一页
              </Link>
            )}
          </div>

          <span className="text-sm text-secondary">
            {currentPage} of {totalPages}
          </span>

          <div className="w-20 text-right">
            {currentPage < totalPages && (
              <Link
                href={`/categories/${category}?page=${currentPage + 1}`}
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
