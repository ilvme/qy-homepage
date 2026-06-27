import type { ReactNode } from 'react';

interface ColumnsProps {
  cols?: number;
  children: ReactNode;
}

export function Columns({ cols = 2, children }: ColumnsProps) {
  return (
    <div
      className="my-5"
      style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1rem' }}
    >
      {children}
    </div>
  );
}

export function Column({ children }: { children: ReactNode }) {
  return <div className="min-w-0">{children}</div>;
}
