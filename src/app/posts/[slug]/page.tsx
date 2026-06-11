import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serialize } from 'next-mdx-remote/serialize';
import MdxRenderer from '@/components/ui/MdxRenderer';
import { getAllPosts, getPostBySlug } from '@/libs/content-loader';

export async function generateStaticParams() {
  const allPosts = await getAllPosts();

  return allPosts.map((post) => ({ slug: post.slug }));
}

export default async function Post({ params }) {
  const { slug } = await params;

  const postWithContent = await getPostBySlug(slug);
  if (!postWithContent) notFound();

  // 将 Markdown 序列化为可渲染的格式
  const mdxSource = await serialize(postWithContent.content, {
    mdxOptions: {
      // 使用 remark 插件处理 Markdown 内容
      remarkPlugins: [],

      // 可添加 rehype 插件，例如 rehype-highlight 实现代码高亮
      rehypePlugins: [],
    },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{postWithContent.title}</h1>

      <section className="flex gap-2 mb-4">
        <p>{postWithContent.date}</p>

        <p>{postWithContent.category}</p>

        <p>
          {postWithContent.tags.map((tag) => (
            <Link href={`/tags/${tag}`} key={tag} className="hover:underline">
              #{tag}
            </Link>
          ))}
        </p>
      </section>

      <MdxRenderer source={mdxSource} />
    </div>
  );
}
