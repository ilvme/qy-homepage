import path from 'path';
import { compile, run } from '@mdx-js/mdx';
import { unstable_cache } from 'next/cache';
import rehypeShiki from '@shikijs/rehype';
import * as runtime from 'react/jsx-runtime';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import sharp from 'sharp';
import Callout from '@/components/ui/Callout';
import CodeBlock from '@/components/ui/CodeBlock';
import { Column, Columns } from '@/components/ui/Columns';
import ImageViewer from '@/components/ui/ImageViewer';
import Prose from '@/components/ui/Prose';

interface MarkdownRendererProps {
  content: string;
  highlight?: boolean;
  slug?: boolean;
  className?: string;
}

const PUBLIC_DIR = path.join(process.cwd(), 'public');

/**
 * 读取本地图片真实宽高，用于给 <img> 补 width/height 占位，避免加载时正文跳动（CLS）。
 * 图片尺寸不会变，按 src 永久缓存；外部链接或读取失败返回 null，退回无尺寸行为。
 */
const getImageSize = unstable_cache(
  async (src: string): Promise<{ width: number; height: number } | null> => {
    if (!src.startsWith('/')) return null;

    const filePath = path.join(PUBLIC_DIR, src);
    // 防止内容里的 ../ 越界读取
    if (!filePath.startsWith(PUBLIC_DIR + path.sep)) return null;

    try {
      const meta = await sharp(filePath).metadata();
      if (!meta.width || !meta.height) return null;
      return { width: meta.width, height: meta.height };
    } catch {
      return null;
    }
  },
  ['image-size-v1'],
  { revalidate: false },
);

const components = {
  Callout,
  Columns,
  Column,
  img: async ({ src, alt }: any) => {
    const size = src ? await getImageSize(src) : null;
    return (
      <ImageViewer
        src={src ?? ''}
        alt={alt ?? ''}
        width={size?.width}
        height={size?.height}
      />
    );
  },
  pre: (props: any) => <CodeBlock {...props} />,
  // 宽表格包一层横向滚动容器，避免撑破 800px 正文（尤其移动端）
  table: (props: any) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
};

/**
 * 编译 MDX 为 JS 字符串并缓存 — 跨请求复用，避免每次都重跑 remark/rehype pipeline。
 *
 * 缓存 key 由 keyParts + 全部入参（含 content）共同构成，因此正文一变更就会落到新 key，
 * 无需手动失效；revalidate=false 表示旧 key 永久有效即可。
 *
 * 注意：修改 highlight 主题、remark/rehype 插件等编译配置时，key 本身不会变，
 * 必须手动 bump 版本号（mdx-v1 → mdx-v2），否则旧缓存会继续返回过期产物。
 */
const getCompiledMdx = unstable_cache(
  async (content: string, highlight: boolean, slug: boolean) => {
    const rehypePlugins: any[] = [];

    if (highlight) {
      rehypePlugins.push([
        rehypeShiki,
        {
          themes: { light: 'catppuccin-latte', dark: 'catppuccin-mocha' },
          defaultColor: false,
          addLanguageClass: true,
        },
      ]);
    }
    if (slug) rehypePlugins.push(rehypeSlug);

    // compile 返回 JS 代码字符串（可 JSON 序列化，适合 unstable_cache）
    const code = await compile(content, {
      remarkPlugins: [remarkGfm],
      rehypePlugins,
      outputFormat: 'function-body',
    });
    return String(code);
  },
  ['mdx-v1'],
  { revalidate: false },
);

export default async function MarkdownRenderer({
  content,
  highlight = true,
  slug = true,
  className,
}: MarkdownRendererProps) {
  const code = await getCompiledMdx(content, highlight, slug);
  const { default: MDXContent } = await run(code, { ...runtime });

  return (
    <Prose className={className}>
      <MDXContent components={components} />
    </Prose>
  );
}
