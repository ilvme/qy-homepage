import Link from 'next/link';
import PostMeta from '@/components/ui/PostMeta';
import type { PostMetadata } from '../../../scripts/types';

export default function PostItem({
  postMetadata,
}: {
  postMetadata: PostMetadata;
}) {
  const { title, slug, date, summary, category, tags } = postMetadata;

  return (
    <article className="py-5 border-b border-border last:border-b-0">
      <Link
        href={`/src/app/(blogs)/posts/${slug}`}
        className="block space-y-2 group"
      >
        <h2 className="font-semibold text-lg group-hover:underline underline-offset-4">
          {title}
        </h2>
      </Link>
      {summary && (
        <p className="text-sm text-secondary line-clamp-2 leading-relaxed">
          {summary}
        </p>
      )}

      <div className="mt-2">
        <PostMeta date={date} category={category} compact />
      </div>
    </article>
  );
}
