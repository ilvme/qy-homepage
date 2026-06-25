import PostItemLite from '@/components/ui/PostItemLite';
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
    <div className="py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">文章</h1>
        <p className="text-secondary text-sm mt-1">
          博文与技术笔记，记录学习与思考的轨迹。
        </p>
      </header>

      <div className="space-y-8">
        {sortedYears.map((year) => (
          <section key={year}>
            <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-border flex items-baseline gap-2">
              {year}
              <span className="text-sm font-normal text-secondary">
                ({postsByYear?.[year].length} 篇)
              </span>
            </h2>
            <ul className="space-y-1">
              {postsByYear?.[year].map((post) => (
                <li key={post.slug}>
                  <PostItemLite postMetadata={post} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
