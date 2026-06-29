import { EmptyShower } from '@/components/ui/EmptyShower';
import type { ShareMetadata } from '../../../../../scripts/types';

interface TasteGalleryProps {
  items: ShareMetadata[];
}

export function TasteGallery({ items }: TasteGalleryProps) {
  if (items.length === 0) return <EmptyShower />;

  return (
    <div className="grid grid-cols-4 gap-3 md:grid-cols-5 md:gap-4">
      {items.map((item) => (
        <a
          key={item.slug}
          href={item.link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-sm hover:opacity-90 transition-opacity"
        >
          <div className="aspect-[2/3] bg-muted  overflow-hidden">
            {item.cover ? (
              <img
                src={item.cover}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                暂无图片
              </div>
            )}
          </div>
          <p className="mt-1.5 text-sm leading-tight truncate">{item.title}</p>
          <p className="text-secondary text-xs">{item.author}</p>
        </a>
      ))}
    </div>
  );
}
