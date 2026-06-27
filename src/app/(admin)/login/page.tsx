'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

function LoginForm() {
  const searchParams = useSearchParams();
  const saved = useRef(typeof window !== 'undefined' ? localStorage.getItem('manage_password') : null);
  const [password, setPassword] = useState(saved.current ?? '');
  const [error, setError] = useState(searchParams.get('error') === '1');

  const doLogin = (pwd: string) => {
    document.cookie = `manage_token=${pwd}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    localStorage.setItem('manage_password', pwd);
    const redirect = searchParams.get('redirect') || '/manage';
    window.location.href = redirect;
  };

  // 已记住密码且不是密码错误回退 → 自动提交
  useEffect(() => {
    if (saved.current && searchParams.get('error') !== '1') {
      doLogin(saved.current);
    }
    // 密码错误回退时，清除记住的错误密码
    if (searchParams.get('error') === '1') {
      localStorage.removeItem('manage_password');
      setPassword('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(password);
  };

  return (
    <div className="py-16 max-w-sm mx-auto text-center">
      <h1 className="text-2xl font-bold mb-6">🔒</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="口令"
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-center"
          autoFocus
        />
        <button
          type="submit"
          disabled={!password}
          className="w-full py-2 rounded-md bg-foreground text-background text-sm font-medium disabled:opacity-30"
        >
          进入
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mt-4">口令错误</p>}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
