import { glob } from 'glob';
import path from 'path';
import { parseDate, parseMdFromFile } from '@/libs/content-supports';

const WORDS_DIR = path.join(process.cwd(), 'content/words');

export async function getAllWords() {
  const pattern = path.join(WORDS_DIR, '*.md');
  const files = await glob(pattern);

  const now = new Date();

  const words = files
    .map((file) => parseMdFromFile(file, true))
    .filter((item) => item !== null)
    .filter((item) => {
      // 有 date 字段则过滤掉未来的（预发布），无 date 字段原样保留
      const dateStr = item?.postMeta.date;
      if (!dateStr) return true;
      const d = parseDate(dateStr);
      return !isNaN(d.getTime()) && d <= now;
    })
    .map((item) => ({
      ...item,
      content: item.content ?? '',
    }))
    .sort(
      (a, b) =>
        parseDate(b?.postMeta.date).getTime() -
        parseDate(a?.postMeta.date).getTime(),
    );

  console.log('本地说说数：', words.length);

  return words;
}
