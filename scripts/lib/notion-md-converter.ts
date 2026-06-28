import type { Client } from '@notionhq/client';
import fs from 'fs';
import { NotionConverter } from 'notion-to-md';
import { MDXRenderer } from 'notion-to-md/plugins/renderer';
import path from 'path';

export interface ConverterConfig {
  /** 图片下载目录，如 public/notion-images/posts */
  mediaDir: string;
  /** 图片 URL 路径前缀，如 /notion-images/posts */
  mediaUrlPath: string;
}

/** 下载图片到本地，返回本地相对 URL 路径 */
export async function downloadImage(
  url: string,
  outputDir: string,
  urlPath: string,
): Promise<string> {
  if (!url.includes('amazonaws.com') && !url.includes('notion.so')) {
    return url; // 非 Notion 图片，保持原样
  }

  // 用 block_id 做文件名避免冲突
  const name = `col_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const ext = url.match(/\.(png|jpe?g|gif|webp|svg)(\?|$)/i)?.[1] ?? 'png';
  const fileName = `${name}.${ext}`;
  const filePath = path.join(outputDir, fileName);

  if (fs.existsSync(filePath)) return `${urlPath}/${fileName}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filePath, buf);
    return `${urlPath}/${fileName}`;
  } catch {
    return url; // 下载失败保持原 URL
  }
}

/**
 * 使用 notion-to-md v4 将 Notion 页面转换为 Markdown
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

    if (!fs.existsSync(pageMediaDir)) {
      fs.mkdirSync(pageMediaDir, { recursive: true });
    }

    const renderer = new MDXRenderer();

    // image → 保留 Notion 标题作为 alt
    renderer.createBlockTransformer('image', {
      transform: async ({ block, utils }) => {
        const url =
          block.image.type === 'external'
            ? block.image.external.url
            : block.image.file.url;
        const caption = await utils.transformRichText(
          (block.image as any).caption ?? [],
        );
        const alt = caption || 'Image';
        return `![${alt}](${url})\n\n`;
      },
    });

    // callout → <Callout>
    renderer.createBlockTransformer('callout', {
      transform: async ({ block, utils }) => {
        const text = await utils.transformRichText(block.callout.rich_text);
        const icon = (block.callout.icon as any)?.emoji ?? '';
        const color = block.callout.color ?? '';
        return `<Callout icon="${icon}" color="${color}">\n\n${text}\n\n</Callout>\n\n`;
      },
    });

    // column: 不收集
    renderer.createBlockTransformer('column', {
      targetVariable: '',
      transform: async () => '',
    });

    // column_list → <Columns><Column>...</Column></Columns>
    renderer.createBlockTransformer('column_list', {
      transform: async ({ block, utils }) => {
        if (!block.children?.length) return '';

        const cols = block.children.length;
        const columns = await Promise.all(
          block.children.map(async (col: any) => {
            try {
              const resp = await notionClient.blocks.children.list({
                block_id: col.id,
              });
              if (!resp.results.length) return '<Column>\n\n\n\n</Column>';

              const parts = await Promise.all(
                resp.results.map(async (child: any) => {
                  let md = await utils.processBlock(child);

                  // 列内图片：手动下载 + URL 替换
                  if (child.type === 'image') {
                    const url =
                      child.image?.type === 'external'
                        ? child.image.external.url
                        : child.image?.file?.url;
                    if (url) {
                      const local = await downloadImage(
                        url,
                        pageMediaDir,
                        pageMediaPath,
                      );
                      md = md.replace(url, local);
                    }
                  }

                  return md;
                }),
              );

              return `<Column>\n\n${parts.join('\n\n')}\n\n</Column>`;
            } catch {
              return '<Column>\n\n\n\n</Column>';
            }
          }),
        );

        return `<Columns cols={${cols}}>\n${columns.join('\n')}\n</Columns>\n\n`;
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

    // 保留多个空行
    const content = result.content.replace(/\n\n(\n+)/g, (_, extras: string) => {
      const brCount = Math.floor(extras.length / 2);
      return '\n\n' + '<br />\n'.repeat(brCount) + '\n';
    });

    return content;
  } catch (error) {
    console.error(`✗ notion-to-md 转换失败 [${pageId}]:`, error);
    return undefined;
  }
}
