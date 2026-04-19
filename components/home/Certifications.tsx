'use client';

import { useEffect, useRef } from 'react';

const certs = [
  {
    title: 'IGI Certified',
    desc: 'Every diamond graded by the International Gemological Institute — the world\'s leading independent gem lab.',
    badge: 'International Standard',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <polygon points="14,3 22,7 22,21 14,25 6,21 6,7" stroke="#B8922A" strokeWidth="1" />
        <path d="M10 14L13 17L18 11" stroke="#B8922A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'GIA Graded',
    desc: 'Gemological Institute of America grading on request. Full 4Cs documentation — Cut, Colour, Clarity, Carat.',
    badge: 'Global Authority',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="9" stroke="#B8922A" strokeWidth="1" />
        <path d="M14 8L16 11.5L20 12.5L17.5 15L18 19L14 17L10 19L10.5 15L8 12.5L12 11.5Z" stroke="#B8922A" strokeWidth=".8" />
      </svg>
    ),
  },
  {
    title: 'Conflict Free',
    desc: 'Our CVD stones are lab-grown with zero conflict. Our natural diamonds are ethically sourced, Kimberley-compliant, with full mine-to-market traceability.',
    badge: 'Kimberley Compliant',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4L22 8V16C22 20 18 23.5 14 25C10 23.5 6 20 6 16V8L14 4Z" stroke="#B8922A" strokeWidth="1" />
        <path d="M10 14L13 17L18 11" stroke="#B8922A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Luxury Packaging',
    desc: 'Every piece arrives in our signature presentation box with ribbon, polishing cloth, certificate and care card.',
    badge: 'Signature Presentation',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="8" width="20" height="15" rx="2" stroke="#B8922A" strokeWidth="1" />
        <rect x="8" y="5" width="4" height="6" rx="1" stroke="#B8922A" strokeWidth=".8" />
        <rect x="16" y="5" width="4" height="6" rx="1" stroke="#B8922A" strokeWidth=".8" />
      </svg>
    ),
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

export default function Certifications() {
  return (
    <section className="py-[110px] px-[52px] max-w-[1400px] mx-auto text-center max-lg:px-7 max-md:px-5 max-md:py-[70px]">
      {/* Header */}
      <RevealDiv className="flex justify-center">
        <div className="text-[10px] font-normal tracking-[0.32em] text-[#B8922A] uppercase mb-[18px] inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#B8922A]">
          Our Promise
        </div>
      </RevealDiv>
      <RevealDiv delay={100}>
        <h2
          className="font-serif font-light tracking-[0.02em] text-[#14120D] leading-[1.05]"
          style={{ fontSize: 'clamp(40px, 5.5vw, 72px)' }}
        >
          Why Choose <em className="not-italic text-[#B8922A] font-normal">House of Diams</em>
        </h2>
      </RevealDiv>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-6 mt-16 max-lg:grid-cols-2 max-md:grid-cols-2 max-sm:grid-cols-1">
        {certs.map((cert, i) => (
          <RevealDiv key={cert.title} delay={i * 100}>
            <div className="bg-white p-10 border border-[rgba(20,18,13,0.10)] text-center transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:-translate-y-1.5 hover:border-[rgba(184,146,42,0.25)] hover:shadow-[0_24px_60px_rgba(20,18,13,0.12)] h-full flex flex-col items-center">
              {/* Icon circle */}
              <div className="w-16 h-16 flex items-center justify-center bg-[#F5EDD6] border border-[rgba(184,146,42,0.25)] rounded-full mb-[22px] mx-auto">
                {cert.icon}
              </div>

              {/* Title */}
              <div className="font-serif text-[22px] font-normal text-[#14120D] mb-3 tracking-[0.02em]">
                {cert.title}
              </div>

              {/* Desc */}
              <p className="text-[11px] font-light leading-[1.8] text-[#7A7060] tracking-[0.02em] mb-[18px] flex-1">
                {cert.desc}
              </p>

              {/* Badge */}
              <div className="inline-block px-3 py-[5px] text-[8px] font-medium tracking-[0.26em] text-[#8A6A10] bg-[#F5EDD6] border border-[rgba(184,146,42,0.25)] uppercase">
                {cert.badge}
              </div>
            </div>
          </RevealDiv>
        ))}
      </div>
    </section>
  );
}
