import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackToTop from '@/components/ui/BackToTop';
import MdxRenderer from '@/components/ui/MdxRenderer';
import ScrollToTop from '@/components/ui/ScrollToTop';
import TableOfContents from '@/components/ui/TableOfContents';
import Tag from '@/components/ui/Tag';
import { getAllPosts, getPostBySlug } from '@/libs/content-loader';
import { extractHeadings } from '@/libs/content-supports';
import { serializeMdx } from '@/libs/mdx-serializer';

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

  const mdxSource = await serializeMdx(postWithContent.content);

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
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-secondary mb-6">
            <time dateTime={postWithContent.date} className="tabular-nums">
              {postWithContent.date}
            </time>

            {postWithContent.category && (
              <>
                <span aria-hidden="true" className="text-border select-none">
                  ·
                </span>
                <span className="font-medium text-foreground/80">
                  {postWithContent.category}
                </span>
              </>
            )}

            {postWithContent.tags.length > 0 && (
              <>
                <span aria-hidden="true" className="text-border select-none">
                  ·
                </span>
                {postWithContent.tags.map((tag: string) => (
                  <Tag key={tag} tag={tag} count={0} />
                ))}
              </>
            )}
          </div>

          {/* 摘要 */}
          {/*{postWithContent.summary && (*/}
          {/*  <blockquote className="border-l-[3px] border-foreground bg-muted rounded-r-md px-4 py-3 mt-6 text-secondary italic">*/}
          {/*    {postWithContent.summary}*/}
          {/*  </blockquote>*/}
          {/*)}*/}
        </header>

        <MdxRenderer source={mdxSource} className="text-base xl:text-lg" />

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
