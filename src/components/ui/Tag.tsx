import Link from 'next/link';

export default function Tag({ tag, count }: { tag: string; count: number }) {
  return (
    <Link
      href={`/tags/${tag}`}
      className="inline-block rounded bg-muted px-2 py-1 text-xs transition-colors hover:bg-accent"
    >
      #{tag}
      {count > 0 && <span className="ml-0.5 text-secondary">{count}</span>}
    </Link>
  );
}
