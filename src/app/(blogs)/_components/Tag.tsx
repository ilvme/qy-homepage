import Link from 'next/link';

export default function Tag({ tag, count }: { tag: string; count: number }) {
  return (
    <Link
      href={`/tags/${tag}`}
      className="inline-flex items-center rounded-md px-1 py-0.5 text-sm hover:text-foreground hover:underline underline-offset-4 transition-colors"
    >
      <span className="font-medium">#</span>{tag}
      {count > 0 && <span className="ml-1 text-secondary">{count}</span>}
    </Link>
  );
}
