import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * 一次性脚本：把 public/notion-images 存量图片重编码为 webp。
 * 处理范围：posts / words / cooking / shares（pages 目录当前为空）。
 * 只处理位图（jpg/jpeg/png），跳过已存在的 webp 与 svg/gif。
 * 压缩参数与 downloadImage 保持一致：最长边 1600、质量 80。
 *
 * 运行：pnpm tsx scripts/reencode-images.ts
 */

const ROOT = path.resolve(process.cwd(), 'public/notion-images');
const TARGETS = ['posts', 'words', 'cooking', 'shares'];
const MAX_DIM = 1600;
const QUALITY = 80;

interface Stat {
  processed: number;
  skipped: number;
  failed: number;
  before: number;
  after: number;
}

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((ent) => {
    const p = path.join(dir, ent.name);
    return ent.isDirectory() ? walk(p) : [p];
  });
}

async function reencodeFile(file: string, stat: Stat): Promise<void> {
  const ext = path.extname(file).toLowerCase();
  // 只处理位图
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
    stat.skipped++;
    return;
  }

  const webpPath = file.replace(ext, '.webp');
  // 已存在同名 webp（此前已处理过）则跳过
  if (fs.existsSync(webpPath)) {
    stat.skipped++;
    return;
  }

  const before = fs.statSync(file).size;
  try {
    const outBuf = await sharp(file)
      .rotate()
      .resize({
        width: MAX_DIM,
        height: MAX_DIM,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY })
      .toBuffer();

    fs.writeFileSync(webpPath, outBuf);
    const after = fs.statSync(webpPath).size;
    stat.processed++;
    stat.before += before;
    stat.after += after;
  } catch (err) {
    stat.failed++;
    console.warn(`  ✗ ${file}: ${err instanceof Error ? err.message : err}`);
  }
}

async function main() {
  const stat: Stat = {
    processed: 0,
    skipped: 0,
    failed: 0,
    before: 0,
    after: 0,
  };

  const files: string[] = [];
  for (const t of TARGETS) {
    files.push(...walk(path.join(ROOT, t)));
  }

  console.log(`扫描到 ${files.length} 个文件，开始重编码…\n`);

  for (const file of files) {
    await reencodeFile(file, stat);
  }

  const mb = (n: number) => (n / 1024 / 1024).toFixed(1);
  const ratio =
    stat.before > 0 ? ((stat.after / stat.before) * 100).toFixed(1) : '0';
  console.log('\n完成：');
  console.log(
    `  处理 ${stat.processed} 张，跳过 ${stat.skipped} 张，失败 ${stat.failed} 张`,
  );
  console.log(
    `  原始 ${mb(stat.before)} MB → 压缩后 ${mb(stat.after)} MB（${ratio}%）`,
  );
  console.log('\n下一步（需手动执行）：');
  console.log(
    '  1. 确认 md 里的图片引用已指向 .webp（由 fetcher 重新生成，或脚本另行替换）',
  );
  console.log('  2. 删除旧的原图文件（.jpg/.png），git 历史瘦身另行评估');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
