import rehypeShiki from '@shikijs/rehype';
import { serialize } from 'next-mdx-remote/serialize';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';

const shikiOptions = {
  themes: { light: 'github-light', dark: 'github-dark' },
  defaultColor: false,
  addLanguageClass: true,
};

/** MDX 节点的 passThrough，防止 rehype-raw 误处理 MDX 组件 */
const rawPassThrough = [
  'mdxjsEsm',
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
  'mdxTextExpression',
  'mdxFlowExpression',
] as const;

/** 标准 MDX 序列化：raw HTML + 语法高亮 + 标题锚点 */
export async function serializeMdx(content: string) {
  return serialize(content, {
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [
        [rehypeRaw, { passThrough: rawPassThrough }],
        [rehypeShiki, shikiOptions],
        rehypeSlug,
      ],
    },
  });
}

/** 轻量 MDX 序列化：仅 raw HTML */
export async function serializeMdxLite(content: string) {
  return serialize(content, {
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [[rehypeRaw, { passThrough: rawPassThrough }]],
    },
  });
}
