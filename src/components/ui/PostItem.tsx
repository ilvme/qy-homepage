import Link from 'next/link';
import type { PostMetadata } from '../../../scripts/types';

export default function PostItem({
  postMetadata,
}: {
  postMetadata: PostMetadata;
}) {
  return (
    <article className="py-4 border-b border-border last:border-b-0 space-y-2">
      <Link href={`/posts/${postMetadata.slug}`}>
        <h2 className="font-semibold text-lg hover:underline underline-offset-2 transition-all">
          {postMetadata.title}
        </h2>
      </Link>

      {postMetadata.summary && (
        <p className="text-sm text-secondary line-clamp-2">{postMetadata.summary}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-secondary">
        <time dateTime={postMetadata.date} className="tabular-nums">
          {postMetadata.date}
        </time>

        {postMetadata.category && (
          <>
            <span aria-hidden="true" className="text-border select-none">·</span>
            <span className="font-medium text-foreground/80">
              {postMetadata.category}
            </span>
          </>
        )}

        {postMetadata.tags.length > 0 && (
          <>
            <span aria-hidden="true" className="text-border select-none">·</span>
            {postMetadata.tags.map((tag) => (
              <span key={tag} className="text-xs text-secondary">
                #{tag}
              </span>
            ))}
          </>
        )}
      </div>
    </article>
  );
}
