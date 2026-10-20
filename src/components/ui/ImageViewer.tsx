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
  width = 800,
  height = 500,
  className = '',
}: ImageViewerProps) {
  const [open, setOpen] = useState(false);
  const caption = alt && alt !== 'Image' ? alt : '';

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
            alt={alt}
            className={className || 'max-w-full rounded'}
            loading="lazy"
          />
        </span>
        {caption && (
          <span className="block -mt-1.5 text-center text-sm text-secondary">
            {caption}
          </span>
        )}
      </span>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src, alt: caption || alt, description: caption }]}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3 }}
        carousel={{ finite: true }}
        controller={{ closeOnBackdropClick: true }}
        styles={{ container: { backgroundColor: 'rgba(0, 0, 0, .9)' } }}
      />
    </>
  );
}
