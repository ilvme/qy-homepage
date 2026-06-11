import WordCard from '@/app/words/_components/WordCard';
import { getAllWords } from '@/libs/words-loader';

export default async function ShuoShuo() {
  const words = await getAllWords();
  console.log(words[0]);
  return (
    <div>
      <h1>ShuoShuo</h1>
      这里是 ShuoShuo 页面
      <div>
        {words.map((word) => (
          <WordCard key={word?.postMeta.page_id} post={word} />
        ))}
      </div>
    </div>
  );
}
