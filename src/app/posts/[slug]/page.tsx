import { notFound } from 'next/navigation';
import { serialize } from 'next-mdx-remote/serialize';
import MdxRenderer from '@/components/ui/MdxRenderer';
import { fetchAllPosts, getPostBySlug } from '@/libs/content-loader';

export async function generateStaticParams() {
  const allPosts = await fetchAllPosts();

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
      <h1 className="text-lg font-bold">{postWithContent.title}</h1>

      <figure className="flex gap-2">
        <p>{postWithContent.date}</p>
        <p>
          {postWithContent.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </p>
      </figure>

      <MdxRenderer source={mdxSource} />
    </div>
  );
}
