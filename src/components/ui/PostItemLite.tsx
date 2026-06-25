import Link from 'next/link';
import type { PostMetadata } from '../../../scripts/types';

export default function PostItemLite({
  postMetadata,
}: {
  postMetadata: PostMetadata;
}) {
  return (
    <div className="flex justify-between items-baseline py-1">
      <Link
        href={`/posts/${postMetadata.slug}`}
        className="text-base font-medium truncate pr-4 hover:text-foreground hover:underline underline-offset-2 transition-colors"
      >
        {postMetadata.title}
      </Link>
      <time className="shrink-0 text-base text-secondary tabular-nums">
        {postMetadata.date?.substring(5)}
      </time>
    </div>
  );
}
