import type { Metadata } from 'next';
import Link from 'next/link';
import PostItem from '@/app/(blogs)/_components/PostItem';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { PageHero } from '@/components/ui/PageHero';
import { getAllPosts } from '@/libs/content-loader';
import { siteConfig } from '@/site.config';

export const metadata: Metadata = {
  title: '文章',
  description: '技术笔记与生活随笔',
};

export default async function Archives({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const [posts] = await Promise.all([getAllPosts()]);
  const { page: pageParam } = await searchParams;

  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const totalPages = Math.ceil(posts.length / siteConfig.pagination.pageSize);
  const pagedPosts = posts.slice(
    (currentPage - 1) * siteConfig.pagination.pageSize,
    currentPage * siteConfig.pagination.pageSize,
  );

  return (
    <div className="py-8">
      <PageHero title="文章">
        <p className="text-secondary text-base mt-1">人穷龌龊事，尽揽一箩筐</p>
      </PageHero>

      {posts.length === 0 ? (
        <EmptyShower />
      ) : (
        <div className="space-y-6">
          <ul className="space-y-0.5">
            {pagedPosts.map((post) => (
              <li key={post.slug}>
                <PostItem postMetadata={post} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          <div className="w-20">
            {currentPage > 1 && (
              <Link
                href={`/posts?page=${currentPage - 1}`}
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
                href={`/posts?page=${currentPage + 1}`}
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
