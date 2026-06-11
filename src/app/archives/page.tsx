import PostItemLite from '@/components/ui/PostItemLite';
import TagCloud from '@/components/ui/TagCloud';
import { getAllPosts } from '@/libs/content-loader';

export default async function Archives() {
  const posts = await getAllPosts();

  // 按年份分组
  const postsByYear = posts.reduce(
    (acc, post) => {
      const year = new Date(post.date).getFullYear().toString();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(post);
      return acc;
    },
    {} as Record<string, typeof posts>,
  );

  // 按年份降序排序
  const sortedYears = Object.keys(postsByYear).sort(
    (a, b) => Number(b) - Number(a),
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Archives</h1>

      <TagCloud />

      <div className="space-y-8">
        {sortedYears.map((year) => (
          <section key={year}>
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-gray-200">
              {year}
              <span className="text-sm text-gray-500 ml-2">
                ({postsByYear?.[year].length} 篇)
              </span>
            </h2>
            <ul className="space-y-2">
              {postsByYear?.[year].map((post) => (
                <PostItemLite key={post.slug} postMetadata={post} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
