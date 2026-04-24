'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';

interface LoaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
  maxDurationMs?: number;
  mode?: 'overlay' | 'screen'
  ready?: boolean
}

const LOADER_COPY = 'Welcome to House of Diams';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

export default function Loader({
  onComplete,
  minDurationMs = 1200,
  maxDurationMs = 8000,
  mode = 'overlay',
  ready = true,
}: LoaderProps) {
  const [progress, setProgress] = useState<number>(0);
  const [hidden, setHidden] = useState<boolean>(false);

  const completedRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shellClasses = useMemo(
    () =>
      mode === 'screen'
        ? 'relative min-h-screen'
        : 'fixed inset-0 z-[10000]',
    [mode]
  );

  useEffect(() => {
    startTimeRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const completeOnce = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setHidden(true);
      if (onComplete) {
        onCompleteTimeoutRef.current = setTimeout(() => {
          onComplete();
        }, 700);
      }
    };

    const scheduleHide = () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const elapsed = now - startTimeRef.current;
      const remaining = Math.max(0, minDurationMs - elapsed);

      hideTimeoutRef.current = setTimeout(() => {
        completeOnce();
      }, remaining + 120);
    };

    const markLoaded = () => {
      if (completedRef.current) return;
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
      scheduleHide();
    };

    intervalRef.current = setInterval(() => {
      setProgress((prev: number) => {
        if (prev >= 94) return 94;
        const next = prev + Math.random() * 10;
        return Math.min(94, next);
      });
    }, 90);

    const maxTimeout = setTimeout(() => {
      markLoaded();
    }, maxDurationMs);

    if (mode === 'overlay' && ready) {
      if (document.readyState === 'complete') {
        markLoaded();
      } else {
        window.addEventListener('load', markLoaded, { once: true });
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (onCompleteTimeoutRef.current) clearTimeout(onCompleteTimeoutRef.current);
      clearTimeout(maxTimeout);
      window.removeEventListener('load', markLoaded);
    };
  }, [maxDurationMs, minDurationMs, mode, onComplete, ready]);

  return (
    <div
      aria-hidden="true"
      className={`${shellClasses} flex items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#fbf7f0_0%,#ffffff_55%,#f5f7fb_100%)] transition-[opacity,visibility] duration-[700ms] ${
        hidden ? 'opacity-0 invisible' : 'opacity-100 visible'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-[-4%] top-[10%] h-56 w-56 rounded-full bg-[rgba(212,175,55,0.12)] blur-3xl" />
        <div className="absolute bottom-[5%] right-[-4%] h-64 w-64 rounded-full bg-[rgba(10,22,40,0.08)] blur-3xl" />
      </div>

      <div className={`relative flex w-full max-w-[780px] flex-col items-center px-6 text-center ${plusJakartaSans.className}`}>
        <div className="overflow-hidden">
          <div
            className="text-[clamp(2rem,5vw,4.2rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-[#0A1628]"
            style={{
              clipPath: hidden ? 'inset(0 0 100% 0)' : 'inset(0 0 0 0)',
              transition: 'clip-path 700ms cubic-bezier(0.77,0,0.18,1)',
            }}
          >
            {LOADER_COPY}
          </div>
        </div>

        <div className="mt-4 text-[10px] uppercase tracking-[0.34em] text-[#8b94a5]">
          Loading the collection
        </div>

        <div className="mt-8 h-px w-[180px] overflow-hidden bg-[#dde3ec] sm:w-[240px]">
          <div
            className="h-full bg-[#0A1628]"
            style={{ width: `${progress}%`, transition: 'width 60ms linear' }}
          />
        </div>
      </div>
    </div>
  );
}
