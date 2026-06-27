'use client';

import { useState } from 'react';

export function DeployButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleDeploy = async () => {
    const secret = localStorage.getItem('publish_secret');
    if (!secret) {
      setResult('未找到密钥，请先去发布说说页面输入一次');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (res.ok) {
        setResult('部署已触发，约 90 秒后上线');
      } else {
        const data = await res.json();
        setResult(data.error || '触发失败');
      }
    } catch {
      setResult('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border rounded-lg px-5 py-4 bg-card">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">更新网站</span>
          <span className="text-sm text-secondary block mt-0.5">
            从 Notion 拉取最新文章后重新部署
          </span>
        </div>
        <button
          type="button"
          onClick={handleDeploy}
          disabled={loading}
          className="shrink-0 ml-4 px-4 py-1.5 rounded-md bg-foreground text-background text-sm font-medium disabled:opacity-30 transition-opacity"
        >
          {loading ? '触发中...' : '更新'}
        </button>
      </div>
      {result && (
        <p className="text-sm text-secondary mt-3 border-t border-border pt-3">
          {result}
        </p>
      )}
    </div>
  );
}
