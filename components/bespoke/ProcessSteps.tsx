'use client';

import { useEffect, useRef } from 'react';

const steps = [
  {
    num: '01',
    eyebrow: 'Step 01',
    title: 'Consult',
    desc: 'Share your vision, reference images and requirements via WhatsApp or our form. We respond within 24 hours.',
  },
  {
    num: '02',
    eyebrow: 'Step 02',
    title: 'Design',
    desc: 'Our artisans prepare a detailed CAD rendering and stone selection for your approval before any work begins.',
  },
  {
    num: '03',
    eyebrow: 'Step 03',
    title: 'Craft',
    desc: "Hand-set by Surat's finest craftsmen using your chosen metal, stone and specification. Quality checked at every stage.",
  },
  {
    num: '04',
    eyebrow: 'Step 04',
    title: 'Deliver',
    desc: 'Insured, tracked worldwide delivery with certificate of authenticity, stone grading report and care guide.',
  },
];

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
  return (
    <section className="py-[90px] px-[52px] max-w-[1400px] mx-auto grid grid-cols-4 gap-[30px] max-lg:grid-cols-2 max-md:grid-cols-1 max-lg:px-7 max-md:px-5 max-md:py-[60px]">
      {steps.map((step, i) => (
        <RevealDiv key={step.num} delay={i * 100}>
          <div className="bg-white px-8 py-11 border border-[rgba(20,18,13,0.10)] relative transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:-translate-y-1.5 hover:border-[rgba(184,146,42,0.25)] hover:shadow-[0_24px_60px_rgba(20,18,13,0.12)] h-full">
            {/* Large faded number */}
          <div className="absolute top-[18px] right-[26px] font-serif text-[64px] font-light text-[#B8922A] opacity-20 leading-[1] not-italic select-none pointer-events-none">
            {step.num}
          </div>

            {/* Step eyebrow */}
            <div className="text-[9px] font-normal tracking-[0.3em] text-[#B8922A] uppercase mb-3.5">
              {step.eyebrow}
            </div>

            {/* Title */}
            <div className="font-serif text-[28px] font-normal text-[#14120D] mb-3.5 tracking-[0.02em]">
              {step.title}
            </div>

            {/* Description */}
            <p className="text-[12px] font-light leading-[1.9] text-[#7A7060] tracking-[0.02em]">
              {step.desc}
            </p>
          </div>
        </RevealDiv>
      ))}
    </section>
  );
}
