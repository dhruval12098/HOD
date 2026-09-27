'use client';

import { useEffect, useRef, useState } from 'react';

function RevealDiv({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          entries[0].target.classList.add('opacity-100', 'translate-y-0');
          entries[0].target.classList.remove('opacity-0', 'translate-y-6');
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px' }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-6 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function ProcessSteps({ initialItems = [] }: { initialItems?: { id?: number; sort_order: number; eyebrow: string; title: string; description: string }[] }) {
  const [items, setItems] = useState<{ id?: number; sort_order: number; eyebrow: string; title: string; description: string }[]>(initialItems);

  useEffect(() => {
    if (initialItems.length) return;
    let active = true;
    (async () => {
      try {
        const response = await fetch('/api/public/bespoke/process');
        const payload = await response.json();
        if (!active) return;
        setItems(Array.isArray(payload?.items) ? payload.items : []);
      } catch {
        if (active) setItems([]);
      }
    })();
    return () => { active = false; };
  }, [initialItems]);

  if (!items.length) return null;

  return (
    <section className="section-rhythm border-t border-black/10 bg-white">
      <div className="mb-6 px-4 sm:px-7 lg:px-[50px]">
        <p className="mb-3 font-[family-name:var(--font-family-primary)] text-[11px] font-medium uppercase tracking-[0.1em] text-black/60">The Atelier</p>
        <h2 className="section-title text-left text-[clamp(1.35rem,2.2vw,2rem)] font-medium uppercase leading-none tracking-[0.025em] text-[var(--color-brand-primary,#000)]">How Bespoke Works</h2>
      </div>
      <div className="grid grid-cols-2 gap-[13px] px-4 sm:px-7 md:grid-cols-4 lg:px-[50px]">
      {items.map((step, i) => (
        <RevealDiv key={step.id ?? step.sort_order} delay={i * 100}>
          <div className="h-full border border-black/10 bg-white px-5 py-6 transition-colors duration-300 hover:border-black/30 sm:px-6 sm:py-7">
            <div className="mb-3.5 text-[9px] font-normal uppercase tracking-[0.3em] text-black">
              {step.eyebrow}
            </div>
            <div className="mb-3.5 font-[family-name:var(--font-family-primary)] text-[15px] font-semibold uppercase leading-[1.35] tracking-[0.06em] text-black">
              {step.title}
            </div>
            <p className="font-[family-name:var(--font-family-secondary)] text-[12px] leading-[1.7] text-black/60">
              {step.description}
            </p>
          </div>
        </RevealDiv>
      ))}
      </div>
    </section>
  );
}
