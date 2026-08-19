import Link from 'next/link';
import { Calendar, Folder } from '@/components/icons';

interface PostMetaProps {
  date: string | null;
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
      {date && (
        <time dateTime={date} className="flex items-center gap-1.5 tabular-nums">
          <Calendar size={14} />
          {date}
        </time>
      )}

      {category && (
        <Link
          href={`/categories/${category}`}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 hover:text-brand hover:underline underline-offset-4"
        >
          <Folder size={12} />
          {category}
        </Link>
      )}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="hover:text-brand hover:underline underline-offset-4"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
