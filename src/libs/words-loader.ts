import { glob } from 'glob';
import path from 'path';
import { cache } from 'react';
import { parseDate, parseMdFromFile, toLocalTimeStr } from '@/libs/content-supports';

const WORDS_DIR = path.join(process.cwd(), 'content/words');

/** 获取所有说说（请求级缓存） */
export const getAllWords = cache(async () => {
  const pattern = path.join(WORDS_DIR, '*.md');
  const files = await glob(pattern);

  const now = new Date();

  return files
    .map((file) => parseMdFromFile(file, true))
    .filter((item) => item !== null)
    .filter((item) => {
      // 有 date 字段则过滤掉未来的（预发布），无 date 字段原样保留
      const dateStr = item?.postMeta.date;
      if (!dateStr) return true;
      const d = parseDate(dateStr);
      return !isNaN(d.getTime()) && d <= now;
    })
    .map((item) => {
      (item.postMeta as Record<string, unknown>).date = toLocalTimeStr(item.postMeta.date as string);
      return { ...item, content: item.content ?? '' };
    })
    .sort(
      (a, b) =>
        parseDate(b?.postMeta.date).getTime() -
        parseDate(a?.postMeta.date).getTime(),
    );
});

/** 所有说说标签 + 条数，按 count 降序 */
export async function getAllWordTags(): Promise<{ label: string; count: number }[]> {
  const words = await getAllWords();

  const counts = new Map<string, number>();
  for (const word of words) {
    for (const tag of word.postMeta.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

/** 按标签过滤说说（保持时间倒序） */
export async function getWordsByTag(tag: string) {
  const words = await getAllWords();
  return words.filter((word) => word.postMeta.tags?.includes(tag));
}

/** 说说月刊分组（时间倒序），key 形如 2026-11 */
export interface WordsMonthGroup {
  key: string;
  year: number;
  month: number;
  words: Awaited<ReturnType<typeof getAllWords>>;
}

export async function getWordsGroupedByMonth(): Promise<WordsMonthGroup[]> {
  const words = await getAllWords();
  const groups = new Map<string, WordsMonthGroup>();

  for (const word of words) {
    const dateStr = word.postMeta.date ?? word.postMeta.last_edited_time ?? '';
    const d = parseDate(dateStr);
    if (isNaN(d.getTime())) continue;

    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;

    let group = groups.get(key);
    if (!group) {
      group = { key, year, month, words: [] };
      groups.set(key, group);
    }
    group.words.push(word);
  }

  // getAllWords 已时间倒序，Map 按首次插入序 = 月份倒序
  return [...groups.values()];
}
