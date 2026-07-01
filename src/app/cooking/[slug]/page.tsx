import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import TableOfContents from '@/components/ui/TableOfContents';
import { extractHeadings } from '@/libs/content-supports';
import { getAllCooking, getCookingBySlug } from '@/libs/cooking-loader';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCookingBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary || `${post.title} — 做饭记录`,
  };
}

export async function generateStaticParams() {
  const all = await getAllCooking();
  return all.map((item) => ({ slug: item.slug }));
}

export default async function CookingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getCookingBySlug(slug);
  if (!post) notFound();

  const headings = extractHeadings(post.content);

  return (
    <div className="relative py-8">
      <TableOfContents headings={headings} />

      <article>
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-secondary">
            {post.date && (
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('zh-CN')}
              </time>
            )}
            {post.category && <span>{post.category}</span>}
            {post.tags?.length > 0 && (
              <span>{post.tags?.map((t) => `#${t}`).join(' ')}</span>
            )}
          </div>
        </header>

        <MarkdownRenderer
          content={post.content}
          className="text-base xl:text-lg"
        />

        <div className="mt-12 pt-6 border-t border-border">
          <Link
            href="/cooking"
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
            返回下厨
          </Link>
        </div>
      </article>
    </div>
  );
}
