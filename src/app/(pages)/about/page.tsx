import fs from 'fs';
import matter from 'gray-matter';
import Link from 'next/link';
import { serialize } from 'next-mdx-remote/serialize';
import path from 'path';
import rehypeSlug from 'rehype-slug';
import rehypeShiki from '@shikijs/rehype';
import MdxRenderer from '@/components/ui/MdxRenderer';
import { parseMdFromFile } from '@/libs/content-supports';

export default async function AboutMe() {
  const CONTENT_DIR = path.resolve(process.cwd(), 'content');
  // 读取文件文本
  const filePath = path.join(CONTENT_DIR, 'about.md');
  const fileContent = parseMdFromFile(filePath, true);
  if (!fileContent?.content) return <p>内容加载失败。</p>;

  const mdxSource = await serialize(fileContent.content, {
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [
        [rehypeShiki, {
          themes: { light: 'github-light', dark: 'github-dark' },
          defaultColor: false,
          addLanguageClass: true,
        }],
        rehypeSlug,
      ],
    },
  });
  return <MdxRenderer source={mdxSource} className="text-lg"></MdxRenderer>;
}
