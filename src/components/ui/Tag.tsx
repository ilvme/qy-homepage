import Link from 'next/link';

export default function Tag({ tag, count }: { tag: string; count: number }) {
  return (
    <Link
      href={`/tags/${tag}`}
      className="inline-block rounded bg-gray-100 px-2 py-1 text-sm transition-all duration-300 ease-in-out hover:bg-gray-200 2xl:px-3 2xl:text-base dark:bg-gray-700 dark:hover:bg-gray-500"
    >
      #{tag}
      {count}
    </Link>
  );
}
