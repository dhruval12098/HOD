'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [content, setContent] = useState<{ eyebrow?: string; heading?: string; subtitle?: string } | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch('/api/public/contact/hero', { cache: 'no-store' });
        const payload = await response.json();
        if (!active) return;
        setContent(payload?.item ?? null);
      } catch {
        if (active) setContent(null);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const heading = content?.heading || "Let's Talk";
  const headingParts = heading.split(' ');
  const headingLead = headingParts.length > 1 ? headingParts[0] : "Let's";
  const headingAccent = headingParts.length > 1 ? headingParts.slice(1).join(' ') : 'Talk';

  return (
    <section
      className="pt-[100px] pb-[60px] px-[52px] text-center max-lg:px-7 max-md:px-5 max-md:pt-[60px] max-md:pb-10"
      style={{ background: 'linear-gradient(180deg, #FAFBFD 0%, #FAF7F2 100%)' }}
    >
      <RevealDiv className="flex justify-center mb-5">
        <div className="text-[9px] tracking-[0.3em] uppercase text-[#6A6A6A]">
          <Link href="/" className="text-[#6A6A6A] no-underline hover:text-[#0A1628] transition-colors duration-300">
            Home
          </Link>
          <span className="mx-2.5 text-[#7F8898]">/</span>
          <span className="text-[#0A1628]">Contact</span>
        </div>
      </RevealDiv>

      <RevealDiv delay={50} className="flex justify-center">
        <div className="text-[10px] font-normal tracking-[0.32em] text-[#0A1628] uppercase mb-[18px] inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#0A1628]">
          {content?.eyebrow || 'Get In Touch'}
        </div>
      </RevealDiv>

      <RevealDiv delay={100}>
        <h1
          className="font-serif font-light leading-[1] tracking-[-0.01em] text-[#0A1628] mt-6 mb-7 mx-auto max-w-[900px]"
          style={{ fontSize: 'clamp(56px, 7vw, 108px)' }}
        >
          {headingLead}{' '}
          <em className="not-italic text-[#0A1628] font-normal">{headingAccent}</em>.
        </h1>
      </RevealDiv>

      <RevealDiv delay={200}>
        <p className="text-[13px] font-light leading-[2] text-[#6A6A6A] tracking-[0.06em] max-w-[640px] mx-auto">
          {content?.subtitle || 'Questions about a piece, a custom order, or B2B wholesale? Reach out - we reply within 24 hours.'}
        </p>
      </RevealDiv>
    </section>
  );
}
