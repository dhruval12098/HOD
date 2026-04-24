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
      (entries) => {
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

interface BespokeHeroProps {
  onEnquireClick?: () => void;
}

type HeroContent = {
  badge_text?: string | null;
  eyebrow?: string | null;
  heading_line_1?: string | null;
  heading_line_2?: string | null;
  subtitle?: string | null;
  primary_cta_label?: string | null;
  secondary_cta_label?: string | null;
  secondary_cta_action?: string | null;
};

const fallbackHero: Required<HeroContent> = {
  badge_text: 'Est. 2014 · Surat, India',
  eyebrow: 'Bespoke Atelier',
  heading_line_1: 'Your Vision.',
  heading_line_2: 'Our Craft.',
  subtitle:
    "Every piece at House of Diams is conceived and created to order in natural or CVD diamonds. Share your idea and we'll bring it to life from our Surat workshops to your hands.",
  primary_cta_label: 'Start Your Commission',
  secondary_cta_label: 'Configure Your Piece',
  secondary_cta_action: '#bespoke-form',
};

export default function BespokeHero({ onEnquireClick }: BespokeHeroProps) {
  const [hero, setHero] = useState<Required<HeroContent>>(fallbackHero);
  const secondaryHref = hero.secondary_cta_action || '#bespoke-form';

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch('/api/public/bespoke/hero', { cache: 'no-store' });
        const payload = await response.json();
        if (!active || !payload?.item) return;
        setHero({
          badge_text: payload.item.badge_text ?? fallbackHero.badge_text,
          eyebrow: payload.item.eyebrow ?? fallbackHero.eyebrow,
          heading_line_1: payload.item.heading_line_1 ?? fallbackHero.heading_line_1,
          heading_line_2: payload.item.heading_line_2 ?? fallbackHero.heading_line_2,
          subtitle: payload.item.subtitle ?? fallbackHero.subtitle,
          primary_cta_label: payload.item.primary_cta_label ?? fallbackHero.primary_cta_label,
          secondary_cta_label: payload.item.secondary_cta_label ?? fallbackHero.secondary_cta_label,
          secondary_cta_action: payload.item.secondary_cta_action ?? fallbackHero.secondary_cta_action,
        });
      } catch {
        if (active) setHero(fallbackHero);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      className="pt-[100px] pb-[80px] px-[52px] text-center relative max-lg:px-7 max-md:px-5 max-md:pt-[70px] max-md:pb-[60px]"
      style={{
        background: 'linear-gradient(180deg, #FAFBFD 0%, #FAF7F2 100%)',
      }}
    >
      <RevealDiv className="flex justify-center">
        <div className="inline-flex items-center gap-2.5 px-[18px] py-[7px] text-[10px] font-normal tracking-[0.3em] text-[#0A1628] bg-[#F5F7FC] border border-[rgba(10,22,40,0.25)] uppercase mb-6 before:content-[''] before:w-[5px] before:h-[5px] before:bg-[#0A1628] before:rounded-full">
          {hero.badge_text}
        </div>
      </RevealDiv>

      <RevealDiv delay={50} className="flex justify-center">
        <div className="text-[10px] font-normal tracking-[0.32em] text-[#0A1628] uppercase mb-[18px] inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#0A1628]">
          {hero.eyebrow}
        </div>
      </RevealDiv>

      <RevealDiv delay={100}>
        <h1
          className="font-serif font-light leading-[1] tracking-[-0.01em] text-[#0A1628] mt-6 mb-7 mx-auto max-w-[900px]"
          style={{ fontSize: 'clamp(56px, 7vw, 108px)' }}
        >
          {hero.heading_line_1}
          <br />
          <em className="not-italic text-[#0A1628] font-normal">{hero.heading_line_2}</em>
        </h1>
      </RevealDiv>

      <RevealDiv delay={200}>
        <p className="text-[13px] font-light leading-[2] text-[#6A6A6A] tracking-[0.06em] max-w-[640px] mx-auto mb-10">
          {hero.subtitle}
        </p>
      </RevealDiv>

      <RevealDiv delay={300}>
        <div className="flex gap-[18px] justify-center flex-wrap max-md:flex-col max-md:w-full max-md:items-stretch">
          <button
            onClick={onEnquireClick}
            className="inline-flex items-center justify-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#FAFBFD] bg-[#0A1628] px-[34px] py-4 border-none cursor-pointer uppercase relative overflow-hidden group transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(10,22,40,0.18)]"
          >
            <span
              className="absolute inset-0 bg-[#0A1628] z-0 translate-y-full group-hover:translate-y-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.77,0,0.18,1)]"
            />
            <span className="relative z-10">{hero.primary_cta_label}</span>
          </button>
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#0A1628] bg-transparent px-8 py-[15px] border border-[#0A1628] cursor-pointer uppercase no-underline transition-all duration-400 hover:bg-[#0A1628] hover:text-[#FAFBFD]"
          >
            {hero.secondary_cta_label}
          </Link>
        </div>
      </RevealDiv>
    </section>
  );
}
