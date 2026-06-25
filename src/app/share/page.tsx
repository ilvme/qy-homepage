import Image from 'next/image';
import Link from 'next/link';
import { getAllCollections } from '@/libs/collections-loader';
import { getAllMedia } from '@/libs/media-loader';
import type { CollectionMetadata, MediaMetadata } from '../../scripts/types';

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={star <= rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          className={
            star <= rating ? 'text-amber-400' : 'text-muted-foreground'
          }
        >
          <title>{star}星</title>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function MediaCard({ item }: { item: MediaMetadata }) {
  const typeLabel: Record<string, string> = {
    书: '📚',
    电影: '🎬',
    音乐: '🎵',
  };

  return (
    <article className="flex gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
      {item.cover && (
        <div className="relative w-20 h-28 shrink-0 rounded-lg overflow-hidden bg-muted">
          <Image
            src={item.cover}
            alt={item.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium truncate">
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {item.title}
              </a>
            ) : (
              item.title
            )}
          </h3>
          <span className="shrink-0 text-sm">
            {typeLabel[item.type] ?? item.type}
          </span>
        </div>

        {item.creator && (
          <p className="text-sm text-secondary">{item.creator}</p>
        )}

        <div className="flex items-center gap-2">
          <RatingStars rating={item.rating} />
          {item.status && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-secondary">
              {item.status}
            </span>
          )}
        </div>

        {item.comment && (
          <p className="text-sm text-secondary line-clamp-2 mt-1">
            {item.comment}
          </p>
        )}

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-secondary"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function CollectionCard({ item }: { item: CollectionMetadata }) {
  return (
    <Link
      href={`/share/${item.page_id}`}
      className="block p-5 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium group-hover:text-foreground transition-colors line-clamp-1">
          {item.title}
        </h3>
        {item.category && (
          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-muted text-secondary">
            {item.category}
          </span>
        )}
      </div>

      {item.summary && (
        <p className="text-sm text-secondary mt-2 line-clamp-2">
          {item.summary}
        </p>
      )}

      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        {item.date && <time>{item.date}</time>}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded-full bg-muted">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default async function SharePage() {
  const [allMedia, allCollections] = await Promise.all([
    getAllMedia(),
    getAllCollections(),
  ]);

  // 书影音按类型分组
  const mediaGroups: Record<string, MediaMetadata[]> = {};
  for (const item of allMedia) {
    const type = item.type || '其他';
    if (!mediaGroups[type]) mediaGroups[type] = [];
    mediaGroups[type].push(item);
  }

  const typeOrder = ['书', '电影', '音乐'];
  const sortedTypes = Object.keys(mediaGroups).sort((a, b) => {
    const ai = typeOrder.indexOf(a);
    const bi = typeOrder.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  // 收藏按分类分组
  const collGroups: Record<string, CollectionMetadata[]> = {};
  for (const item of allCollections) {
    const cat = item.category || '未分类';
    if (!collGroups[cat]) collGroups[cat] = [];
    collGroups[cat].push(item);
  }

  return (
    <div className="py-8 space-y-12">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">分享</h1>
        <p className="text-secondary text-sm mt-1">
          读过的书、看过的电影、听过的音乐，以及收藏的知识与传统文化。
        </p>
      </header>

      {/* 书影音板块 */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight">书影音</h2>
        {sortedTypes.length === 0 ? (
          <p className="text-secondary text-sm">暂无书影音内容。</p>
        ) : (
          sortedTypes.map((type) => (
            <section key={type} className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {type === '书' && '📚'}
                {type === '电影' && '🎬'}
                {type === '音乐' && '🎵'}
                {type}
                <span className="text-sm font-normal text-secondary">
                  ({mediaGroups[type].length})
                </span>
              </h3>
              <div className="space-y-2">
                {mediaGroups[type].map((item) => (
                  <MediaCard key={item.page_id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </section>

      {/* 收藏板块 */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight">收藏</h2>
        {allCollections.length === 0 ? (
          <p className="text-secondary text-sm">暂无收藏内容。</p>
        ) : (
          Object.entries(collGroups).map(([category, items]) => (
            <section key={category} className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {category}
                <span className="text-sm font-normal text-secondary">
                  ({items.length})
                </span>
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                  <CollectionCard key={item.page_id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </section>
    </div>
  );
}
