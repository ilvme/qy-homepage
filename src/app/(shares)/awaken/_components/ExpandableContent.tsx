import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight } from '@/components/icons';

interface ExpandableContentProps {
  children: ReactNode;
  contentLength?: number;
  detailUrl: string;
  maxLines?: number;
}

export default function ExpandableContent({
  children,
  contentLength = 0,
  detailUrl,
  maxLines = 8,
}: ExpandableContentProps) {
  const isLong = contentLength > 400;

  return (
    <div>
      <div
        style={
          isLong
            ? {
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: maxLines,
                overflow: 'hidden',
              }
            : undefined
        }
      >
        {children}
      </div>
      {isLong && (
        <Link
          href={detailUrl}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        >
          查看全文
          <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}
