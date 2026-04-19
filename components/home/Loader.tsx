'use client';

import { useEffect, useRef, useState } from 'react';

interface LoaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
  maxDurationMs?: number;
}

export default function Loader({
  onComplete,
  minDurationMs = 1200,
  maxDurationMs = 8000,
}: LoaderProps) {
  const [progress, setProgress] = useState<number>(0);
  const [hidden, setHidden] = useState<boolean>(false);

  const completedRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    startTimeRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const completeOnce = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setHidden(true);
      if (onComplete) {
        onCompleteTimeoutRef.current = setTimeout(() => {
          onComplete();
        }, 850);
      }
    };

    const scheduleHide = () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const elapsed = now - startTimeRef.current;
      const remaining = Math.max(0, minDurationMs - elapsed);

      hideTimeoutRef.current = setTimeout(() => {
        completeOnce();
      }, remaining + 200);
    };

    const markLoaded = () => {
      if (completedRef.current) return;
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
      scheduleHide();
    };

    intervalRef.current = setInterval(() => {
      setProgress((prev: number) => {
        if (prev >= 95) return 95;
        const next = prev + Math.random() * 12;
        return Math.min(95, next);
      });
    }, 80);

    const maxTimeout = setTimeout(() => {
      markLoaded();
    }, maxDurationMs);

    if (document.readyState === 'complete') {
      markLoaded();
    } else {
      window.addEventListener('load', markLoaded, { once: true });
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (onCompleteTimeoutRef.current) clearTimeout(onCompleteTimeoutRef.current);
      clearTimeout(maxTimeout);
      window.removeEventListener('load', markLoaded);
    };
  }, [maxDurationMs, minDurationMs, onComplete]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 bg-[#FBF9F5] z-[10000] flex flex-col items-center justify-center transition-[opacity,visibility] duration-[800ms] ${
        hidden ? 'opacity-0 invisible' : 'opacity-100 visible'
      }`}
    >
      <div className="w-[60px] h-[60px] mb-9 animate-[rotateDiamond_3s_linear_infinite]">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <polygon points="30,5 50,20 45,50 15,50 10,20" stroke="#B8922A" strokeWidth="1" fill="none" />
          <polygon points="30,15 42,22 38,42 22,42 18,22" stroke="#B8922A" strokeWidth="0.6" fill="rgba(184,146,42,0.08)" />
          <line x1="30" y1="5" x2="15" y2="50" stroke="#B8922A" strokeWidth="0.4" opacity=".5" />
          <line x1="30" y1="5" x2="45" y2="50" stroke="#B8922A" strokeWidth="0.4" opacity=".5" />
          <line x1="10" y1="20" x2="50" y2="20" stroke="#B8922A" strokeWidth="0.4" opacity=".5" />
        </svg>
      </div>

      <div className="font-serif text-2xl font-normal tracking-[0.45em] uppercase text-[#B8922A] mb-3.5 opacity-0 animate-[fadeUp_0.8s_0.3s_ease_forwards]">
        House of Diams
      </div>

      <div className="text-[9px] font-light tracking-[0.35em] text-[#7A7060] uppercase opacity-0 animate-[fadeUp_0.8s_0.6s_ease_forwards]">
        Crafted in Light
      </div>

      <div className="w-[140px] h-px bg-[#E3D9C4] mt-8 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-[#B8922A]"
          style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
        />
      </div>
    </div>
  );
}
