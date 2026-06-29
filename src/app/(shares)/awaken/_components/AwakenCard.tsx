import Link from 'next/link';
import type { ShareMetadata } from '../../../../../scripts/types';

export default function AwakenCard({ item }: { item: ShareMetadata }) {
  const { title } = item;

  return (
    <article className="py-5">
      <Link
        href={`/src/app/(shares)/awaken/${title}`}
        className="block space-y-2 group"
      >
        <h2 className="font-semibold text-lg xl:text-xl group-hover:underline underline-offset-4">
          {title}
        </h2>
      </Link>
      {item.summary && (
        <p className="text-sm text-secondary line-clamp-2 leading-relaxed mt-1 max-w-5/6">
          {item.summary}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-secondary">
        {item.author && (
          <span className="text-muted-foreground">— {item.author}</span>
        )}
        {item.date && (
          <time dateTime={item.date}>
            {new Date(item.date).toLocaleDateString('zh-CN')}
          </time>
        )}
        {item.category && (
          <span className="text-muted-foreground">{item.category}</span>
        )}
      </div>
    </article>
  );
}
