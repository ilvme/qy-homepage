import path from 'path';
import MdxRenderer from '@/components/ui/MdxRenderer';
import { parseMdFromFile } from '@/libs/content-supports';
import { serializeMdx } from '@/libs/mdx-serializer';

export default async function AboutMe() {
  const CONTENT_DIR = path.resolve(process.cwd(), 'content');
  const filePath = path.join(CONTENT_DIR, 'pages', 'readme.md');
  const fileContent = parseMdFromFile(filePath, true);
  if (!fileContent?.content) {
    return (
      <div className="py-16 text-center text-secondary">
        <p className="text-4xl mb-4">📄</p>
        <p>暂无内容</p>
        <p className="text-xs mt-2">请在 Notion 中配置「readme」页面后拉取。</p>
      </div>
    );
  }

  const mdxSource = await serializeMdx(fileContent.content);
  return <MdxRenderer source={mdxSource} className="text-base lg:text-lg" />;
}
