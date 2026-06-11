import { serialize } from 'next-mdx-remote/serialize';
import WordImageGrid from '@/app/words/_components/WordImageGrid';
import MdxRenderer from '@/components/ui/MdxRenderer';

export default async function WordCard({ post }) {
  const { images, cleanedContent } = extractImagesFromMdx(post.content);
  const hasContent = cleanedContent.length > 0;

  const waitToRender = hasContent ? cleanedContent : post.title;

  // 将 Markdown 序列化为可渲染的格式
  const mdxSource = await serialize(waitToRender, {
    mdxOptions: {
      // 使用 remark 插件处理 Markdown 内容
      remarkPlugins: [],

      // 可添加 rehype 插件，例如 rehype-highlight 实现代码高亮
      rehypePlugins: [],
    },
  });

  return (
    <div>
      <section>
        <span>{post.date ? post.date : post.last_edited_time}</span>
        <span>{post.tags}</span>
      </section>

      <article>{hasContent && <MdxRenderer source={mdxSource} />}</article>

      <WordImageGrid images={images} />
    </div>
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
