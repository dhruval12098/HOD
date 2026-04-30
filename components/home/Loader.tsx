'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { loaderWordmarkFont } from '@/app/fonts';

interface LoaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
  maxDurationMs?: number;
  mode?: 'overlay' | 'screen'
  ready?: boolean
}

const LOADER_COPY = 'House of Diams';

export default function Loader({
  onComplete,
  minDurationMs = 1200,
  maxDurationMs = 8000,
  mode = 'overlay',
  ready = true,
}: LoaderProps) {
  const [progress, setProgress] = useState<number>(0);
  const [hidden, setHidden] = useState<boolean>(false);
  const [introComplete, setIntroComplete] = useState<boolean>(false);

  const completedRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const shellClasses = useMemo(
    () =>
      mode === 'screen'
        ? 'relative min-h-screen'
        : 'fixed inset-0 z-[10000]',
    [mode]
  );

  useEffect(() => {
    if (!overlayRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(wordRefs.current, { autoAlpha: 0, y: 44 });
      gsap.to(wordRefs.current, {
        autoAlpha: 1,
        y: 0,
        duration: 0.72,
        stagger: 0.045,
        ease: 'power3.out',
        delay: 0.08,
        onComplete: () => {
          setIntroComplete(true);
        },
      });
    }, overlayRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    startTimeRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const completeOnce = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);

      if (overlayRef.current) {
        gsap.killTweensOf(wordRefs.current);
        gsap.killTweensOf(overlayRef.current);
        const timeline = gsap.timeline({
          onComplete: () => {
            setHidden(true);
            if (onComplete) {
              onComplete();
            }
          },
        });

        timeline
          .to(
            contentRef.current,
            {
              y: -18,
              duration: 0.42,
              ease: 'power2.inOut',
            },
            0
          )
          .to(wordRefs.current, {
            y: -28,
            autoAlpha: 0,
            duration: 0.38,
            stagger: 0.06,
            ease: 'power2.in',
          })
          .to(
            overlayRef.current,
            {
              yPercent: -100,
              duration: 0.72,
              ease: 'power4.inOut',
            },
            0.1
          );
      } else {
        setHidden(true);
        if (onComplete) onComplete();
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

    intervalRef.current = setInterval(() => {
      setProgress((prev: number) => {
        const cap = ready ? 100 : 92;
        if (prev >= cap) return cap;

        const remaining = cap - prev;
        const delta = ready
          ? Math.max(remaining * 0.34, 2.2)
          : Math.max(remaining * 0.12, 0.45);

        return Math.min(cap, prev + delta);
      });
    }, 90);

    const maxTimeout = ready
      ? setTimeout(() => {
          if (!completedRef.current) {
            setProgress(100);
            if (intervalRef.current) clearInterval(intervalRef.current);
            scheduleHide();
          }
        }, maxDurationMs)
      : null;

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (maxTimeout) clearTimeout(maxTimeout);
    };
  }, [maxDurationMs, minDurationMs, onComplete, ready]);

  useEffect(() => {
    if (!ready || !introComplete || completedRef.current) return;
    if (progress < 99) return;

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elapsed = now - startTimeRef.current;
    const remaining = Math.max(0, minDurationMs - elapsed);

    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (!completedRef.current) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setProgress(100);
        if (overlayRef.current) {
          gsap.delayedCall(0.12, () => {
            if (!completedRef.current) {
              const event = new CustomEvent('hod-loader-complete');
              window.dispatchEvent(event);
            }
          });
        }
      }
    }, remaining);

    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [introComplete, minDurationMs, progress, ready]);

  useEffect(() => {
    const handleForceComplete = () => {
      if (completedRef.current) return;
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);

      if (overlayRef.current) {
        gsap.killTweensOf(wordRefs.current);
        gsap.killTweensOf(overlayRef.current);
        const timeline = gsap.timeline({
          onComplete: () => {
            setHidden(true);
            onComplete?.();
          },
        });

        timeline
          .to(
            contentRef.current,
            {
              y: -18,
              duration: 0.42,
              ease: 'power2.inOut',
            },
            0
          )
          .to(wordRefs.current, {
            y: -28,
            autoAlpha: 0,
            duration: 0.38,
            stagger: 0.06,
            ease: 'power2.in',
          })
          .to(
            overlayRef.current,
            {
              yPercent: -100,
              duration: 0.72,
              ease: 'power4.inOut',
            },
            0.1
          );
      } else {
        setHidden(true);
        onComplete?.();
      }

      completedRef.current = true;
    };

    window.addEventListener('hod-loader-complete', handleForceComplete);
    return () => {
      window.removeEventListener('hod-loader-complete', handleForceComplete);
    };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className={`${shellClasses} flex items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#fbf7f0_0%,#ffffff_55%,#f5f7fb_100%)] ${
        hidden ? 'opacity-0 invisible' : 'opacity-100 visible'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-[-4%] top-[10%] h-56 w-56 rounded-full bg-[rgba(212,175,55,0.12)] blur-3xl" />
        <div className="absolute bottom-[5%] right-[-4%] h-64 w-64 rounded-full bg-[rgba(10,22,40,0.08)] blur-3xl" />
      </div>

      <div ref={contentRef} className="relative flex w-full max-w-[780px] flex-col items-center px-6 text-center">
        <div
          className={`flex items-center justify-center overflow-hidden whitespace-nowrap text-[clamp(2rem,5vw,4.8rem)] leading-[0.94] text-[#0A1628] ${loaderWordmarkFont.className}`}
          style={{
            fontKerning: 'normal',
            letterSpacing: '0.08em',
            textRendering: 'geometricPrecision',
          }}
        >
          {Array.from(LOADER_COPY).map((character, index) => (
            <span
              key={`${character}-${index}`}
              ref={(node) => {
                wordRefs.current[index] = node;
              }}
              className="inline-block uppercase"
              style={
                character === ' '
                  ? { width: '0.34em' }
                  : { marginRight: index === LOADER_COPY.length - 1 ? 0 : '0.01em' }
              }
            >
              {character === ' ' ? '\u00A0' : character}
            </span>
          ))}
        </div>

        <div className="mt-8 h-px w-[180px] overflow-hidden bg-[#dde3ec] sm:w-[240px]">
          <div
            className="h-full bg-[#0A1628]"
            style={{ width: `${progress}%`, transition: 'width 60ms linear' }}
          />
        </div>

        <div className="mt-4 text-[11px] uppercase tracking-[0.28em] text-[#8b94a5]">
          {Math.max(1, Math.round(progress))}%
        </div>
      </div>
    </div>
  );
}
