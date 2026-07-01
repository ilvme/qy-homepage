import { getAllWords } from '@/libs/words-loader';
import PublishForm from './_components/PublishForm';

export default async function PublishWordsPage() {
  const words = await getAllWords();
  const tagSet = new Set<string>();
  for (const word of words) {
    const tags = word.postMeta.tags;
    if (Array.isArray(tags)) {
      for (const tag of tags) {
        if (tag) tagSet.add(tag);
      }
    }
  }

  return <PublishForm allTags={[...tagSet].sort()} />;
}
