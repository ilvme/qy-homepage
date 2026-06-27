import type { ReactNode } from 'react';

interface CalloutProps {
  icon?: string;
  color?: string;
  children: ReactNode;
}

export default function Callout({ icon, color, children }: CalloutProps) {
  const key = (color ?? 'gray').replace('_background', '');

  return (
    <div
      className="flex items-baseline gap-3 my-4 px-4 py-3 rounded-lg"
      data-callout={key}
    >
      {icon && <span className="text-lg leading-7 shrink-0">{icon}</span>}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
