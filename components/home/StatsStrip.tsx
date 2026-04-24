'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat {
  target: number;
  suffix: string;
  label: string;
}

interface StatsPayload {
  items?: Stat[];
}

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const start = performance.now();
          const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setValue(Math.floor(target * easeOut(progress)));
            if (progress < 1) requestAnimationFrame(tick);
            else setValue(target);
          };
          requestAnimationFrame(tick);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {value.toLocaleString('en-US')}
      <em className="text-[#20304A] not-italic">{suffix}</em>
    </span>
  );
}

export default function StatsStrip() {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await fetch('/api/public/stats', { cache: 'no-store' });
      const payload = (await response.json().catch(() => null)) as StatsPayload | null;
      if (!response.ok) return;
      setStats(payload?.items ?? []);
    };

    load();
  }, []);

  return (
    <section
      className="py-[100px] px-[52px] grid grid-cols-4 gap-10 text-center relative overflow-hidden max-lg:grid-cols-2 max-md:grid-cols-1 max-lg:px-7 max-md:px-5 max-md:py-[70px] bg-(--bg)"
      style={{
      }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 30%, rgba(10,22,40,0.15), transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(10,22,40,0.1), transparent 50%)',
        }}
      />

      {stats.map((stat) => (
        <div key={stat.label} className="relative z-10">
          <div
            className="font-numeric font-light text-[#FFFFFF] leading-[1] tracking-[0.01em] mb-3"
            style={{ fontSize: 'clamp(56px, 6vw, 88px)' }}
          >
            <CountUp target={stat.target} suffix={stat.suffix} />
          </div>
          <div className="text-[10px] font-normal tracking-[0.3em] text-[#D9E2EE] uppercase">
            {stat.label}
          </div>
        </div>
      ))}
    </section>
  );
}
