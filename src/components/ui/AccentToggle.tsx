'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Palette, Check } from '@/components/icons';
import type { Accent } from './accent';
import { ACCENTS, applyAccent, getStoredAccent } from './accent';

/** 主题色切换器：下拉框样式，点击触发器展开色点列表 */
export default function AccentToggle() {
  const [accent, setAccent] = useState<Accent>('cinnabar');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAccent(getStoredAccent());
  }, []);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const current = ACCENTS.find((a) => a.key === accent) ?? ACCENTS[0];

  const select = (a: Accent) => {
    applyAccent(a);
    setAccent(a);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`主题色：${current.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="主题色"
        className="inline-flex items-center gap-1.5 p-1.5 rounded-md hover:bg-muted transition-colors text-secondary hover:text-foreground"
      >
        <Palette size={18} />
        <span
          aria-hidden
          className="w-3 h-3 rounded-full ring-1 ring-border"
          style={{ backgroundColor: current.color }}
        />
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1 min-w-36 rounded-lg border border-border bg-card shadow-lg py-1 z-50"
        >
          {ACCENTS.map((a) => (
            <li key={a.key} role="option" aria-selected={accent === a.key}>
              <button
                type="button"
                onClick={() => select(a.key)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full ring-1 ring-border shrink-0"
                  style={{ backgroundColor: a.color }}
                />
                <span className="flex-1 text-left">{a.label}</span>
                {accent === a.key && <Check size={14} className="text-brand" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
