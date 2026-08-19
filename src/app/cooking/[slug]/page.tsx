import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from '@/components/icons';
import { notFound } from 'next/navigation';
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
    <div className="relative py-8 xl:grid xl:grid-cols-[minmax(0,768px)_minmax(0,1fr)] xl:gap-16 xl:items-start">
      <article className="max-w-[768px]">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-normal leading-tight mb-4">
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
          className="text-base 2xl:text-lg"
        />

        <div className="mt-12 pt-6 border-t border-border">
          <Link
            href="/cooking"
            className="inline-flex items-center gap-1 text-sm text-secondary hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            返回下厨
          </Link>
        </div>
      </article>

      {/* 目录 - 桌面端放在正文右侧 sticky */}
      <TableOfContents headings={headings} />
    </div>
  );
}
