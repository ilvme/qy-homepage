'use client';

import { useEffect, useState } from 'react';
import type { Accent } from './accent';
import { ACCENTS, applyAccent, getStoredAccent } from './accent';

/** 主题色切换器：色点行，点击切换 html[data-accent] */
export default function AccentToggle() {
  const [accent, setAccent] = useState<Accent>('cinnabar');

  useEffect(() => {
    setAccent(getStoredAccent());
  }, []);

  const select = (a: Accent) => {
    applyAccent(a);
    setAccent(a);
  };

  return (
    <div className="flex items-center gap-1.5 px-1.5 py-1">
      {ACCENTS.map((a) => (
        <button
          key={a.key}
          type="button"
          onClick={() => select(a.key)}
          aria-label={`主题色：${a.label}`}
          title={a.label}
          style={{ backgroundColor: a.color }}
          className={`w-3.5 h-3.5 rounded-full transition-transform hover:scale-110 ${
            accent === a.key
              ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground/50'
              : 'ring-1 ring-border'
          }`}
        />
      ))}
    </div>
  );
}
