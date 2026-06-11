import Link from 'next/link';
import { getAllTags } from '@/libs/content-loader';

export default async function TagCloud() {
  const tags: { label: string; count: number }[] = await getAllTags();

  return (
    <>
      <h2 className="text-xl font-bold mb-2">Tags</h2>

      <div className="flex flex-wrap gap-4 mb-4">
        {tags.map((tag) => (
          <Link
            key={tag.label}
            href={`/tags/${tag.label}`}
            className="text-sm hover:underline"
          >
            #{tag.label}
            <span className="pl-1">{tag.count}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
