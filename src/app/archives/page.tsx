import PostItem from "@/components/ui/PostItem";
import { fetchAllPosts } from "@/libs/content-loader";

export default async function Archives() {
  const posts = await fetchAllPosts();

  return (
    <div>
      <h1>Archives</h1>

      <ul>
        {posts?.map((post) => (
          <PostItem key={post.slug} postMetadata={post} />
        ))}
      </ul>
    </div>
  );
}
