import Link from 'next/link';

interface PostMetaProps {
  date: string;
  category?: string;
  tags?: string[];
  /** 紧凑模式（列表页用） */
  compact?: boolean;
}

export default function PostMeta({
  date,
  category,
  tags,
  compact = false,
}: PostMetaProps) {
  const size = compact ? 'text-xs' : 'text-sm';

  return (
    <div
      className={`flex flex-wrap items-center gap-x-2.5 gap-y-1.5 ${size} text-secondary`}
    >
      <time dateTime={date} className="flex items-center gap-1.5 tabular-nums">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="shrink-0"
        >
          <title>日期</title>
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
        {date}
      </time>

      {category && (
        <Link
          href={`/src/app/(blogs)/categories/${category}`}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 hover:underline underline-offset-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0"
          >
            <title>分类</title>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          {category}
        </Link>
      )}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/src/app/(blogs)/tags/${tag}`}
              className="hover:underline underline-offset-4"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
