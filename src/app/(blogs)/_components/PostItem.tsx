import Link from 'next/link';
import PostMeta from '@/app/(blogs)/_components/PostMeta';
import type { PostMetadata } from '../../../../scripts/types';

export default function PostItem({
  postMetadata,
}: {
  postMetadata: PostMetadata;
}) {
  const { title, slug, date, summary, category, tags } = postMetadata;

  return (
    <article className="py-5 ">
      <Link href={`/posts/${slug}`} className="block space-y-2 group">
        <h2 className="font-semibold text-lg xl:text-xl group-hover:underline underline-offset-4">
          {title}
        </h2>
      </Link>
      {summary && (
        <p className="text-sm text-secondary line-clamp-2 leading-relaxed mt-1 max-w-5/6">
          {summary}
        </p>
      )}

      <div className="mt-2">
        <PostMeta date={date} category={category} tags={tags} compact />
      </div>
    </article>
  );
}
