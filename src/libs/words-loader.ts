import { glob } from 'glob';
import path from 'path';
import { parseMdFromFile } from '@/libs/content-supports';

const WORDS_DIR = path.join(process.cwd(), 'content/words');

export async function getAllWords() {
  const pattern = path.join(WORDS_DIR, '*.md');
  const files = await glob(pattern);

  const words = files
    .map((file) => parseMdFromFile(file, true))
    // .map((item) => item?.postMeta)
    .filter((item) => item !== null)
    .sort(
      (a, b) =>
        new Date(b?.postMeta.date).getTime() -
        new Date(a?.postMeta.date).getTime(),
    );

  console.log('本地说说数：', words.length);

  return words;
}
