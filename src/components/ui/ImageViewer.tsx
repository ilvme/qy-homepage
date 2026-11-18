'use client';

import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import { Zoom } from 'yet-another-react-lightbox/plugins';
import 'yet-another-react-lightbox/styles.css';

interface ImageViewerProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function ImageViewer({
  src,
  alt,
  width,
  height,
  className = '',
}: ImageViewerProps) {
  const [open, setOpen] = useState(false);
  // Notion 无 caption 时同步脚本会写入通用占位词 "Image"，对读屏和图片搜索都是噪音，
  // 这类图片按装饰性处理：alt 留空，也不渲染图注。
  const realAlt = alt && alt !== 'Image' ? alt : '';

  return (
    <>
      {/* 用 span + block 替代 figure/div：图片常位于正文段落 <p> 内，
          块级标签嵌套在 p 里属非法 HTML，会触发浏览器解析纠错导致 hydration 失败 */}
      <span className="block my-4">
        <span
          className="relative block overflow-hidden rounded-lg cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <img
            src={src}
            alt={realAlt}
            width={width}
            height={height}
            className={className || 'max-w-full rounded-lg'}
            loading="lazy"
            decoding="async"
          />
        </span>
        {realAlt && (
          <span className="block -mt-1.5 text-center text-sm text-secondary">
            {realAlt}
          </span>
        )}
      </span>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src, alt: realAlt, description: realAlt }]}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3 }}
        carousel={{ finite: true }}
        controller={{ closeOnBackdropClick: true }}
        styles={{ container: { backgroundColor: 'rgba(0, 0, 0, .9)' } }}
      />
    </>
  );
}
