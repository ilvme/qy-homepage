import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serialize } from 'next-mdx-remote/serialize';
import rehypeSlug from 'rehype-slug';
import BackToTop from '@/components/ui/BackToTop';
import MdxRenderer from '@/components/ui/MdxRenderer';
import TableOfContents from '@/components/ui/TableOfContents';
import { getAllCollections, getCollectionByPageId } from '@/libs/collections-loader';
import { extractHeadings } from '@/libs/content-supports';

export async function generateStaticParams() {
  const all = await getAllCollections();
  return all.map((item) => ({ pageId: item.page_id }));
}

export default async function CollectionDetail({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;

  const item = await getCollectionByPageId(pageId);
  if (!item) notFound();

  const headings = extractHeadings(item.content);

  const mdxSource = await serialize(item.content, {
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [rehypeSlug],
    },
  });

  return (
    <div className="relative py-8">
      <TableOfContents headings={headings} />

      <article>
        <header className="mb-8 space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            {item.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary">
            {item.date && <time dateTime={item.date}>{item.date}</time>}

            {item.category && (
              <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                {item.category}
              </span>
            )}
          </div>

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-secondary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {item.summary && (
            <blockquote className="border-l-2 border-border pl-4 text-secondary italic">
              {item.summary}
            </blockquote>
          )}
        </header>

        <MdxRenderer source={mdxSource} />

        <div className="mt-12 pt-6 border-t border-border">
          <Link
            href="/share"
            className="inline-flex items-center gap-1 text-sm text-secondary hover:text-foreground transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <title>返回</title>
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            返回分享
          </Link>
        </div>
      </article>

      <BackToTop />
    </div>
  );
}
