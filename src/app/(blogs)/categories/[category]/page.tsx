import type { Metadata } from 'next';
import PostItem from '@/app/(blogs)/_components/PostItem';
import Pagination from '@/components/ui/Pagination';
import { getPostsByCategory } from '@/libs/content-loader';
import { paginate } from '@/libs/paginate';
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
    title: `${decoded}`,
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

  const {
    currentPage,
    totalPages,
    pagedItems: pagedPosts,
  } = paginate(posts, pageParam, siteConfig.pagination.pageSize);

  return (
    <div className="py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-normal">{category}</h1>
        <p className="text-secondary text-base mt-1">
          共 {posts.length} 篇文章属于此分类。
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
        basePath={`/categories/${category}`}
      />
    </div>
  );
}
