'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from '@/components/icons';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="回到顶部"
      className="fixed bottom-28 z-40 w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-secondary hover:text-foreground transition-colors"
      style={{ left: 'min(calc(50% + 416px), calc(100vw - 3rem))' }}
    >
      <ArrowUp size={18} />
    </button>
  );
}
