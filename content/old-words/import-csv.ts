import 'dotenv/config';
import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_WORDS_DATABASE_ID;
const CSV_PATH = path.join(__dirname, 'old-words.csv');
const DELAY_MS = 350; // Notion API rate limit ~3 req/s

/**
 * 解析中文日期时间，如 "2026年6月17日 10:36 (UTC)" → "2026-06-17T10:36:00"
 * 无时间部分时默认 00:00:00
 */
function parseChineseDate(raw: string): string | null {
  const match = raw.match(/(\d{4})年(\d{1,2})月(\d{1,2})日(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!match) return null;
  const [, year, month, day, hour, min] = match;
  const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const time = hour ? `${hour.padStart(2, '0')}:${min}:00` : '00:00:00';
  return `${date}T${time}`;
}

interface CsvRow {
  title: string;
  date: string;
}

function readCsv(filePath: string): CsvRow[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  // 去除 BOM
  const content = raw.replace(/^﻿/, '');
  const lines = content.split('\n').filter((line) => line.trim());

  if (lines.length < 2) {
    console.error('CSV 文件为空或只有表头');
    process.exit(1);
  }

  // 跳过表头
  const rows: CsvRow[] = [];
  const skipped: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parsed = parseCsvLine(lines[i]);
    if (parsed) {
      rows.push(parsed);
    } else {
      skipped.push(`[行${i + 1}] ${lines[i].slice(0, 60)}...`);
    }
  }

  if (skipped.length > 0) {
    console.warn(`⚠ 跳过 ${skipped.length} 条无日期或格式异常的行:`);
    for (const s of skipped) {
      console.warn(`  ${s}`);
    }
    console.warn('');
  }

  return rows;
}

/**
 * 简易 CSV 行解析
 * title 可能含逗号且未被引号包裹，所以从右侧匹配日期模式来定位分界
 */
function parseCsvLine(line: string): CsvRow | null {
  // 尝试引号包裹格式：行首有 " 且后面存在 ", 后跟日期
  if (line.startsWith('"')) {
    const endQuote = line.indexOf('",');
    if (endQuote !== -1) {
      const dateRaw = line.slice(endQuote + 2);
      const date = parseChineseDate(dateRaw);
      if (date) {
        const title = line.slice(1, endQuote).replace(/""/g, '"');
        return { title, date };
      }
    }
    // 引号解析失败，继续走日期匹配
  }

  // 从右边找日期，其余为 title
  const dateMatch = line.match(/(\d{4}年\d{1,2}月\d{1,2}日)/);
  if (!dateMatch || dateMatch.index === undefined) return null;
  const date = parseChineseDate(dateMatch[1]);
  if (!date) return null;
  const title = line.slice(0, dateMatch.index - 1).trim(); // -1 去掉日期前的逗号
  return { title, date };
}

async function createPage(row: CsvRow, index: number, total: number) {
  try {
    await notion.pages.create({
      parent: { database_id: DATABASE_ID! },
      properties: {
        title: {
          title: [{ text: { content: row.title } }],
        },
        date: {
          date: { start: row.date },
        },
        status: {
          select: { name: 'published' },
        },
        from: {
          select: { name: '快捷指令' },
        },
      },
    });
    console.log(`[${index + 1}/${total}] ✓ ${row.title.slice(0, 30)}...`);
  } catch (error: any) {
    console.error(
      `[${index + 1}/${total}] ✗ 失败: ${row.title.slice(0, 30)}... — ${error.message}`,
    );
    throw error; // 遇到错误停止，避免静默丢数据
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  if (!DATABASE_ID) {
    console.error('错误: NOTION_WORDS_DATABASE_ID 未在 .env 中设置');
    process.exit(1);
  }

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`错误: CSV 文件不存在: ${CSV_PATH}`);
    process.exit(1);
  }

  const rows = readCsv(CSV_PATH);
  console.log(`解析到 ${rows.length} 条记录\n`);

  if (rows.length === 0) {
    console.log('没有需要导入的数据');
    return;
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    try {
      await createPage(rows[i], i, rows.length);
      success++;
    } catch {
      failed++;
      console.error(`\n导入中断: ${success} 成功, ${failed} 失败`);
      console.error('请检查错误后重新运行（已导入的会重复，需手动清理）');
      process.exit(1);
    }
    await sleep(DELAY_MS);
  }

  console.log(`\n完成: ${success} 条成功导入`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
