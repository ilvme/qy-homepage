import fs from 'fs';
import path from 'path';
import { downloadImage } from './notion-md-converter';

// ── 时区转换 ──

/** 补零 */
function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Date → 本地时间字符串 (YYYY-MM-DDTHH:mm:ss) */
function formatLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * 将 Notion 返回的 UTC 时间转为本地时区
 * 纯日期（YYYY-MM-DD）原样返回
 */
export function toLocalTime(
  iso: string | undefined | null,
): string | undefined {
  if (!iso) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return formatLocal(d);
}

/** 当前时间 — 本地格式 */
export function nowLocal(): string {
  return formatLocal(new Date());
}

const STATE_FILE = path.resolve(process.cwd(), 'content/sync-state.json');

/** { contentType/identifier: last_edited_time } */
type SyncState = Record<string, string>;

/** 加载同步状态 */
export function loadSyncState(): SyncState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch {
    // 文件损坏或格式错误，视为空状态 → 全量同步
  }
  return {};
}

/** 保存同步状态 */
export function saveSyncState(state: SyncState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

/**
 * 增量检查：对比状态中记录的 last_edited_time 与 Notion 返回的值
 * FORCE_SYNC=true 时始终返回 true
 */
export function needsStateSync(
  state: SyncState,
  key: string,
  lastEditedTime: string,
): boolean {
  if (process.env.FORCE_SYNC === 'true') return true;
  return state[key] !== lastEditedTime;
}

/**
 * 下载封面图片到本地，返回本地 URL 路径
 * 非 Notion 图片（如外部 URL）直接返回原 URL
 */
export async function syncCover(
  url: string | undefined,
  mediaDir: string,
  mediaUrlPath: string,
  key: string,
): Promise<string | undefined> {
  if (!url) return undefined;

  const coverDir = path.join(mediaDir, key);
  const coverUrlPath = `${mediaUrlPath}/${key}`;

  if (!fs.existsSync(coverDir)) {
    fs.mkdirSync(coverDir, { recursive: true });
  }

  return downloadImage(url, coverDir, coverUrlPath);
}
