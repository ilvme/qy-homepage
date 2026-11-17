import crypto from 'node:crypto';
import type { Client } from '@notionhq/client';
import fs from 'fs';
import { NotionConverter } from 'notion-to-md';
import { MDXRenderer } from 'notion-to-md/plugins/renderer';
import path from 'path';
import sharp from 'sharp';

/** 带指数退避重试的 fetch，最多重试 3 次 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries = 3,
): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      // 4xx 客户端错误不重试
      if (res.ok || (res.status >= 400 && res.status < 500)) return res;
      if (i < retries) {
        const delay = 2 ** i * 1000;
        console.warn(
          `  ⚠ HTTP ${res.status}, retrying in ${delay}ms (${i + 1}/${retries})`,
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (i < retries) {
        const delay = 2 ** i * 1000;
        console.warn(
          `  ⚠ fetch error, retrying in ${delay}ms (${i + 1}/${retries}): ${err}`,
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

export interface ConverterConfig {
  /** 图片下载目录，如 public/notion-images/posts */
  mediaDir: string;
  /** 图片 URL 路径前缀，如 /notion-images/posts */
  mediaUrlPath: string;
}

/** 下载图片到本地并压缩为 webp，返回本地相对 URL 路径 */
export async function downloadImage(
  url: string,
  outputDir: string,
  urlPath: string,
): Promise<string> {
  if (!url.includes('amazonaws.com') && !url.includes('notion.so')) {
    return url; // 非 Notion 图片，保持原样
  }

  // 用 URL path 哈希做文件名（去掉签名 query — Notion s3 URL 每次返回的
  // X-Amz-Signature 都不同，对完整 URL 哈希会导致缓存永远不命中、目录无限膨胀）
  const hash = crypto
    .createHash('md5')
    .update(url.split('?')[0])
    .digest('hex')
    .slice(0, 8);
  const name = `img_${hash}`;
  const ext = url.match(/\.(png|jpe?g|gif|webp|svg)(\?|$)/i)?.[1] ?? 'png';
  const fileName = `${name}.webp`;
  const filePath = path.join(outputDir, fileName);

  if (fs.existsSync(filePath)) return `${urlPath}/${fileName}`;

  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());

    // 懒创建目录 — 无图文章不产生空目录
    fs.mkdirSync(outputDir, { recursive: true });

    // 压缩：最长边 1600、质量 80、转 webp；SVG/GIF 原样保留（webp 会破坏动图/矢量）
    let outBuf: Buffer = buf;
    if (ext !== 'svg' && ext !== 'gif') {
      outBuf = await sharp(buf)
        .rotate() // 按 EXIF 方向校正
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();
    } else {
      // 非 webp 输出的格式原样写盘（SVG/GIF 保持原扩展名）
      const fallbackName = `${name}.${ext}`;
      fs.writeFileSync(path.join(outputDir, fallbackName), buf);
      return `${urlPath}/${fallbackName}`;
    }

    fs.writeFileSync(filePath, outBuf);
    return `${urlPath}/${fileName}`;
  } catch (err) {
    // 抛错而不是返回原 URL：返回签名 URL 会 1 小时后过期成死链，
    // 且 fetcher 会写入 state 导致永不重试。抛错让整篇 convert 失败，
    // state 不更新，下次同步自动重试。
    console.warn(`  ⚠ 图片下载失败，本文稍后重试: ${url.split('?')[0]}`);
    throw err;
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

    // 目录按需创建（downloadImage 写盘前 mkdir）— 无图文章不建空目录

    const renderer = new MDXRenderer();

    // paragraph 分三种情况：
    // 1. 空段落（Notion 里的空行）→ 显式 <br />。notion-to-md 拼接时会吞掉
    //    纯空白输出，空行就没了；非空白标记能存活，渲染成视觉空行
    // 2. 段内 \n（Shift+Enter）→ Markdown 软换行（行尾两空格 + \n），
    //    渲染成同一 <p> 内紧挨着的 <br>
    // 3. 普通段落（Enter）→ 原文 + 标准段落分隔
    renderer.createBlockTransformer('paragraph', {
      transform: async ({ block, utils }) => {
        const text = await utils.transformRichText(block.paragraph.rich_text);
        if (text.trim() === '') {
          return '<br />\n\n';
        }
        return text.replace(/\n/g, '  \n') + '\n\n';
      },
    });

    // callout → <Callout>
    // rich_text 内：\n\n 是分段（Enter），单个 \n 是软换行（Shift+Enter）
    // 子块（callout 里 Enter 创建的段落等）需要递归转换，否则整块丢失
    renderer.createBlockTransformer('callout', {
      transform: async ({ block, utils }) => {
        const text = await utils.transformRichText(block.callout.rich_text);
        const body = text.replace(/(?<!\n)\n(?!\n)/g, '  \n');

        let childrenMd = '';
        const kids = block.children?.length
          ? block.children
          : (
              await notionClient.blocks.children.list({
                block_id: block.id,
              })
            ).results;
        if (kids.length) {
          const parts = [];
          for (const child of kids) {
            const md = await utils.processBlock(child as any);
            if (md.trim() !== '') parts.push(md.replace(/\n+$/, ''));
          }
          if (parts.length) childrenMd = '\n\n' + parts.join('\n\n');
        }

        const icon = (block.callout.icon as any)?.emoji ?? '';
        const color = block.callout.color ?? '';
        return `<Callout icon="${icon}" color="${color}">\n\n${body}${childrenMd}\n\n</Callout>\n\n`;
      },
    });

    // image → 统一走 downloadImage（webp 压缩 + 稳定 hash 命名）
    // 覆盖 notion-to-md 内置的 downloadMediaTo 路径（UUID 原名、原格式不压缩）
    renderer.createBlockTransformer('image', {
      transform: async ({ block, utils }) => {
        const img = (block as any).image;
        const url =
          img?.type === 'external' ? img.external?.url : img?.file?.url;
        if (!url) return '';
        const caption = (
          await utils.transformRichText(img.caption ?? [])
        ).trim();
        const local = await downloadImage(url, pageMediaDir, pageMediaPath);
        return `![${caption}](${local})\n\n`;
      },
    });

    // quote → blockquote。rich_text 内单个 \n（Shift+Enter）转软换行，
    // \n\n（Enter）保持引用内分段（> 空行）
    renderer.createBlockTransformer('quote', {
      transform: async ({ block, utils }) => {
        const text = await utils.transformRichText(block.quote.rich_text);
        const md = text.replace(/(?<!\n)\n(?!\n)/g, '  \n');
        const quoted = md
          .split('\n')
          .map((l) => (l === '' ? '>' : '> ' + l))
          .join('\n');
        return quoted + '\n\n';
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
                resp.results.map((child: any) => utils.processBlock(child)),
              );

              return `<Column>\n\n${parts.join('\n\n')}\n\n</Column>`;
            } catch (err) {
              // 不吞错误：列内图片下载失败等需要整篇失败、下次同步重试，
              // 吞掉会把丢图/空列固化进 md 并写入 state
              throw err;
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
        // 不用 trackMediaBlocks/downloadMediaTo：内置媒体下载用 Notion 原名
      // 存原始格式（png/jpg 不压缩），且签名 URL 变化导致目录膨胀。
      // 图片统一由上方自定义 image transformer 走 downloadImage（webp）。
        trackMediaBlocks: false,
      })
      .withRenderer(renderer);

    // notion-to-md v4 内部大量 console.debug，抑制输出
    const _debug = console.debug;
    console.debug = () => {};
    const result = await converter.convert(pageId);
    console.debug = _debug;

    let content = result.content;

    // 修复列表最后一项与下一段落之间缺少空行的问题（notion-to-md bug）
    // 匹配: 列表项行 → 紧跟非列表、非空行 → 插入空行
    content = content.replace(
      /^((?:\d+\. |[-*] ).+)\n(?!\s*(?:\d+\. |[-*] ))(.+)/gm,
      '$1\n\n$2',
    );

    // 空 paragraph 已由 transformer 输出显式 <br />，这里只需把 block 拼接
    // 产生的多余换行（\n\n\n）规整为标准段落分隔 \n\n
    content = content.replace(/\n{3,}/g, '\n\n');

    // 清理本页目录中未被引用的媒体文件（换图/换签名 URL 后的旧文件）。
    // 引用来源：正文图片（![](...)）+ 封面（由 fetcher 的 syncCover 写入同目录，
    // 其引用在 md frontmatter 中，不在此处 — cover 单独豁免）。
    if (fs.existsSync(pageMediaDir)) {
      const referenced = new Set(
        [...content.matchAll(/\/notion-images\/[^)\s"']+/g)].map(
          (m) => m[0],
        ),
      );
      for (const f of fs.readdirSync(pageMediaDir)) {
        // cover/文件名以 cover 开头的（syncCover 生成）豁免
        if (f.startsWith('cover.')) continue;
        const ref = `${pageMediaPath}/${f}`;
        if (!referenced.has(ref)) {
          fs.unlinkSync(path.join(pageMediaDir, f));
        }
      }
      // 目录清空后（无图文章）删除空目录
      if (fs.readdirSync(pageMediaDir).length === 0) {
        fs.rmSync(pageMediaDir, { recursive: true });
      }
    }

    return content;
  } catch (error) {
    console.error(`✗ notion-to-md 转换失败 [${pageId}]:`, error);
    return undefined;
  }
}

