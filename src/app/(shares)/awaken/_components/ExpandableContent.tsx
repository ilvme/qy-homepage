import Link from 'next/link';
import type { ReactNode } from 'react';

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <title>查看全文</title>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      )}
    </div>
  );
}
