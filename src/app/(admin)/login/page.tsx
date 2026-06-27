'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function LoginForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(searchParams.get('error') === '1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    document.cookie = `manage_token=${password}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    const redirect = searchParams.get('redirect') || '/manage';
    window.location.href = redirect;
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
