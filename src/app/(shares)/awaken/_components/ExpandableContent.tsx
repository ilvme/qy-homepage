'use client';

import { useState, type ReactNode } from 'react';

interface ExpandableContentProps {
  children: ReactNode;
  contentLength?: number;
  maxHeight?: number;
}

export default function ExpandableContent({
  children,
  contentLength = 0,
  maxHeight = 12,
}: ExpandableContentProps) {
  const [expanded, setExpanded] = useState(false);
  const likelyLong = contentLength > 400;

  return (
    <div>
      <div
        className="overflow-hidden relative"
        style={{ maxHeight: expanded ? undefined : `${maxHeight}rem` }}
      >
        {children}
        {!expanded && likelyLong && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-muted/30 to-transparent pointer-events-none" />
        )}
      </div>
      {likelyLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-muted-foreground hover:text-secondary transition-colors"
        >
          {expanded ? '收起' : '展开全部'}
        </button>
      )}
    </div>
  );
}
