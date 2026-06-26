import rehypeShiki from '@shikijs/rehype';
import { serialize } from 'next-mdx-remote/serialize';
import path from 'path';
import rehypeSlug from 'rehype-slug';
import MdxRenderer from '@/components/ui/MdxRenderer';
import { parseMdFromFile } from '@/libs/content-supports';

export default async function FriendsPage() {
  const CONTENT_DIR = path.resolve(process.cwd(), 'content');
  const filePath = path.join(CONTENT_DIR, 'pages', 'friends.md');
  const fileContent = parseMdFromFile(filePath, true);
  if (!fileContent?.content) return <p>内容加载失败。</p>;

  const mdxSource = await serialize(fileContent.content, {
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [
        [
          rehypeShiki,
          {
            themes: { light: 'github-light', dark: 'github-dark' },
            defaultColor: false,
            addLanguageClass: true,
          },
        ],
        rehypeSlug,
      ],
    },
  });

  return (
    <div className="py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">友情链接</h1>
      </header>
      <MdxRenderer source={mdxSource} className="text-base lg:text-lg" />
    </div>
  );
}
