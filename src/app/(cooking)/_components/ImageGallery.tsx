import Link from 'next/link';
import type { PostMetadata } from '../../../../scripts/types';

interface ImageGalleryProps {
  items: PostMetadata[];
  baseUrl: string;
}

export function ImageGallery({ items, baseUrl }: ImageGalleryProps) {
  if (items.length === 0) {
    return (
      <p className="text-secondary text-sm py-16 text-center">暂无内容</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`${baseUrl}/${item.slug}`}
          className="group block border border-border rounded-lg overflow-hidden bg-card hover:border-foreground/20 transition-colors"
        >
          <div className="aspect-square bg-muted overflow-hidden">
            {item.cover ? (
              <img
                src={item.cover}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                暂无图片
              </div>
            )}
          </div>
          <div className="px-2.5 py-2">
            <span className="font-medium text-xs group-hover:text-foreground transition-colors">
              {item.title}
            </span>
            {item.date && (
              <span className="text-xs text-muted-foreground block mt-0.5">
                {new Date(item.date).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
