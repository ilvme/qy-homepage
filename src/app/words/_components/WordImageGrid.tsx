import ImageViewer from '@/components/ui/ImageViewer';

interface WordImageGridProps {
  images: string[];
}

export default function WordImageGrid({ images }: WordImageGridProps) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="mt-3">
        <ImageViewer
          src={images[0]}
          alt=""
          className="max-h-96 w-full object-cover"
        />
      </div>
    );
  }

  const gridCols = images.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className={`mt-3 grid ${gridCols} gap-1`}>
      {images.map((src, i) => (
        <ImageViewer
          key={i}
          src={src}
          alt=""
          className="h-full w-full object-cover"
        />
      ))}
    </div>
  );
}
