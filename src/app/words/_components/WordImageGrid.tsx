'use client';

import { useCallback, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import { Zoom } from 'yet-another-react-lightbox/plugins';
import 'yet-another-react-lightbox/styles.css';

interface WordImageGridProps {
  images: string[];
}

/**
 * 说说图片网格 + 共享灯箱
 *
 * 所有图片共用一个 Lightbox 实例：点击第 N 张打开灯箱第 N 张，
 * 可在灯箱内前后滑动切换。open state 由 index 驱动（-1 = 关闭）。
 */
export default function WordImageGrid({ images }: WordImageGridProps) {
  const [index, setIndex] = useState(-1);
  const open = index >= 0;

  const close = useCallback(() => setIndex(-1), []);
  const slides = images.map((src) => ({ src }));

  if (images.length === 0) return null;

  // 单张图片 - 最大宽度限制
  // 2/4 张 - 双列，3 张 - 三列，5-6 张 - 三列，7+ 张 - 四列
  const isSingle = images.length === 1;
  const gridClass =
    images.length === 2 || images.length === 4
      ? 'grid-cols-2'
      : images.length === 3 || images.length <= 6
        ? 'grid-cols-3'
        : 'grid-cols-4';

  return (
    <div className="mt-4">
      <div className={isSingle ? undefined : `grid gap-2 ${gridClass}`}>
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i)}
            className="block w-full p-0 border-0 bg-transparent cursor-zoom-in overflow-hidden"
          >
            <img
              src={src}
              alt=""
              className={
                isSingle
                  ? 'max-h-96 w-full object-cover hover:opacity-95 transition-opacity'
                  : 'aspect-square w-full object-cover hover:opacity-95 transition-opacity'
              }
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <Lightbox
        open={open}
        index={index}
        close={close}
        slides={slides}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3 }}
        carousel={{ finite: true }}
        controller={{ closeOnBackdropClick: true }}
        styles={{ container: { backgroundColor: 'rgba(0, 0, 0, .9)' } }}
      />
    </div>
  );
}
