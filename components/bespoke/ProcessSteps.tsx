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

export default function ProcessSteps() {
  const [items, setItems] = useState<{ id?: number; sort_order: number; eyebrow: string; title: string; description: string }[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch('/api/public/bespoke/process', { cache: 'no-store' });
        const payload = await response.json();
        if (!active) return;
        setItems(Array.isArray(payload?.items) ? payload.items : []);
      } catch {
        if (active) setItems([]);
      }
    })();
    return () => { active = false; };
  }, []);

  if (!items.length) return null;

  return (
    <section className="py-[90px] px-[52px] max-w-[1400px] mx-auto grid grid-cols-4 gap-[30px] max-lg:grid-cols-2 max-md:grid-cols-1 max-lg:px-7 max-md:px-5 max-md:py-[60px]">
      {items.map((step, i) => (
        <RevealDiv key={step.id ?? step.sort_order} delay={i * 100}>
          <div className="bg-white px-8 py-11 border border-[rgba(10,22,40,0.10)] relative transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:-translate-y-1.5 hover:border-[rgba(10,22,40,0.25)] hover:shadow-[0_24px_60px_rgba(10,22,40,0.12)] h-full">
            <div className="text-[9px] font-normal tracking-[0.3em] text-[#0A1628] uppercase mb-3.5">
              {step.eyebrow}
            </div>
            <div className="font-serif text-[28px] font-normal text-[#0A1628] mb-3.5 tracking-[0.02em]">
              {step.title}
            </div>
            <p className="text-[12px] font-light leading-[1.9] text-[#6A6A6A] tracking-[0.02em]">
              {step.description}
            </p>
          </div>
        </RevealDiv>
      ))}
    </section>
  );
}
