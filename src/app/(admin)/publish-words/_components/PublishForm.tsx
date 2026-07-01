'use client';

import { useState } from 'react';

const SECRET_KEY = 'publish_secret';

function loadSecret(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(SECRET_KEY) || '';
}

export default function PublishForm({ allTags }: { allTags: string[] }) {
  const [secret, setSecret] = useState(loadSecret);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/words/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          text: text.trim(),
          tags: selectedTags,
          from: 'Web',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem(SECRET_KEY, secret);
        setResult({ ok: true, message: '发布成功 ✓' });
        setTitle('');
        setText('');
        setSelectedTags([]);
      } else {
        if (res.status === 401) localStorage.removeItem(SECRET_KEY);
        setResult({ ok: false, message: data.error || '发布失败' });
      }
    } catch {
      setResult({ ok: false, message: '网络错误' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-xl font-bold mb-6">发布说说</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="secret" className="block text-sm font-medium mb-1">
            密钥
          </label>
          <input
            id="secret"
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm"
            placeholder="PUBLISH_SECRET"
            required
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            标题
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm"
            placeholder="说说标题"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            正文
          </label>
          <textarea
            id="content"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm min-h-[120px]"
            placeholder="正文内容…（可为空）"
          />
        </div>

        <div>
          <span className="block text-sm font-medium mb-2">标签</span>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    active
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-secondary hover:bg-border'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {loading ? '发布中…' : '发布'}
        </button>
      </form>

      {result && (
        <p
          className={`mt-4 text-sm text-center ${
            result.ok ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
