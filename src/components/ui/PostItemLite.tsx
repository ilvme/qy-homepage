import Link from 'next/link';
import type { PostMetadata } from '../../../scripts/types';

export default function PostItemLite({
  postMetadata,
}: {
  postMetadata: PostMetadata;
}) {
  return (
    <div>
      <Link href={`/posts/${postMetadata.slug}`}>
        <div className="p-1 flex justify-between">
          <h2 className="">{postMetadata.title}</h2>
          <p>{postMetadata.date.substring(5)}</p>
        </div>
      </Link>
    </div>
  );
}
