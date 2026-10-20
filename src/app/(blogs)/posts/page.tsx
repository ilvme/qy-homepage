import type { Metadata } from 'next';
import PostItem from '@/app/(blogs)/_components/PostItem';
import { Rss } from '@/components/icons';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { PageHero } from '@/components/ui/PageHero';
import Pagination from '@/components/ui/Pagination';
import { getAllPosts } from '@/libs/content-loader';
import { paginate } from '@/libs/paginate';
import { siteConfig } from '@/site.config';

export const metadata: Metadata = {
  title: '文章',
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
        title="文章"
        action={
          <a
            href="/rss.xml"
            title="RSS 订阅"
            className="inline-flex p-1.5 rounded-md text-secondary hover:text-foreground hover:bg-muted transition-colors"
          >
            <Rss size={16} />
          </a>
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
