import type { Metadata } from 'next';
import PostItem from '@/app/(blogs)/_components/PostItem';
import Pagination from '@/components/ui/Pagination';
import { getPostsByTag } from '@/libs/content-loader';
import { paginate } from '@/libs/paginate';
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

  const {
    currentPage,
    totalPages,
    pagedItems: pagedPosts,
  } = paginate(posts, pageParam, siteConfig.pagination.pageSize);

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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/tags/${tag}`}
      />
    </div>
  );
}
