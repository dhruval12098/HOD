'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

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

export default function ContactHero() {
  return (
    <section
      className="pt-[100px] pb-[60px] px-[52px] text-center max-lg:px-7 max-md:px-5 max-md:pt-[60px] max-md:pb-10"
      style={{ background: 'linear-gradient(180deg, #FBF9F5 0%, #F6F2EA 100%)' }}
    >
      {/* Breadcrumb */}
      <RevealDiv className="flex justify-center mb-5">
        <div className="text-[9px] tracking-[0.3em] uppercase text-[#7A7060]">
          <Link
            href="/"
            className="text-[#7A7060] no-underline hover:text-[#B8922A] transition-colors duration-300"
          >
            Home
          </Link>
          <span className="mx-2.5 text-[#B0A898]">/</span>
          <span className="text-[#14120D]">Contact</span>
        </div>
      </RevealDiv>

      {/* Eyebrow */}
      <RevealDiv delay={50} className="flex justify-center">
        <div className="text-[10px] font-normal tracking-[0.32em] text-[#B8922A] uppercase mb-[18px] inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#B8922A]">
          Get In Touch
        </div>
      </RevealDiv>

      {/* Headline */}
      <RevealDiv delay={100}>
        <h1
          className="font-serif font-light leading-[1] tracking-[-0.01em] text-[#14120D] mt-6 mb-7 mx-auto max-w-[900px]"
          style={{ fontSize: 'clamp(56px, 7vw, 108px)' }}
        >
          Let&apos;s <em className="not-italic text-[#B8922A] font-normal">Talk</em>.
        </h1>
      </RevealDiv>

      {/* Subtitle */}
      <RevealDiv delay={200}>
        <p className="text-[13px] font-light leading-[2] text-[#7A7060] tracking-[0.06em] max-w-[640px] mx-auto">
          Questions about a piece, a custom order, or B2B wholesale? Reach out — we reply within
          24 hours.
        </p>
      </RevealDiv>
    </section>
  );
}
