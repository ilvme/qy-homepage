'use client';

import { useEffect, useState } from 'react';

interface TypewriterProps {
  text: string;
  /** 每个字符的间隔时间（ms） */
  speed?: number;
  /** 开始前的延迟（ms） */
  delay?: number;
  className?: string;
}

export default function Typewriter({
  text,
  speed = 160,
  delay = 500,
  className,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState('');
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    setDisplayed('');

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, speed, delay]);

  // 光标闪烁
  useEffect(() => {
    const blink = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <span className={className}>
      {displayed}
      <span
        className="inline-block w-[0.4em] h-[0.08em] bg-current align-bottom mb-[0.15em] ml-[0.02em] transition-opacity duration-100"
        style={{ opacity: cursor ? 1 : 0 }}
      />
    </span>
  );
}
