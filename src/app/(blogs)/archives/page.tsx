import type { Metadata } from 'next';
import PostItemLite from '@/components/ui/PostItemLite';
import { getAllPosts, getPostStats } from '@/libs/content-loader';

export const metadata: Metadata = {
  title: '文章',
  description: '技术笔记与生活随笔',
};

export default async function Archives() {
  const [posts, stats] = await Promise.all([getAllPosts(), getPostStats()]);

  // 按年份分组
  const postsByYear = posts.reduce(
    (acc, post) => {
      const year = new Date(post.date).getFullYear().toString();
      if (!acc[year]) acc[year] = [];
      acc[year].push(post);
      return acc;
    },
    {} as Record<string, typeof posts>,
  );

  const sortedYears = Object.keys(postsByYear).sort(
    (a, b) => Number(b) - Number(a),
  );

  return (
    <div className="py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">归档</h1>
        <p className="text-secondary text-base mt-1">
          共 {stats.totalPosts} 篇文章
          {stats.totalWords > 0 && <> ，约 {stats.totalWords} 字</>}
        </p>
      </header>

      <div className="space-y-6">
        {sortedYears.map((year) => (
          <section key={year}>
            <h2 className="text-lg font-semibold mb-2">{year}</h2>
            <ul className="space-y-0.5">
              {postsByYear[year]?.map((post) => (
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
