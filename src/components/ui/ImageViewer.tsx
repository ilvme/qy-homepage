'use client';

import { useEffect, useState } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);
  const caption = alt && alt !== 'Image' ? alt : '';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <figure className={`my-4 ${className}`}>
        <div
          className="relative cursor-pointer overflow-hidden rounded-lg"
          onClick={() => setIsOpen(true)}
        >
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full object-cover"
            loading="lazy"
          />
        </div>
        {caption && (
          <figcaption className="-mt-1.5 text-center text-sm text-secondary">
            {caption}
          </figcaption>
        )}
      </figure>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition"
              onClick={() => setIsOpen(false)}
              aria-label="关闭"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {caption && (
              <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/50 py-2 px-3 mx-auto w-fit rounded">
                {caption}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
