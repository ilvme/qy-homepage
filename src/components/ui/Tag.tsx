import Link from 'next/link';

export default function Tag({ tag, count }: { tag: string; count: number }) {
  return (
    <Link
      href={`/src/app/(blogs)/tags/${tag}`}
      className="inline-flex items-center rounded-md px-1 py-0.5 text-sm hover:underline"
    >
      #{tag}
      {count > 0 && <span className="ml-1 text-secondary">{count}</span>}
    </Link>
  );
}
