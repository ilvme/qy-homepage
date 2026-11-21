import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from '@/components/icons';
import {
  DETAIL_ARTICLE,
  detailGridClass,
} from '@/components/layout/wide-route';
import { notFound } from 'next/navigation';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import TableOfContents from '@/components/ui/TableOfContents';
import { getAllAwaken, getAwakenBySlug } from '@/libs/awaken-loader';
import { extractHeadings } from '@/libs/content-supports';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getAwakenBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary || `${post.title}`,
  };
}

export async function generateStaticParams() {
  const all = await getAllAwaken();
  return all.map((item) => ({ slug: item.slug }));
}

export default async function AwakenDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getAwakenBySlug(slug);
  if (!post) notFound();

  const headings = extractHeadings(post.content);
  const hasToc = headings.length > 0;

  return (
    <div className={detailGridClass(hasToc)}>
      <article className={DETAIL_ARTICLE}>
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-normal leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-secondary">
            {post.author && <span>— {post.author}</span>}
            {post.date && (
              <time dateTime={post.date} className="font-mono tabular-nums">
                {post.date}
              </time>
            )}
            {post.category && <span>{post.category}</span>}
          </div>
        </header>

        <MarkdownRenderer
          content={post.content}
          className="text-base 2xl:text-lg"
        />

        <div className="mt-12 pt-6 border-t border-border">
          <Link
            href="/awaken"
            className="inline-flex items-center gap-1 text-sm text-secondary hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            返回分享
          </Link>
        </div>
      </article>

      {/* 目录 - 桌面端放在正文右侧 sticky */}
      <TableOfContents headings={headings} />
    </div>
  );
}
