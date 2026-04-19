'use client';

import { useEffect, useRef } from 'react';

const testimonials = [
  {
    text: 'The engagement ring they crafted was beyond anything I imagined. The diamond\'s clarity and cut were flawless — working with Krish felt like true collaboration.',
    author: 'Priya Mehta',
    origin: 'Mumbai, India',
  },
  {
    text: 'Outstanding quality for our wholesale requirements. Akshar\'s team consistently delivers exceptional CVD stones at very competitive prices. A true professional partner.',
    author: 'James Okafor',
    origin: 'London, UK',
  },
  {
    text: 'We\'ve sourced hundreds of fancy colour diamonds through House of Diams. Their stock, responsiveness and exceptional quality make them our go-to supplier.',
    author: 'Lena Brandt',
    origin: 'Amsterdam, Netherlands',
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

export default function Testimonials() {
  return (
    <section className="py-[110px] px-[52px] max-w-[1400px] mx-auto max-lg:px-7 max-md:px-5 max-md:py-[70px]">
      {/* Header */}
      <div className="text-center mb-2">
        <RevealDiv className="flex justify-center">
          <div className="text-[10px] font-normal tracking-[0.32em] text-[#B8922A] uppercase mb-[18px] inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#B8922A]">
            Client Stories
          </div>
        </RevealDiv>
        <RevealDiv delay={100}>
          <h2
            className="font-serif font-light tracking-[0.02em] text-[#14120D] leading-[1.05] text-center"
            style={{ fontSize: 'clamp(40px, 5.5vw, 72px)' }}
          >
            What Our <em className="not-italic text-[#B8922A] font-normal">Clients Say</em>
          </h2>
        </RevealDiv>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-[30px] mt-14 max-lg:grid-cols-2 max-md:grid-cols-1">
        {testimonials.map((t, i) => (
          <RevealDiv key={t.author} delay={i * 100}>
            <div className="bg-white p-10 border border-[rgba(20,18,13,0.10)] relative transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(20,18,13,0.12)] hover:border-[rgba(184,146,42,0.25)] h-full">
              {/* Big quote mark */}
              <div className="absolute top-[30px] right-[30px] font-serif text-[88px] font-medium text-[#B8922A] opacity-20 leading-[0.5] select-none pointer-events-none">
                &ldquo;
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-[18px]">
                {Array.from({ length: 5 }).map((_, si) => (
                  <div
                    key={si}
                    className="w-3 h-3 bg-[#B8922A]"
                    style={{
                      clipPath:
                        'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                    }}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[13px] font-light leading-[1.9] text-[#3A3628] mb-[26px] tracking-[0.02em]">
                {t.text}
              </p>

              {/* Author */}
              <div className="font-serif text-[18px] font-normal text-[#14120D] mb-[3px]">
                {t.author}
              </div>
              <div className="text-[9px] font-normal tracking-[0.26em] text-[#7A7060] uppercase">
                {t.origin}
              </div>
            </div>
          </RevealDiv>
        ))}
      </div>
    </section>
  );
}
