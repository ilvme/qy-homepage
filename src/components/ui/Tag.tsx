import Link from 'next/link';

export default function Tag({ tag, count }: { tag: string; count: number }) {
  return (
    <Link
      href={`/tags/${tag}`}
      className="inline-block rounded bg-muted px-2 py-1 text-sm transition-colors hover:bg-accent 2xl:px-3 2xl:text-base"
    >
      #{tag}
      {count}
    </Link>
  );
}
