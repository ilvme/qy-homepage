import PostItem from '@/components/ui/PostItem';
import { getPostsByTag } from '@/libs/content-loader';

export default async function Tags({ params }: { params: Promise<{ tag: string }> }) {
  let { tag } = await params;

  tag = tag.includes('%') ? decodeURIComponent(tag) : tag;

  const posts = await getPostsByTag(tag);

  return (
    <div className="py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          标签: <span className="text-secondary">#{tag}</span>
        </h1>
        <p className="text-secondary text-sm mt-1">
          共 {posts.length} 篇文章带有此标签。
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
