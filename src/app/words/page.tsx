import type { Metadata } from 'next';
import WordCard from '@/app/words/_components/WordCard';
import { EmptyShower } from '@/components/ui/EmptyShower';
import { PageHero } from '@/components/ui/PageHero';
import { getAllWords } from '@/libs/words-loader';

export const metadata: Metadata = {
  title: '说说',
  description: '碎片化的思考与记录',
};

export default async function ShuoShuo() {
  const words = await getAllWords();

  return (
    <div className="py-8 space-y-4">
      <PageHero
        title="说说"
        description="生活碎片、猫咪日常，以及一些忍不住的吐槽。"
      />

      {words.length === 0 ? (
        <EmptyShower />
      ) : (
        <div className="space-y-4 mt-10">
          {words.map((word) => (
            <WordCard
              key={word?.postMeta.page_id}
              post={word as { postMeta: any; content: string }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
