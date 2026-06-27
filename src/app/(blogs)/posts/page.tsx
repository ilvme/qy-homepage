import type { Metadata } from 'next';
import PostItem from '@/components/ui/PostItem';
import { getAllPosts, getPostStats } from '@/libs/content-loader';

export const metadata: Metadata = {
  title: '文章',
  description: '技术笔记与生活随笔',
};

export default async function Archives() {
  const [posts, stats] = await Promise.all([getAllPosts(), getPostStats()]);

  return (
    <div className="py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">文章</h1>
        <p className="text-secondary text-base mt-1">
          共 {stats.totalPosts} 篇文章
          {stats.totalWords > 0 && <> ，约 {stats.totalWords} 字</>}
        </p>
      </header>

      <div className="space-y-6">
        <ul className="space-y-0.5">
          {posts.map((post) => (
            <li key={post.slug}>
              <PostItem postMetadata={post} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
