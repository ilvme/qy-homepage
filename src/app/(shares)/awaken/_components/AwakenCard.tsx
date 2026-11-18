import Link from 'next/link';
import type { ShareMetadata } from '../../../../../scripts/types';

interface AwakenCardProps {
  item: ShareMetadata;
  /** 正文内容预览，优先于 summary */
  contentPreview?: string;
}

export default function AwakenCard({ item, contentPreview }: AwakenCardProps) {
  const { title, slug } = item;
  const preview = contentPreview || item.summary;

  return (
    <article className="py-5">
      <Link href={`/awaken/${slug}`} className="block space-y-2 group">
        <h2 className="font-bold text-lg xl:text-xl group-hover:underline underline-offset-4 transition-colors">
          {title}
        </h2>
      </Link>

      {preview && (
        <p className="text-sm text-secondary line-clamp-2 leading-relaxed mt-1">
          {preview}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-secondary">
        {item.author && (
          <span className="text-secondary">— {item.author}</span>
        )}
        {item.date && (
          <time
            dateTime={item.date}
            className="font-mono tabular-nums"
          >
            {item.date}
          </time>
        )}
        {item.category && (
          <span className="text-secondary">{item.category}</span>
        )}
      </div>
    </article>
  );
}
