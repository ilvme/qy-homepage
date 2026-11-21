import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PostMeta from '@/app/(blogs)/_components/PostMeta';
import { ArrowLeft } from '@/components/icons';
import {
  DETAIL_ARTICLE,
  detailGridClass,
} from '@/components/layout/wide-route';
import Comment from '@/components/ui/Comment';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import TableOfContents from '@/components/ui/TableOfContents';
import { getAllPosts, getPostBySlug } from '@/libs/content-loader';
import { extractHeadings } from '@/libs/content-supports';
import { siteConfig } from '@/site.config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  // 有封面用封面（1200×630 社交媒体预览对宽幅图更友好），没有则回落到全站默认图
  const images = post.cover
    ? [{ url: post.cover, alt: post.title }]
    : [{ url: '/og.png', width: 1200, height: 630, alt: post.title }];

  return {
    title: post.title,
    description: post.summary || post.title,
    openGraph: {
      title: post.title,
      description: post.summary || undefined,
      type: 'article',
      publishedTime: post.date ?? undefined,
      modifiedTime: post.last_edited_time ?? undefined,
      tags: [...post.tags],
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary || undefined,
      images: images.map((i) => i.url),
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
  const hasToc = headings.length > 0;

  const pageUrl = `${siteConfig.url}/posts/${slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: postWithContent.title,
    description: postWithContent.summary || undefined,
    datePublished: postWithContent.date ?? undefined,
    dateModified: postWithContent.last_edited_time ?? undefined,
    image: postWithContent.cover
      ? `${siteConfig.url}${postWithContent.cover}`
      : `${siteConfig.url}/og.png`,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    articleSection: postWithContent.category,
    keywords: postWithContent.tags.join(', '),
    author: { '@type': 'Person', name: siteConfig.author.displayName },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.title,
      logo: { '@type': 'ImageObject', url: `${siteConfig.url}/icon.png` },
    },
  };

  return (
    <div className={detailGridClass(hasToc)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 文章内容 - 720px 上限（16px 字号约 45 字一行）；无目录时（含 xl 以下单列）整体居中 */}
      <article className={DETAIL_ARTICLE}>
        <header className="mb-10">
          {/* 标题 */}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-normal leading-tight mb-4">
            {postWithContent.title}
          </h1>

          {/* 元信息行 */}
          <div className="mb-6">
            <PostMeta
              date={postWithContent.date}
              category={postWithContent.category}
              tags={postWithContent.tags}
            />
          </div>
        </header>

        <MarkdownRenderer
          content={postWithContent.content}
          className="text-base 2xl:text-lg"
        />

        {postWithContent.comments !== false && siteConfig.giscus.enabled && (
          <Comment />
        )}

        <div className="mt-12">
          <div className="flex items-center justify-between">
            <Link
              href="/posts"
              className="inline-flex items-center gap-1 text-sm text-secondary hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              返回文章列表
            </Link>
          </div>
        </div>
      </article>

      {/* 目录 - 桌面端放在正文右侧 sticky */}
      <TableOfContents headings={headings} />
    </div>
  );
}
