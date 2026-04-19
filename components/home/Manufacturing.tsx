'use client';

import { useEffect, useRef } from 'react';

interface Step {
  num: string;
  title: string;
  body: string;
  alt?: boolean;
  icon: React.ReactNode;
  sparks?: { top: string; left?: string; right?: string; delay?: string }[];
}

const steps: Step[] = [
  {
    num: 'Step 01',
    title: 'Stone Selection',
    body: 'Every diamond — natural or CVD — is hand-picked for colour, clarity and cut consistency. We review over 100 stones to approve one for a solitaire, ten for a tennis bracelet.',
    icon: (
      <svg className="w-[55%] max-w-[220px] relative z-10 filter drop-shadow-[0_8px_20px_rgba(184,146,42,0.15)] transition-transform duration-[600ms] group-hover:scale-105" viewBox="0 0 80 80" fill="none">
        <polygon points="40,12 60,22 60,50 40,60 20,50 20,22" stroke="#B8922A" strokeWidth="1" fill="rgba(184,146,42,0.08)" />
        <polygon points="40,20 52,26 52,46 40,52 28,46 28,26" stroke="#B8922A" strokeWidth="0.6" fill="none" opacity=".5" />
        <line x1="40" y1="12" x2="40" y2="60" stroke="#B8922A" strokeWidth="0.4" opacity=".4" />
        <line x1="20" y1="22" x2="60" y2="50" stroke="#B8922A" strokeWidth="0.4" opacity=".3" />
        <line x1="60" y1="22" x2="20" y2="50" stroke="#B8922A" strokeWidth="0.4" opacity=".3" />
        <circle cx="40" cy="68" r="2" fill="#B8922A" opacity=".6" />
        <circle cx="40" cy="73" r="1.2" fill="#B8922A" opacity=".4" />
      </svg>
    ),
    sparks: [{ top: '22%', left: '30%' }, { top: '60%', right: '25%', delay: '1s' }],
  },
  {
    num: 'Step 02',
    title: 'CAD Design',
    body: 'Your vision rendered digitally. Every prong, every pavé seat, every curve modelled in 3D CAD to millimetre precision. Approved on screen before a single piece of metal is cut.',
    alt: true,
    icon: (
      <svg className="w-[55%] max-w-[220px] relative z-10 filter drop-shadow-[0_8px_20px_rgba(184,146,42,0.15)] transition-transform duration-[600ms] group-hover:scale-105" viewBox="0 0 80 80" fill="none">
        <rect x="12" y="18" width="56" height="36" rx="2" stroke="#B8922A" strokeWidth="1" fill="rgba(184,146,42,0.05)" />
        <rect x="12" y="18" width="56" height="6" fill="rgba(184,146,42,0.15)" />
        <circle cx="18" cy="21" r="1" fill="#B8922A" />
        <circle cx="22" cy="21" r="1" fill="#B8922A" opacity=".6" />
        <circle cx="26" cy="21" r="1" fill="#B8922A" opacity=".4" />
        <circle cx="40" cy="38" r="10" stroke="#B8922A" strokeWidth="0.8" fill="none" />
        <circle cx="40" cy="28" r="3" stroke="#B8922A" strokeWidth="0.6" fill="rgba(184,146,42,0.2)" />
        <line x1="40" y1="28" x2="30" y2="38" stroke="#B8922A" strokeWidth="0.3" opacity=".5" />
        <line x1="40" y1="28" x2="50" y2="38" stroke="#B8922A" strokeWidth="0.3" opacity=".5" />
        <line x1="30" y1="38" x2="50" y2="38" stroke="#B8922A" strokeWidth="0.3" opacity=".5" />
        <rect x="34" y="58" width="12" height="2" fill="#B8922A" opacity=".4" />
        <rect x="28" y="60" width="24" height="3" fill="#B8922A" opacity=".3" />
      </svg>
    ),
    sparks: [{ top: '30%', left: '70%' }],
  },
  {
    num: 'Step 03',
    title: 'Casting the Metal',
    body: '18K gold, platinum or 925 silver — melted at 1,064°C and poured into the wax mould. Cooled, broken out and filed down by hand into the raw skeleton of your piece.',
    icon: (
      <svg className="w-[55%] max-w-[220px] relative z-10 filter drop-shadow-[0_8px_20px_rgba(184,146,42,0.15)] transition-transform duration-[600ms] group-hover:scale-105" viewBox="0 0 80 80" fill="none">
        <ellipse cx="40" cy="42" rx="20" ry="6" stroke="#B8922A" strokeWidth="0.8" fill="rgba(184,146,42,0.08)" />
        <ellipse cx="40" cy="40" rx="20" ry="6" stroke="#B8922A" strokeWidth="0.8" fill="rgba(184,146,42,0.12)" />
        <path d="M20 40 L20 50" stroke="#B8922A" strokeWidth="0.8" />
        <path d="M60 40 L60 50" stroke="#B8922A" strokeWidth="0.8" />
        <path d="M40 14 Q37 18 37 22 Q37 26 40 26 Q43 26 43 22 Q43 18 40 14Z" stroke="#D4A840" strokeWidth="0.8" fill="rgba(212,168,64,0.3)" />
        <line x1="40" y1="26" x2="40" y2="32" stroke="#D4A840" strokeWidth="1" opacity=".5" />
        <circle cx="40" cy="34" r="1.5" fill="#D4A840" />
      </svg>
    ),
    sparks: [{ top: '20%', left: '50%', delay: '.5s' }],
  },
  {
    num: 'Step 04',
    title: 'Setting the Stones',
    body: 'Under 10x magnification, our master setters place each diamond by hand — bending prongs, channelling baguettes, checking every girdle. Hours per stone. Zero compromise.',
    alt: true,
    icon: (
      <svg className="w-[55%] max-w-[220px] relative z-10 filter drop-shadow-[0_8px_20px_rgba(184,146,42,0.15)] transition-transform duration-[600ms] group-hover:scale-105" viewBox="0 0 80 80" fill="none">
        <circle cx="30" cy="30" r="12" stroke="#B8922A" strokeWidth="1" fill="rgba(184,146,42,0.08)" />
        <circle cx="30" cy="30" r="8" stroke="#B8922A" strokeWidth="0.5" fill="none" />
        <line x1="40" y1="38" x2="50" y2="50" stroke="#B8922A" strokeWidth="1.4" />
        <polygon points="30,25 33,28 32,34 28,34 27,28" fill="rgba(212,168,64,0.4)" stroke="#B8922A" strokeWidth="0.4" />
        <line x1="15" y1="10" x2="26" y2="24" stroke="#B8922A" strokeWidth="0.6" />
        <line x1="18" y1="10" x2="29" y2="24" stroke="#B8922A" strokeWidth="0.6" />
        <circle cx="55" cy="58" r="10" stroke="#B8922A" strokeWidth="1" fill="rgba(184,146,42,0.05)" />
        <circle cx="55" cy="48" r="2.5" fill="rgba(212,168,64,0.5)" stroke="#B8922A" strokeWidth="0.5" />
      </svg>
    ),
    sparks: [{ top: '35%', left: '35%' }, { top: '75%', right: '30%', delay: '1.2s' }],
  },
  {
    num: 'Step 05',
    title: 'Polish & Quality Check',
    body: 'Rhodium dipped where needed. Polished on a rouge wheel to mirror finish. Inspected under 20x loupe for the final sign-off. Every certificate matched. Every piece signed for before it leaves Surat.',
    icon: (
      <svg className="w-[55%] max-w-[220px] relative z-10 filter drop-shadow-[0_8px_20px_rgba(184,146,42,0.15)] transition-transform duration-[600ms] group-hover:scale-105" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="18" stroke="#B8922A" strokeWidth="1" fill="rgba(184,146,42,0.05)" />
        <circle cx="40" cy="40" r="14" stroke="#B8922A" strokeWidth="0.5" fill="none" opacity=".5" />
        <circle cx="40" cy="40" r="10" stroke="#B8922A" strokeWidth="0.4" fill="none" opacity=".4" />
        <circle cx="40" cy="40" r="2" fill="#B8922A" />
        <line x1="40" y1="12" x2="40" y2="18" stroke="#D4A840" strokeWidth="0.8" opacity=".6" />
        <line x1="40" y1="62" x2="40" y2="68" stroke="#D4A840" strokeWidth="0.8" opacity=".6" />
        <line x1="12" y1="40" x2="18" y2="40" stroke="#D4A840" strokeWidth="0.8" opacity=".6" />
        <line x1="62" y1="40" x2="68" y2="40" stroke="#D4A840" strokeWidth="0.8" opacity=".6" />
        <line x1="20" y1="20" x2="24" y2="24" stroke="#D4A840" strokeWidth="0.6" opacity=".5" />
        <line x1="56" y1="56" x2="60" y2="60" stroke="#D4A840" strokeWidth="0.6" opacity=".5" />
        <line x1="56" y1="24" x2="60" y2="20" stroke="#D4A840" strokeWidth="0.6" opacity=".5" />
        <line x1="20" y1="60" x2="24" y2="56" stroke="#D4A840" strokeWidth="0.6" opacity=".5" />
      </svg>
    ),
    sparks: [{ top: '15%', left: '45%', delay: '.3s' }, { top: '55%', left: '70%', delay: '.8s' }, { top: '70%', left: '20%', delay: '1.5s' }],
  },
];

const proof = [
  { num: '5+', label: 'Hands per Piece' },
  { num: '60+', label: 'Hours per Tennis Bracelet' },
  { num: '20x', label: 'Loupe Inspection' },
  { num: '0', label: 'Compromises' },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('opacity-100', 'translate-y-0');
            e.target.classList.remove('opacity-0', 'translate-y-6');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px' }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function RevealDiv({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useReveal();
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

export default function Manufacturing() {
  return (
    <section
      className="py-[120px] max-lg:py-[80px] relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FBF9F5 0%, #F6F2EA 50%, #FBF9F5 100%)',
      }}
    >
      {/* Glow blobs */}
      <div className="absolute w-[360px] h-[360px] rounded-full top-[10%] -left-[120px] pointer-events-none" style={{ background: '#B8922A', filter: 'blur(80px)', opacity: 0.15 }} />
      <div className="absolute w-[360px] h-[360px] rounded-full bottom-[5%] -right-[120px] pointer-events-none" style={{ background: '#D4A840', filter: 'blur(80px)', opacity: 0.15 }} />

      <div className="max-w-[1280px] mx-auto px-[52px] max-lg:px-7 max-md:px-5 relative z-10">
        {/* Intro */}
        <div className="text-center mb-20 flex flex-col items-center">
          <RevealDiv>
            <div className="w-[60px] h-px bg-[#B8922A] mx-auto mb-6" />
          </RevealDiv>
          <RevealDiv delay={100}>
            <div className="text-[10px] font-normal tracking-[0.32em] text-[#B8922A] uppercase mb-[18px] inline-flex items-center gap-3 justify-center before:content-[''] before:w-6 before:h-px before:bg-[#B8922A]">
              From Surat · With Craft
            </div>
          </RevealDiv>
          <RevealDiv delay={200}>
            <h2 className="font-serif font-light tracking-[0.02em] text-[#14120D] leading-[1.05] mb-[18px] text-[clamp(40px,5.5vw,72px)]">
              Inside the <em className="not-italic text-[#B8922A] font-normal">Workshop</em>
            </h2>
          </RevealDiv>
          <RevealDiv delay={300}>
            <p className="text-[12px] font-light tracking-[0.12em] text-[#7A7060] leading-[1.9] max-w-[620px] mt-[18px]">
              From rough stone to finished heirloom — every piece passes through five hands in our Surat atelier. Here's how we make what you wear.
            </p>
          </RevealDiv>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-16 relative">
          {/* Center line */}
          <div
            className="absolute left-1/2 top-[60px] bottom-[60px] w-px -translate-x-px pointer-events-none max-lg:hidden"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(184,146,42,0.25) 8%, rgba(184,146,42,0.25) 92%, transparent)' }}
          />

          {steps.map((step, idx) => (
            <RevealDiv key={step.num} delay={idx * 100} className="w-full">
              <div
                className={[
                  'group grid grid-cols-2 gap-[60px] items-center',
                  'max-lg:grid-cols-1 max-lg:gap-6',
                ].join(' ')}
              >
                {/* Visual — swap order on alt rows for desktop only */}
                <div className={step.alt ? 'lg:order-2' : ''}>
                  <div className="relative aspect-[4/3] bg-white border border-[rgba(20,18,13,0.10)] flex items-center justify-center overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] group-hover:-translate-y-1 group-hover:shadow-[0_24px_60px_rgba(20,18,13,0.12)] group-hover:border-[rgba(184,146,42,0.25)] max-lg:aspect-video">
                    {/* BG */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'radial-gradient(circle at 30% 40%, rgba(184,146,42,0.08), transparent 60%), radial-gradient(circle at 70% 70%, rgba(212,168,64,0.05), transparent 50%), linear-gradient(135deg, #FBF9F5 0%, #F6F2EA 100%)',
                      }}
                    />
                    {step.icon}
                    {/* Spark dots */}
                    {step.sparks?.map((spark, si) => (
                      <div
                        key={si}
                        className="absolute w-1 h-1 bg-[#B8922A] rounded-full shadow-[0_0_8px_#D4A840] z-[2] animate-[sparkDot_3s_ease-in-out_infinite]"
                        style={{
                          top: spark.top,
                          left: spark.left,
                          right: spark.right,
                          animationDelay: spark.delay || '0s',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className={`py-5 ${step.alt ? 'lg:order-1' : ''}`}>
                  <div className="font-numeric text-[11px] font-medium not-italic tracking-[0.28em] text-[#B8922A] uppercase mb-3.5 inline-flex items-center gap-2.5 before:content-[''] before:w-6 before:h-px before:bg-[#B8922A]">
                    {step.num}
                  </div>
                  <h3 className="font-serif font-light text-[#14120D] tracking-[0.02em] leading-[1.1] mb-[18px] text-[clamp(30px,3.4vw,44px)]">
                    {step.title}
                  </h3>
                  <p className="text-[13px] font-light leading-[2] text-[#7A7060] tracking-[0.04em] max-w-[460px]">
                    {step.body}
                  </p>
                </div>
              </div>
            </RevealDiv>
          ))}
        </div>

        {/* Proof strip */}
        <RevealDiv delay={200} className="mt-[90px]">
          <div className="px-12 py-10 bg-[#14120D] text-[#E8D898] flex justify-around items-center gap-5 relative overflow-hidden flex-wrap max-lg:gap-5 max-lg:px-5 max-lg:py-7">
            {/* Top gold line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, #B8922A, transparent)' }}
            />
            {proof.map((item, i) => (
              <div key={item.label} className="flex items-center gap-5 max-lg:flex-wrap max-lg:justify-center">
                <div className="text-center">
                  <div className="font-numeric font-normal text-[#D4A840] leading-[1] tracking-[0.01em] text-[clamp(32px,4vw,52px)]">
                    {item.num}
                  </div>
                  <div className="text-[9px] font-normal tracking-[0.28em] text-[#A09580] uppercase mt-2.5">
                    {item.label}
                  </div>
                </div>
                {i < proof.length - 1 && (
                  <div className="w-px h-10 bg-[rgba(184,146,42,0.25)] max-lg:hidden" />
                )}
              </div>
            ))}
          </div>
        </RevealDiv>
      </div>
    </section>
  );
}
