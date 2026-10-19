import path from 'node:path';
import type { Metadata } from 'next';
import Link from 'next/link';
import AwakenCard from '@/app/(shares)/awaken/_components/AwakenCard';
import { ArrowLeft } from '@/components/icons';
import Pagination from '@/components/ui/Pagination';
import { getAllAwaken, getAllAwakenCategories } from '@/libs/awaken-loader';
import { parseMdFromFile } from '@/libs/content-supports';
import { paginate } from '@/libs/paginate';
import { siteConfig } from '@/site.config';

export const metadata: Metadata = {
  title: '全部分享',
  description: '台词、句子、古诗词古文',
};

/** 去除 markdown 标记，提取纯文本预览 */
function extractPreview(md: string, maxLen = 120): string {
  const text = md
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`[\]()>#+\-.!|{}]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

async function getAwakenWithPreview() {
  const items = await getAllAwaken();
  const SHARES_DIR = path.join(process.cwd(), 'content/shares/awaken');

  return Promise.all(
    items.map(async (item) => {
      const filePath = path.join(SHARES_DIR, `${item.title}.md`);
      const parsed = parseMdFromFile(filePath, true);
      return {
        item,
        preview: parsed?.content
          ? extractPreview(parsed.content)
          : item.summary || '',
      };
    }),
  );
}

export default async function AwakenAllPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const [data, categories] = await Promise.all([
    getAwakenWithPreview(),
    getAllAwakenCategories(),
  ]);
  const { category: activeCategory, page: pageParam } = await searchParams;

  const categoryCounts = new Map<string, number>();
  for (const { item } of data) {
    if (item.category) {
      categoryCounts.set(
        item.category,
        (categoryCounts.get(item.category) ?? 0) + 1,
      );
    }
  }

  const filtered = activeCategory
    ? data.filter(({ item }) => item.category === activeCategory)
    : data;

  const { currentPage, totalPages, pagedItems } = paginate(
    filtered,
    pageParam,
    siteConfig.pagination.awakenPageSize,
  );

  return (
    <div className="py-8">
      {/*<PageHero*/}
      {/*  title="分享"*/}
      {/*  description={`台词、句子、古诗词古文，共 ${data.length} 篇`}*/}
      {/*/>*/}

      {/* 返回随机页 */}
      <div className="mb-6">
        <Link
          href="/awaken"
          className="inline-flex items-center gap-1 text-sm text-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          随机分享
        </Link>
      </div>

      {/* 分类 Tab */}
      {categories.length > 0 && (
        <nav className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
          <Link
            href="/awaken/all"
            className={`text-sm transition-colors ${
              !activeCategory
                ? 'text-foreground font-semibold'
                : 'text-secondary hover:text-foreground'
            }`}
          >
            全部（{data.length}）
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/awaken/all?category=${cat}`}
              className={`text-sm transition-colors ${
                activeCategory === cat
                  ? 'text-foreground font-semibold'
                  : 'text-secondary hover:text-foreground'
              }`}
            >
              {cat}（{categoryCounts.get(cat) ?? 0}）
            </Link>
          ))}
        </nav>
      )}

      {/* 文字列表 */}
      <div className="divide-y divide-border">
        {pagedItems.map(({ item, preview }) => (
          <AwakenCard key={item.title} item={item} contentPreview={preview} />
        ))}
      </div>

      {/* 分页 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/awaken/all"
        query={activeCategory ? { category: activeCategory } : undefined}
      />
    </div>
  );
}
