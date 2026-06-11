import PostItem from '@/components/ui/PostItem';
import { getAllPosts } from '@/libs/content-loader';

export default async function Articles() {
  const posts = await getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Articles</h1>

      <div className="space-y-8">
        {posts.map((post) => (
          <PostItem key={post.slug} postMetadata={post} />
        ))}
      </div>
    </div>
  );
}
