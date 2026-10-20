/**
 * 搜索分词器：构建期索引与浏览器查询共用。
 *
 * 中文无空格分隔，MiniSearch 默认按空白/标点切分会导致
 * 「云南蜜月记」整体成一个 token，查询「蜜月」无法命中。
 * 方案：CJK 连续段 → 词典整词 + 全段 unigram + 全段 bigram。
 *
 * 关键：bigram 必须按「整个 CJK 连续段」展开而不是按分出的词展开。
 * Segmenter 词典覆盖有限（「博客」「建站」会被拆成两个单字），
 * 若只做词内展开，这类两字查询只剩 [博,客] 两个单字 token，
 * AND 语义退化为「两字分别出现即可」，不要求相邻。
 * 跨词边界的全段 bigram 保证任意相邻子串可命中
 * （搜「段简」能匹配「一段简单」，搜「博客」必须是相邻的「博客」）。
 * ASCII/数字整词小写后直入。
 */

const CJK_RUN = /[一-鿿]+/g;
const ASCII_WORD = /[a-z0-9]+/g;

let segmenter: Intl.Segmenter | null = null;
function getSegmenter(): Intl.Segmenter | null {
  if (typeof Intl === 'undefined' || !('Segmenter' in Intl)) return null;
  segmenter ??= new Intl.Segmenter('zh', { granularity: 'word' });
  return segmenter;
}

/** CJK 连续段 → 词数组（无 Segmenter 时整段兜底，unigram/bigram 仍可用） */
function segmentWords(run: string): string[] {
  const seg = getSegmenter();
  if (!seg) return [run];
  const words: string[] = [];
  for (const s of seg.segment(run)) {
    const w = s.segment.trim();
    if (w) words.push(w);
  }
  return words;
}

export function tokenize(input: string): string[] {
  if (!input) return [];
  const tokens = new Set<string>();

  for (const m of input.toLowerCase().matchAll(ASCII_WORD)) {
    tokens.add(m[0]);
  }

  for (const m of input.matchAll(CJK_RUN)) {
    const run = m[0];
    // 词典整词（≥2 字）：提升精确匹配得分
    for (const word of segmentWords(run)) {
      if (word.length > 1) tokens.add(word);
    }
    // 全段 unigram + 跨词边界 bigram：保证相邻子串可命中
    for (let i = 0; i < run.length; i++) {
      tokens.add(run[i]);
      if (i + 2 <= run.length) tokens.add(run.slice(i, i + 2));
    }
  }

  return [...tokens];
}
