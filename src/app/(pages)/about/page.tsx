import fs from 'fs';
import matter from 'gray-matter';
import Link from 'next/link';
import { serialize } from 'next-mdx-remote/serialize';
import path from 'path';
import rehypeSlug from 'rehype-slug';
import MdxRenderer from '@/components/ui/MdxRenderer';
import { parseMdFromFile } from '@/libs/content-supports';

export default async function AboutMe() {
  const CONTENT_DIR = path.resolve(process.cwd(), 'content');
  // 读取文件文本
  const filePath = path.join(CONTENT_DIR, 'about.md');
  const fileContent = parseMdFromFile(filePath, true);

  const mdxSource = await serialize(fileContent.content, {
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [rehypeSlug],
    },
  });
  return <MdxRenderer source={mdxSource}></MdxRenderer>;
}
