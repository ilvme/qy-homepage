export type Accent = 'cinnabar' | 'celadon' | 'indigo' | 'ochre' | 'ink';

const STORAGE_KEY = 'accent';
const EVENT_NAME = 'accentchange';

/** 默认主题色 */
export const DEFAULT_ACCENT: Accent = 'cinnabar';

/** 可选主题色配置：色点用亮色值展示，切换后由 CSS 变量接管明暗 */
export const ACCENTS: { key: Accent; label: string; color: string }[] = [
  { key: 'cinnabar', label: '朱砂', color: '#b8463e' },
  { key: 'celadon', label: '青瓷', color: '#4a7c5a' },
  { key: 'indigo', label: '黛蓝', color: '#3d5a80' },
  { key: 'ochre', label: '赭石', color: '#a8632e' },
  { key: 'ink', label: '玄墨', color: '#78716c' },
];

const isAccent = (v: unknown): v is Accent =>
  v === 'cinnabar' ||
  v === 'celadon' ||
  v === 'indigo' ||
  v === 'ochre' ||
  v === 'ink';

/** 读取用户选择的主题色，默认朱砂 */
export function getStoredAccent(): Accent {
  if (typeof window === 'undefined') return DEFAULT_ACCENT;
  const stored = localStorage.getItem(STORAGE_KEY);
  return isAccent(stored) ? stored : DEFAULT_ACCENT;
}

/** 应用主题色：设置 html[data-accent] + 持久化，并广播事件 */
export function applyAccent(accent: Accent) {
  document.documentElement.dataset.accent = accent;
  localStorage.setItem(STORAGE_KEY, accent);
  document.dispatchEvent(
    new CustomEvent(EVENT_NAME, { detail: { accent } }),
  );
}

export { EVENT_NAME as ACCENT_EVENT_NAME };
