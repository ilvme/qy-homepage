import type { Client } from '@notionhq/client';
import { NotionConverter } from 'notion-to-md';
import { MDXRenderer } from 'notion-to-md/plugins/renderer';
import path from 'path';

export interface ConverterConfig {
  /** 图片下载目录，如 public/notion-images/posts */
  mediaDir: string;
  /** 图片 URL 路径前缀，如 /notion-images/posts */
  mediaUrlPath: string;
}

/**
 * 使用 notion-to-md v4 将 Notion 页面转换为 Markdown
 *
 * 内置图片下载（downloadMediaTo），替代原来的 images-handler 正则提取
 * 内置速率控制（maxRequestsPerSecond），替代手动 sleep
 */
export async function convertPageToMarkdown(
  notionClient: Client,
  pageId: string,
  key: string,
  config: ConverterConfig,
): Promise<string | undefined> {
  try {
    const pageMediaDir = path.resolve(process.cwd(), config.mediaDir, key);
    const pageMediaPath = `${config.mediaUrlPath}/${key}`;

    const renderer = new MDXRenderer();

    // callout → <Callout> 组件（从 Notion block 读取 icon + color）
    renderer.createBlockTransformer('callout', {
      transform: async ({ block, utils }) => {
        const text = await utils.transformRichText(block.callout.rich_text);
        const icon = (block.callout.icon as any)?.emoji ?? '';
        const color = block.callout.color ?? '';
        return `<Callout icon="${icon}" color="${color}">\n\n${text}\n\n</Callout>\n\n`;
      },
    });

    const converter = new NotionConverter(notionClient);

    converter
      .configureFetcher({
        maxRequestsPerSecond: 3,
        batchSize: 5,
        trackMediaBlocks: true,
      })
      .downloadMediaTo({
        outputDir: pageMediaDir,
        transformPath: (localPath: string) =>
          `${pageMediaPath}/${path.basename(localPath)}`,
        preserveExternalUrls: true,
        failForward: true,
      })
      .withRenderer(renderer);

    const result = await converter.convert(pageId);
    return result.content;
  } catch (error) {
    console.error(`✗ notion-to-md 转换失败 [${pageId}]:`, error);
    return undefined;
  }
}
