"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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
  className = "",
}: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* 缩略图 */}
      <div className="relative cursor-pointer" onClick={openModal}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`rounded-lg object-cover ${className}`}
          unoptimized // 如果是本地已优化图片可以不加，视情况
        />
      </div>

      {/* 全屏模态框 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeModal}
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
              className="absolute top-4 right-2 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition"
              onClick={closeModal}
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
            {alt && (
              <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/50 py-1 px-2 mx-auto w-fit rounded">
                {alt}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
