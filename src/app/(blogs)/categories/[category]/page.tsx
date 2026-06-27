import type { Metadata } from 'next';
import PostItem from '@/components/ui/PostItem';
import { getPostsByCategory } from '@/libs/content-loader';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const decoded = category.includes('%') ? decodeURIComponent(category) : category;
  return {
    title: `📁 ${decoded}`,
    description: `分类「${decoded}」下的文章列表`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  let { category } = await params;
  category = category.includes('%') ? decodeURIComponent(category) : category;

  const posts = await getPostsByCategory(category);

  return (
    <div className="py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{category}</h1>
        <p className="text-secondary text-base mt-1">
          共 {posts.length} 篇文章属于此分类。
        </p>
      </header>

      <div className="space-y-6">
        {posts.map((post) => (
          <PostItem key={post.slug} postMetadata={post} />
        ))}
      </div>
    </div>
  );
}
