import Link from 'next/link';
import type { PostMetadata } from '../../../scripts/types';

export default function PostItem({
  postMetadata,
}: {
  postMetadata: PostMetadata;
}) {
  return (
    <div>
      <div className="">
        <Link href={`/posts/${postMetadata.slug}`} className="hover:underline">
          <h2 className="font-bold">{postMetadata.title}</h2>
        </Link>

        <section>
          <span>{postMetadata.date}</span>
          <span>{postMetadata.category}</span>
          <span>{postMetadata.tags}</span>
        </section>
        <p className="text-sm">{postMetadata.summary}</p>
      </div>
    </div>
  );
}
