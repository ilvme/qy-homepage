import fs from 'fs';
import path from 'path';

const CSV_PATH = path.join(__dirname, 'old-words.csv');
const OUTPUT_PATH = path.join(__dirname, 'old-words-cleaned.csv');
const REMOVED_PATH = path.join(__dirname, 'old-words-removed.csv');

/**
 * 解析日期用于排序比较，如 "2026年6月17日 10:36 (UTC)" → "2026-06-17T10:36:00"
 */
function parseChineseDate(raw: string): string | null {
  const match = raw.match(/(\d{4})年(\d{1,2})月(\d{1,2})日(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!match) return null;
  const [, year, month, day, hour, min] = match;
  const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const time = hour ? `${hour.padStart(2, '0')}:${min}:00` : '00:00:00';
  return `${date}T${time}`;
}

function parseCsvLine(line: string): { title: string; date: string; raw: string } | null {
  if (line.startsWith('"')) {
    const endQuote = line.indexOf('",');
    if (endQuote !== -1) {
      const dateRaw = line.slice(endQuote + 2);
      const date = parseChineseDate(dateRaw);
      if (date) {
        const title = line.slice(1, endQuote).replace(/""/g, '"');
        return { title, date, raw: line };
      }
    }
  }

  const dateMatch = line.match(/(\d{4}年\d{1,2}月\d{1,2}日)/);
  if (!dateMatch || dateMatch.index === undefined) return null;
  const dateRaw = line.slice(dateMatch.index).trim();
  const date = parseChineseDate(dateRaw);
  if (!date) return null;
  const title = line.slice(0, dateMatch.index - 1).trim();
  return { title, date, raw: line };
}

function main() {
  const raw = fs.readFileSync(CSV_PATH, 'utf-8');
  const content = raw.replace(/^﻿/, '');
  const lines = content.split('\n').filter((l) => l.trim());
  const header = lines[0];

  const parsed: { title: string; date: string; raw: string }[] = [];
  const skipped: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const p = parseCsvLine(lines[i]);
    if (!p) {
      skipped.push(`[行${i + 1}] 解析失败`);
      continue;
    }
    parsed.push(p);
  }

  const beforeLen = parsed.length;
  const removed: typeof parsed = [];

  // 1. 过滤 title 不足 12 字
  const longEnough = parsed.filter((p) => {
    if (p.title.length < 12) {
      removed.push(p);
      return false;
    }
    return true;
  });
  console.log(`过滤 title 不足 12 字: -${beforeLen - longEnough.length} 条`);

  // 2. 去重：相同 title 保留 date 最新的
  const seen = new Map<string, typeof parsed[0]>();
  for (const p of longEnough) {
    const existing = seen.get(p.title);
    if (!existing || p.date > existing.date) {
      if (existing) removed.push(existing); // 被替换的旧记录加入 removed
      seen.set(p.title, p);
    } else {
      removed.push(p); // 当前记录更旧，丢弃
    }
  }

  const dupes = longEnough.length - seen.size;
  console.log(`去除重复 title: -${dupes} 条 (保留 date 最新的)`);

  // 输出清理后的文件
  const output = [header, ...Array.from(seen.values()).map((p) => p.raw)].join('\n') + '\n';
  fs.writeFileSync(OUTPUT_PATH, output, 'utf-8');

  // 输出被移除的文件
  if (removed.length > 0) {
    const removedOutput = [header, ...removed.map((p) => p.raw)].join('\n') + '\n';
    fs.writeFileSync(REMOVED_PATH, removedOutput, 'utf-8');
    console.log(`\n被移除记录: ${removed.length} 条 → ${REMOVED_PATH}`);
  }

  console.log(`\n原始: ${beforeLen} 条`);
  console.log(`清理后: ${seen.size} 条`);
  console.log(`输出: ${OUTPUT_PATH}`);
}

main();
