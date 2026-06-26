import type { Metadata } from 'next';
import path from 'path';
import MdxRenderer from '@/components/ui/MdxRenderer';
import { parseMdFromFile } from '@/libs/content-supports';
import { serializeMdx } from '@/libs/mdx-serializer';

export const metadata: Metadata = {
  title: '简历',
  description: '康佳的简历',
};

export default async function ResumePage() {
  const CONTENT_DIR = path.resolve(process.cwd(), 'content');
  const filePath = path.join(CONTENT_DIR, 'pages', 'resume.md');
  const fileContent = parseMdFromFile(filePath, true);
  if (!fileContent?.content) {
    return (
      <div className="py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">康佳的简历</h1>
        </header>
        <div className="py-16 text-center text-secondary">
          <p className="text-4xl mb-4">🤝</p>
          <p>暂无内容</p>
          <p className="text-xs mt-2">请在 Notion 中配置「简历」页面后拉取。</p>
        </div>
      </div>
    );
  }

  const mdxSource = await serializeMdx(fileContent.content);

  return (
    <div className="py-8 space-y-8">
      {/*<header>*/}
      {/*  <h1 className="text-3xl font-bold tracking-tight">友情链接</h1>*/}
      {/*</header>*/}
      <MdxRenderer source={mdxSource} className="text-base lg:text-lg" />
    </div>
  );
}
