import { evaluate } from '@mdx-js/mdx';
import rehypeShiki from '@shikijs/rehype';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import Callout from '@/components/ui/Callout';
import CodeBlock from '@/components/ui/CodeBlock';
import ImageViewer from '@/components/ui/ImageViewer';
import Prose from '@/components/ui/Prose';

interface MarkdownRendererProps {
  content: string;
  highlight?: boolean;
  slug?: boolean;
  className?: string;
}

const components = {
  Callout,
  img: ({ src, alt }: any) => (
    <ImageViewer src={src ?? ''} alt={alt ?? ''} width={800} height={500} />
  ),
  pre: (props: any) => <CodeBlock {...props} />,
};

export default async function MarkdownRenderer({
  content,
  highlight = true,
  slug = true,
  className,
}: MarkdownRendererProps) {
  const rehypePlugins: any[] = [];

  if (highlight) {
    rehypePlugins.push([
      rehypeShiki,
      {
        themes: { light: 'github-light', dark: 'monokai' },
        defaultColor: false,
        addLanguageClass: true,
      },
    ]);
  }
  if (slug) rehypePlugins.push(rehypeSlug);

  const { default: MDXContent } = await evaluate(content, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins,
  });

  return (
    <Prose className={className}>
      <MDXContent components={components} />
    </Prose>
  );
}
