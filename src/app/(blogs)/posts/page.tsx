import type { Metadata } from 'next';
import Link from 'next/link';
import PostItem from '@/app/(blogs)/_components/PostItem';
import { Folder, Rss } from '@/components/icons';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { PageHero } from '@/components/ui/PageHero';
import Pagination from '@/components/ui/Pagination';
import { getAllPosts } from '@/libs/content-loader';
import { paginate } from '@/libs/paginate';
import { getNavTitle, siteConfig } from '@/site.config';

export const metadata: Metadata = {
  title: getNavTitle('/posts'),
  description: '技术笔记与生活随笔',
};

export default async function Posts({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const posts = await getAllPosts();
  const { page: pageParam } = await searchParams;

  const {
    currentPage,
    totalPages,
    pagedItems: pagedPosts,
  } = paginate(posts, pageParam, siteConfig.pagination.pageSize);

  return (
    <div className="py-8">
      <PageHero
        title={getNavTitle('/posts')}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/archives"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-secondary hover:text-foreground hover:border-foreground/30 hover:bg-muted/60 transition-colors"
            >
              <Folder size={14} className="shrink-0" />
              归档
            </Link>
            <a
              href="/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-secondary hover:text-foreground hover:border-foreground/30 hover:bg-muted/60 transition-colors"
            >
              <Rss size={14} className="shrink-0" />
              订阅
            </a>
          </div>
        }
      >
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/posts"
      />
    </div>
  );
}
