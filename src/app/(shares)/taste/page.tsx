import type { Metadata } from 'next';
import { TasteGallery } from '@/app/(shares)/taste/_components/TasteGallery';
import { PageHero } from '@/components/ui/PageHero';
import { getAllTaste } from '@/libs/taste-loader';

export const metadata: Metadata = {
  title: '风味',
  description: '书影音动漫小说收藏',
};

/** 分类展示顺序：动漫、电影、电视剧、音乐、书、小说 */
const CATEGORY_ORDER: { key: string; label: string }[] = [
  { key: 'anime', label: '动漫' },
  { key: 'movie', label: '影' },
  { key: 'tv', label: '剧' },
  { key: 'music', label: '音乐' },
  { key: 'book', label: '书' },
  { key: 'novel', label: '小说' },
];

export default async function TastePage() {
  const items = await getAllTaste();

  // 按固定顺序分组
  const grouped = CATEGORY_ORDER.map(({ key, label }) => {
    const groupItems = items.filter((i) => i.category === key);
    return { key, label, items: groupItems };
  }).filter((g) => g.items.length > 0);

  return (
    <div className="py-8">
      <PageHero
        title="书影音"
        description="以下是我喜欢的一些书影音等文娱内容，内容可能时常变动。"
      />

      {/* 按分类纵向排列 */}
      <div className="space-y-10">
        {grouped.map(({ key, label, items: groupItems }) => (
          <section key={key}>
            <h2 className="text-lg font-semibold mb-4">
              {label}
              {/*<span className="text-sm text-secondary font-normal ml-1.5">*/}
              {/*  {groupItems.length}*/}
              {/*</span>*/}
            </h2>
            <TasteGallery items={groupItems} />
          </section>
        ))}
      </div>
    </div>
  );
}
