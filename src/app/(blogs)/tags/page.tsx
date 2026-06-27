import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllTags } from '@/libs/content-loader';

export const metadata: Metadata = {
  title: 'Tags',
  description: '文章标签',
};

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <div className="py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
        <p className="text-secondary text-base mt-1">共 {tags.length} 个标签</p>
      </header>

      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 ">
        {tags.map((tag) => (
          <Link
            key={tag.label}
            href={`/src/app/(blogs)/tags/${tag.label}`}
            className="hover:underline"
          >
            <span className="">#</span>
            {tag.label}
            <span className="pl-1 text-secondary">{tag.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
