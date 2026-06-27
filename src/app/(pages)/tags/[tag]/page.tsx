import type { Metadata } from 'next';
import PostItem from '@/components/ui/PostItem';
import { getPostsByTag } from '@/libs/content-loader';

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
}: {
  params: Promise<{ tag: string }>;
}) {
  let { tag } = await params;

  tag = tag.includes('%') ? decodeURIComponent(tag) : tag;

  const posts = await getPostsByTag(tag);

  return (
    <div className="py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="">#{tag}</span>
        </h1>
        <p className="text-secondary text-base mt-1">
          共 {posts.length} 篇文章。
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
