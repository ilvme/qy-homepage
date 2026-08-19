import type { Metadata } from 'next';
import Link from 'next/link';
import PostItemLite from '@/app/(blogs)/_components/PostItemLite';
import TagCloud from '@/components/ui/TagCloud';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { PageHero } from '@/components/ui/PageHero';
import {
  getAllCategories,
  getAllPosts,
  getAllTags,
  getPostStats,
} from '@/libs/content-loader';

export const metadata: Metadata = {
  title: '归档',
  description: '技术笔记与生活随笔',
};

export default async function Archives() {
  const [posts, stats, tags, categories] = await Promise.all([
    getAllPosts(),
    getPostStats(),
    getAllTags(),
    getAllCategories(),
  ]);

  // 按年份分组
  const postsByYear = posts.reduce(
    (acc, post) => {
      const year = new Date(post.date ?? 0).getFullYear().toString();
      if (!acc[year]) acc[year] = [];
      acc[year].push(post);
      return acc;
    },
    {} as Record<string, typeof posts>,
  );

  const sortedYears = Object.keys(postsByYear).sort(
    (a, b) => Number(b) - Number(a),
  );

  // 分类计数
  const categoryCounts = new Map<string, number>();
  for (const post of posts) {
    if (post.category) {
      categoryCounts.set(
        post.category,
        (categoryCounts.get(post.category) ?? 0) + 1,
      );
    }
  }

  return (
    <div className="py-8">
      <PageHero title="归档">
        <p className="text-secondary text-base mt-1">
          共 {stats.totalPosts} 篇文章
          {stats.totalWords > 0 && <> ，约 {stats.totalWords} 字</>}
        </p>
      </PageHero>

      {/* 分类 + 标签聚合区 */}
      <div className="mt-2 mb-10 space-y-5">
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
            分类
          </h4>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/categories/${cat}`}
                className="inline-flex items-center gap-1 text-sm text-secondary hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="shrink-0"
                >
                  <title>分类</title>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <span className="hover:underline underline-offset-4">
                  {cat}
                  <span className="pl-1">
                    {categoryCounts.get(cat) ?? 0}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
            标签
          </h4>
          <TagCloud tags={tags} basePath="/tags" />
        </div>
      </div>

      {posts.length === 0 ? (
        <EmptyShower />
      ) : (
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
      )}
    </div>
  );
}
