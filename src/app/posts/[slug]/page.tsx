import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackToTop from '@/components/ui/BackToTop';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import ScrollToTop from '@/components/ui/ScrollToTop';
import TableOfContents from '@/components/ui/TableOfContents';
import Tag from '@/components/ui/Tag';
import { getAllPosts, getPostBySlug } from '@/libs/content-loader';
import { extractHeadings } from '@/libs/content-supports';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary || post.title,
    openGraph: {
      title: post.title,
      description: post.summary || undefined,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export async function generateStaticParams() {
  const allPosts = await getAllPosts();
  return allPosts.map((post) => ({ slug: post.slug }));
}

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const postWithContent = await getPostBySlug(slug);
  if (!postWithContent) notFound();

  const headings = extractHeadings(postWithContent.content);

  return (
    <div className="relative py-8">
      {/* 目录 - 绝对定位在主体区域左侧外部 */}
      <TableOfContents headings={headings} />

      {/* 文章内容 - 保持原有布局不受影响 */}
      <article>
        <header className="mb-10">
          {/* 标题 */}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4">
            {postWithContent.title}
          </h1>

          {/* 元信息行 */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-secondary mb-6">
            <time
              dateTime={postWithContent.date}
              className="flex items-center gap-1.5 tabular-nums"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0"
              >
                <title>日期</title>
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              {postWithContent.date}
            </time>

            {postWithContent.category && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full  text-sm font-medium">
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
                {postWithContent.category}
              </span>
            )}

            {postWithContent.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {postWithContent.tags.map((tag: string) => (
                  <Tag key={tag} tag={tag} count={0} />
                ))}
              </div>
            )}
          </div>
        </header>

        <MarkdownRenderer
          content={postWithContent.content}
          className="text-base xl:text-lg"
        />

        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
          <Link
            href="/posts"
            className="inline-flex items-center gap-1 text-sm text-secondary hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>返回</title>
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            返回文章列表
          </Link>
          <ScrollToTop />
        </div>
      </article>

      <BackToTop />
    </div>
  );
}
