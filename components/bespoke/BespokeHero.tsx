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

interface BespokeHeroProps {
  onEnquireClick?: () => void;
}

export default function BespokeHero({ onEnquireClick }: BespokeHeroProps) {
  return (
    <section
      className="pt-[100px] pb-[80px] px-[52px] text-center relative max-lg:px-7 max-md:px-5 max-md:pt-[70px] max-md:pb-[60px]"
      style={{
        background: 'linear-gradient(180deg, #FBF9F5 0%, #F6F2EA 100%)',
      }}
    >
      {/* Badge pill */}
      <RevealDiv className="flex justify-center">
        <div className="inline-flex items-center gap-2.5 px-[18px] py-[7px] text-[10px] font-normal tracking-[0.3em] text-[#B8922A] bg-[#F5EDD6] border border-[rgba(184,146,42,0.25)] uppercase mb-6 before:content-[''] before:w-[5px] before:h-[5px] before:bg-[#B8922A] before:rounded-full">
          Est. 2014 · Surat, India
        </div>
      </RevealDiv>

      {/* Eyebrow */}
      <RevealDiv delay={50} className="flex justify-center">
        <div className="text-[10px] font-normal tracking-[0.32em] text-[#B8922A] uppercase mb-[18px] inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#B8922A]">
          Bespoke Atelier
        </div>
      </RevealDiv>

      {/* Headline */}
      <RevealDiv delay={100}>
        <h1
          className="font-serif font-light leading-[1] tracking-[-0.01em] text-[#14120D] mt-6 mb-7 mx-auto max-w-[900px]"
          style={{ fontSize: 'clamp(56px, 7vw, 108px)' }}
        >
          Your Vision.
          <br />
          <em className="not-italic text-[#B8922A] font-normal">Our Craft.</em>
        </h1>
      </RevealDiv>

      {/* Subtitle */}
      <RevealDiv delay={200}>
        <p className="text-[13px] font-light leading-[2] text-[#7A7060] tracking-[0.06em] max-w-[640px] mx-auto mb-10">
          Every piece at House of Diams is conceived and created to order — in natural or CVD
          diamonds. Share your idea and we'll bring it to life from our Surat workshops to your
          hands.
        </p>
      </RevealDiv>

      {/* CTAs */}
      <RevealDiv delay={300}>
        <div className="flex gap-[18px] justify-center flex-wrap max-md:flex-col max-md:w-full max-md:items-stretch">
          <button
            onClick={onEnquireClick}
            className="inline-flex items-center justify-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#FBF9F5] bg-[#14120D] px-[34px] py-4 border-none cursor-pointer uppercase relative overflow-hidden group transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(184,146,42,0.18)]"
          >
            <span
              className="absolute inset-0 bg-[#B8922A] z-0 translate-y-full group-hover:translate-y-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.77,0,0.18,1)]"
            />
            <span className="relative z-10">Start Your Commission</span>
          </button>
          <Link
            href="#bespoke-form"
            className="inline-flex items-center justify-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#14120D] bg-transparent px-8 py-[15px] border border-[#14120D] cursor-pointer uppercase no-underline transition-all duration-400 hover:bg-[#14120D] hover:text-[#FBF9F5]"
          >
            Configure Your Piece
          </Link>
        </div>
      </RevealDiv>
    </section>
  );
}
