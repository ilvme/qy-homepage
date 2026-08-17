import Link from 'next/link';
import type { PostMetadata } from '../../../../scripts/types';

export default function PostItemLite({
  postMetadata,
}: {
  postMetadata: PostMetadata;
}) {
  return (
    <div className="flex items-baseline py-1 gap-3">
      <time className="shrink-0 text-sm text-secondary tabular-nums">
        {postMetadata.date?.substring(5)}
      </time>
      <Link
        href={`/posts/${postMetadata.slug}`}
        className="text-base font-medium truncate hover:underline underline-offset-4"
      >
        {postMetadata.title}
      </Link>
    </div>
  );
}
