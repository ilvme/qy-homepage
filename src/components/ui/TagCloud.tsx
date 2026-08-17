import Link from 'next/link';

interface TagCloudProps {
  tags: { label: string; count: number }[];
  /** 链接前缀，如 '/tags' 或 '/words/tags' */
  basePath: string;
}

/** 标签云：文章 tags 页与说说 tags 页共用 */
export default function TagCloud({ tags, basePath }: TagCloudProps) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
      {tags.map((tag) => (
        <Link
          key={tag.label}
          href={`${basePath}/${tag.label}`}
          className="hover:underline text-secondary text-sm"
        >
          #{tag.label} {tag.count}
        </Link>
      ))}
    </div>
  );
}
