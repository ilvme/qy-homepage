import WordCard from '@/app/words/_components/WordCard';
import { getAllWords } from '@/libs/words-loader';

export default async function ShuoShuo() {
  const words = await getAllWords();

  return (
    <div className="py-8 space-y-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">说说</h1>
        <p className="text-secondary text-base mt-1">
          随笔心情、生活碎片、一闪而过的念头。
        </p>
      </header>

      <div className="space-y-4">
        {words.map((word) => (
          <WordCard
            key={word?.postMeta.page_id}
            post={word as { postMeta: any; content: string }}
          />
        ))}
      </div>
    </div>
  );
}
