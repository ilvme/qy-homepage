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
      <figure className="my-4">
        <div
          className="relative overflow-hidden rounded-lg cursor-zoom-in"
          onClick={() => setOpen(true)}
        >
          <img
            src={src}
            alt={alt}
            className={className || 'max-w-full rounded'}
            loading="lazy"
          />
        </div>
        {caption && (
          <figcaption className="-mt-1.5 text-center text-sm text-secondary">
            {caption}
          </figcaption>
        )}
      </figure>

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
