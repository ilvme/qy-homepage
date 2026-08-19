'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Palette, Sun, Moon, Monitor } from '@/components/icons';
import type { Accent } from './accent';
import { ACCENTS, applyAccent, getStoredAccent } from './accent';
import type { Theme } from './theme';
import { applyTheme, getStoredTheme } from './theme';

/** 主题色 + 外观统一切换器：Palette 图标触发器（带主题色），下拉框分区选择 */
export default function AccentToggle() {
  const [accent, setAccent] = useState<Accent>('ink');
  const [theme, setTheme] = useState<Theme>('system');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAccent(getStoredAccent());
    setTheme(getStoredTheme());
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

  // 跟随系统模式下监听系统偏好变化，实时跟随
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [theme]);

  const current = ACCENTS.find((a) => a.key === accent) ?? ACCENTS[0];

  const selectAccent = (a: Accent) => {
    applyAccent(a);
    setAccent(a);
  };

  const selectTheme = (t: Theme) => {
    applyTheme(t);
    setTheme(t);
  };

  const THEME_OPTIONS: { key: Theme; label: string; Icon: typeof Sun }[] = [
    { key: 'light', label: '亮色', Icon: Sun },
    { key: 'dark', label: '暗色', Icon: Moon },
    { key: 'system', label: '跟随系统', Icon: Monitor },
  ];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`主题色：${current.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={`主题色：${current.label}`}
        className="p-1.5 rounded-md hover:bg-muted transition-colors text-secondary hover:text-foreground"
      >
        <Palette size={18} style={{ color: current.color }} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 min-w-40 rounded-lg border border-border bg-card shadow-lg py-1 z-50">
          {/* 主题色区 */}
          <div className="px-3 pt-1.5 pb-1 text-xs text-secondary">主题色</div>
          <ul role="listbox" aria-label="主题色">
            {ACCENTS.map((a) => (
              <li key={a.key} role="option" aria-selected={accent === a.key}>
                <button
                  type="button"
                  onClick={() => selectAccent(a.key)}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
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

          {/* 分割线 */}
          <div className="my-1 border-t border-border" />

          {/* 外观区 */}
          <div className="px-3 pt-1.5 pb-1 text-xs text-secondary">外观</div>
          <ul role="listbox" aria-label="外观">
            {THEME_OPTIONS.map(({ key, label, Icon }) => (
              <li key={key} role="option" aria-selected={theme === key}>
                <button
                  type="button"
                  onClick={() => selectTheme(key)}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Icon size={15} className="shrink-0 text-secondary" />
                  <span className="flex-1 text-left">{label}</span>
                  {theme === key && <Check size={14} className="text-brand" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
