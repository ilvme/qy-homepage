import Link from 'next/link';
import type { PostMetadata } from '../../../scripts/types';

export default function PostItem({
  postMetadata,
}: {
  postMetadata: PostMetadata;
}) {
  return (
    <article className="py-4 border-b border-border last:border-b-0">
      <Link href={`/posts/${postMetadata.slug}`} className="group block space-y-2">
        <h2 className="font-semibold text-lg group-hover:underline underline-offset-2 transition-all">
          {postMetadata.title}
        </h2>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-secondary">
          <time dateTime={postMetadata.date}>{postMetadata.date}</time>

          {postMetadata.category && (
            <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
              {postMetadata.category}
            </span>
          )}

          {postMetadata.type && (
            <span className="text-xs text-muted-foreground">{postMetadata.type}</span>
          )}
        </div>

        {postMetadata.summary && (
          <p className="text-sm text-secondary line-clamp-2">{postMetadata.summary}</p>
        )}

        {postMetadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {postMetadata.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-muted text-secondary"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
