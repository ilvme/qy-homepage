import ImageViewer from '@/components/ui/ImageViewer';

interface WordImageGridProps {
  images: string[];
}

export default function WordImageGrid({ images }: WordImageGridProps) {
  if (images.length === 0) return null;

  // 单张图片 - 最大宽度限制
  if (images.length === 1) {
    return (
      <div className="mt-4">
        <ImageViewer
          src={images[0]}
          alt=""
          className="max-h-96 w-full object-cover  hover:opacity-95 transition-opacity cursor-zoom-in"
        />
      </div>
    );
  }

  // 2 张图片 - 双列布局
  if (images.length === 2) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        {images.map((src, i) => (
          <ImageViewer
            key={i}
            src={src}
            alt=""
            className="aspect-square w-full object-cover  hover:opacity-95 transition-opacity cursor-zoom-in"
          />
        ))}
      </div>
    );
  }

  // 3 张图片 - 三列布局
  if (images.length === 3) {
    return (
      <div className="mt-4 grid grid-cols-3 gap-2">
        {images.map((src, i) => (
          <ImageViewer
            key={i}
            src={src}
            alt=""
            className="aspect-square w-full object-cover  hover:opacity-95 transition-opacity cursor-pointer"
          />
        ))}
      </div>
    );
  }

  // 4 张图片 - 2x2 网格
  if (images.length === 4) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        {images.map((src, i) => (
          <ImageViewer
            key={i}
            src={src}
            alt=""
            className="aspect-square w-full object-cover  hover:opacity-95 transition-opacity cursor-zoom-in"
          />
        ))}
      </div>
    );
  }

  // 5-6 张图片 - 3列网格
  // 7+ 张图片 - 4列网格
  const gridClass = images.length <= 6 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <div className={`mt-4 grid ${gridClass} gap-2`}>
      {images.map((src, i) => (
        <ImageViewer
          key={i}
          src={src}
          alt=""
          className="aspect-square w-full object-cover  hover:opacity-95 transition-opacity cursor-zoom-in"
        />
      ))}
    </div>
  );
}
