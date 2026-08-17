export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';
const EVENT_NAME = 'themechange';

/** 系统是否偏好暗色（仅客户端调用） */
export function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

/** 当前实际生效的主题（亮/暗），读 html.dark class */
export function getAppliedTheme(): 'light' | 'dark' {
  return document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light';
}

/** 用户选择的主题，默认跟随系统 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system'
    ? stored
    : 'system';
}

/** 应用主题：设置 html.dark class + 持久化，并广播事件（供 Giscus 等同步） */
export function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && systemPrefersDark());
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem(STORAGE_KEY, theme);
  document.dispatchEvent(
    new CustomEvent(EVENT_NAME, { detail: { theme, dark } }),
  );
}

export { EVENT_NAME as THEME_EVENT_NAME };
