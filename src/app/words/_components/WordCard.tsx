import { serialize } from 'next-mdx-remote/serialize';
import WordImageGrid from '@/app/words/_components/WordImageGrid';
import MdxRenderer from '@/components/ui/MdxRenderer';
import type { WordMetadata } from '../../../scripts/types';

interface WordCardProps {
  post: {
    postMeta: WordMetadata;
    content: string;
  };
}

export default async function WordCard({ post }: WordCardProps) {
  const { images, cleanedContent } = extractImagesFromMdx(post.content);
  const hasContent = cleanedContent.length > 0;

  const waitToRender = hasContent ? cleanedContent : post.postMeta.title;

  // 将 Markdown 序列化为可渲染的格式
  const mdxSource = await serialize(waitToRender ?? '', {
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
  });

  return (
    <article className="border border-border rounded-xl p-5 mb-4 bg-card">
      <section className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-secondary">
        <time>
          {post.postMeta.date
            ? post.postMeta.date
            : post.postMeta.last_edited_time?.substring(0, 10)}
        </time>
        {post.postMeta.tags.length > 0 && (
          <div className="flex gap-1">
            {post.postMeta.tags.map((tag) => (
              <span key={tag} className="text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}
        {post.postMeta.from && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
            来自: {post.postMeta.from}
          </span>
        )}
      </section>

      <hr className="mb-3 mt-2 border-border" />

      <div>{hasContent && <MdxRenderer source={mdxSource} />}</div>

      <WordImageGrid images={images} />
    </article>
  );
}

const IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/g;

function extractImagesFromMdx(content: string): {
  images: string[];
  cleanedContent: string;
} {
  const images: string[] = [];

  const withoutImages = content.replace(IMAGE_REGEX, (_, _alt, url: string) => {
    images.push(url.trim());
    return '';
  });

  // Collapse 3+ consecutive newlines into 2 (one blank line)
  const cleanedContent = withoutImages.replace(/\n{3,}/g, '\n\n').trim();

  return { images, cleanedContent };
}
