'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from '@/components/icons';
import type { Theme } from './theme';
import { applyTheme, getStoredTheme } from './theme';

const CYCLE: Theme[] = ['system', 'light', 'dark'];

const META: Record<Theme, { Icon: typeof Sun; label: string }> = {
  system: { Icon: Monitor, label: '跟随系统' },
  light: { Icon: Sun, label: '亮色' },
  dark: { Icon: Moon, label: '暗色' },
};

export default function ThemeToggle({
  className = '',
}: {
  className?: string;
}) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  // 跟随系统模式下监听系统偏好变化
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const cycle = () => {
    const next = CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length];
    setTheme(next);
    applyTheme(next);
  };

  const { Icon, label } = META[theme];

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`外观：${label}（点击切换）`}
      title={`外观：${label}（点击切换）`}
      className={`p-1.5 rounded-md hover:bg-muted transition-colors text-secondary hover:text-foreground ${className}`}
    >
      <Icon size={18} />
    </button>
  );
}
