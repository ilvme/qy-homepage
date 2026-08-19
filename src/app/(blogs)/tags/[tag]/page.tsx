import type { Metadata } from 'next';
import Link from 'next/link';
import PostItem from '@/app/(blogs)/_components/PostItem';
import { getPostsByTag } from '@/libs/content-loader';
import { siteConfig } from '@/site.config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const decoded = tag.includes('%') ? decodeURIComponent(tag) : tag;
  return {
    title: `#${decoded}`,
    description: `带有标签「${decoded}」的文章列表`,
  };
}

export default async function Tags({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  let { tag } = await params;

  tag = tag.includes('%') ? decodeURIComponent(tag) : tag;

  const posts = await getPostsByTag(tag);
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
        <h1 className="text-3xl font-semibold tracking-normal">
          <span className="">#{tag}</span>
        </h1>
        <p className="text-secondary text-base mt-1">
          共 {posts.length} 篇文章。
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
                href={`/tags/${tag}?page=${currentPage - 1}`}
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
                href={`/tags/${tag}?page=${currentPage + 1}`}
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
