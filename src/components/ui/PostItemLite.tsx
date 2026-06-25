import Link from 'next/link';
import type { PostMetadata } from '../../../scripts/types';

export default function PostItemLite({
  postMetadata,
}: {
  postMetadata: PostMetadata;
}) {
  return (
    <div>
      <Link href={`/posts/${postMetadata.slug}`} className="flex justify-between items-baseline py-1 hover:text-foreground transition-colors group">
        <h2 className="text-sm font-medium truncate pr-4 group-hover:underline underline-offset-2">
          {postMetadata.title}
        </h2>
        <time className="shrink-0 text-sm text-secondary tabular-nums">
          {postMetadata.date?.substring(5)}
        </time>
      </Link>
    </div>
  );
}
