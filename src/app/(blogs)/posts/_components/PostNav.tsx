import Link from 'next/link';

interface PostNavItem {
  slug: string;
  title: string;
  date?: string | null;
}

interface PostNavProps {
  /** 更早发布的一篇 */
  prev?: PostNavItem;
  /** 更晚发布的一篇 */
  next?: PostNavItem;
}

export default function PostNav({ prev, next }: PostNavProps) {
  if (!prev && !next) return null;

  const linkCls =
    'text-sm font-medium underline-offset-4 hover:text-brand hover:underline transition-colors';

  return (
    <nav className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="文章导航">
      {prev ? (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-secondary">上一篇</span>
          <Link href={`/posts/${prev.slug}`} className={linkCls}>
            {prev.title}
          </Link>
          {prev.date && (
            <span className="text-xs text-secondary">{prev.date}</span>
          )}
        </div>
      ) : (
        <div aria-hidden className="hidden sm:block" />
      )}
      {next ? (
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-xs text-secondary">下一篇</span>
          <Link href={`/posts/${next.slug}`} className={linkCls}>
            {next.title}
          </Link>
          {next.date && (
            <span className="text-xs text-secondary">{next.date}</span>
          )}
        </div>
      ) : (
        <div aria-hidden className="hidden sm:block" />
      )}
    </nav>
  );
}
