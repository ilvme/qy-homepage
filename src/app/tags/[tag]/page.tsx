import PostItem from '@/components/ui/PostItem';
import { getPostsByTag } from '@/libs/content-loader';

export default async function Tags({ params }) {
  let { tag } = await params;

  tag = tag.includes('%') ? decodeURIComponent(tag) : tag;

  const posts = await getPostsByTag(tag);

  console.log('tag', tag, posts.length);
  return (
    <div>
      <h1 className="text-3xl font-bold">Tags</h1>

      <div className="space-y-8">
        {posts.map((post) => (
          <PostItem key={post.slug} postMetadata={post} />
        ))}
      </div>
    </div>
  );
}
