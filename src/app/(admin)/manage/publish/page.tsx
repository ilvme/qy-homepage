'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const TAG_OPTIONS = [
  '万千思绪',
  '生活',
  '技术',
  '阅读',
  '思考',
  '日记',
  '摄影',
  '牢骚',
  '梦',
];

const FROM_OPTIONS = ['快捷指令', 'Web', 'Notion', '岁月时光机'];

export default function PublishPage() {
  const [secret, setSecret] = useState('');
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [from, setFrom] = useState('Web');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  // 记住密钥
  useEffect(() => {
    const saved = localStorage.getItem('publish_secret');
    if (saved) setSecret(saved);
  }, []);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    if (!secret.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      localStorage.setItem('publish_secret', secret);
      const res = await fetch('/api/words/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ text: text.trim(), tags, from }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, msg: '发布成功！约 90 秒后上线' });
        setText('');
        setTags([]);
      } else {
        setResult({ ok: false, msg: data.error || '发布失败' });
      }
    } catch {
      setResult({ ok: false, msg: '网络错误' });
    } finally {
      setLoading(false);
    }
  };

  // Ctrl+Enter 发布
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="py-8 max-w-xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">发布说说</h1>
        <p className="text-secondary text-sm mt-1">
          输入内容后 Ctrl+Enter 发布 ·{' '}
          <Link
            href="/manage"
            className="underline underline-offset-2 hover:text-foreground"
          >
            返回管理
          </Link>
        </p>
      </header>

      <div className="space-y-5">
        {/* 密钥 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">口令</label>
            <button
              type="button"
              onClick={() => {
                setSecret('');
                localStorage.removeItem('publish_secret');
              }}
              className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
            >
              清除
            </button>
          </div>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="输入 PUBLISH_SECRET"
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
          />
        </div>

        {/* 内容 */}
        <div>
          <label className="block text-sm font-medium mb-1">内容</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={6}
            placeholder="想说点什么..."
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-y"
          />
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium mb-1.5">标签</label>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  tags.includes(tag)
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-secondary border-border hover:border-foreground/30'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 来源 */}
        <div>
          <label className="block text-sm font-medium mb-1">来源</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background text-sm"
          >
            {FROM_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* 发布 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !text.trim() || !secret.trim()}
          className="w-full py-2.5 rounded-md bg-foreground text-background text-sm font-medium disabled:opacity-30 transition-opacity"
        >
          {loading ? '发布中...' : '发布'}
        </button>

        {/* 结果 */}
        {result && (
          <p
            className={`text-sm text-center ${
              result.ok ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {result.msg}
          </p>
        )}
      </div>
    </div>
  );
}
