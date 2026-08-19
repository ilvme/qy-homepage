'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from '@/components/icons';
import { applyTheme, getStoredTheme } from './theme';
import type { Theme } from './theme';

const CYCLE: Theme[] = ['light', 'dark', 'system'];
const LABELS: Record<Theme, string> = {
  light: '亮色',
  dark: '暗色',
  system: '跟随系统',
};

const nextTheme = (t: Theme) => CYCLE[(CYCLE.indexOf(t) + 1) % CYCLE.length];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  // 跟随系统模式下监听系统偏好变化，实时跟随
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [theme]);

  const toggle = () => {
    const next = nextTheme(theme);
    applyTheme(next);
    setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={`切换主题（当前：${LABELS[theme]}）`}
      title={LABELS[theme]}
      className="p-1.5 rounded-md hover:bg-muted transition-colors text-secondary hover:text-foreground"
    >
      {theme === 'light' && <Sun size={18} />}
      {theme === 'dark' && <Moon size={18} />}
      {theme === 'system' && <Monitor size={18} />}
    </button>
  );
}
