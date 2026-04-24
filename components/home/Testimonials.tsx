'use client';

import { useEffect, useRef, useState } from 'react';
import type { HomeTestimonialsData } from '@/lib/home-data';

type TestimonialItem = {
  quote: string;
  author: string;
  origin: string;
  rating?: number;
};

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

export default function Testimonials({ initialData }: { initialData?: HomeTestimonialsData }) {
  const [eyebrow] = useState(initialData?.eyebrow || 'Client Stories');
  const [heading] = useState(initialData?.heading || 'What Our Clients Say');
  const [testimonials] = useState<TestimonialItem[]>(initialData?.items ?? []);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 3800);

    return () => window.clearInterval(intervalId);
  }, [testimonials.length]);

  return (
    <section className="py-[110px] px-[52px] max-w-[1400px] mx-auto max-lg:px-7 max-md:px-5 max-md:py-[70px]">
      <div className="text-center mb-2">
        <RevealDiv className="flex justify-center">
          <div className="text-[10px] font-normal tracking-[0.32em] text-[#0A1628] uppercase mb-[18px] inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#0A1628]">
            {eyebrow}
          </div>
        </RevealDiv>
        <RevealDiv delay={100}>
          <h2
            className="font-serif font-light tracking-[0.02em] text-[#0A1628] leading-[1.05] text-center"
            style={{ fontSize: 'clamp(40px, 5.5vw, 72px)' }}
          >
            {heading}
          </h2>
        </RevealDiv>
      </div>

      <div className="mt-14 hidden grid-cols-3 gap-[30px] max-lg:grid-cols-2 md:grid">
        {testimonials.map((t, i) => (
          <RevealDiv key={`${t.author}-${i}`} delay={i * 100}>
            <div className="bg-white p-10 border border-[rgba(10,22,40,0.10)] relative transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(10,22,40,0.12)] hover:border-[rgba(10,22,40,0.25)] h-full">
              <div className="absolute top-[30px] right-[30px] font-serif text-[88px] font-medium text-[#0A1628] opacity-20 leading-[0.5] select-none pointer-events-none">
                &ldquo;
              </div>

              <div className="flex gap-1 mb-[18px]">
                {Array.from({ length: 5 }).map((_, si) => (
                  <div
                    key={si}
                    className={`w-3 h-3 ${si < (t.rating ?? 5) ? 'bg-[#0A1628]' : 'bg-[#0A1628]/20'}`}
                    style={{
                      clipPath:
                        'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                    }}
                  />
                ))}
              </div>

              <p className="text-[13px] font-light leading-[1.9] text-[#253246] mb-[26px] tracking-[0.02em]">
                {t.quote}
              </p>

              <div className="font-serif text-[18px] font-normal text-[#0A1628] mb-[3px]">
                {t.author}
              </div>
              <div className="text-[9px] font-normal tracking-[0.26em] text-[#6A6A6A] uppercase">
                {t.origin}
              </div>
            </div>
          </RevealDiv>
        ))}
      </div>

      <div className="mt-12 md:hidden">
        <div className="overflow-hidden rounded-[28px]">
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)]"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {testimonials.map((t, i) => (
              <div key={`${t.author}-${i}-mobile`} className="min-w-full">
                <div className="relative h-full border border-[rgba(10,22,40,0.10)] bg-white p-7 shadow-[0_20px_50px_rgba(10,22,40,0.08)]">
                  <div className="pointer-events-none absolute right-6 top-6 font-serif text-[72px] font-medium leading-[0.5] text-[#0A1628] opacity-15">
                    &ldquo;
                  </div>

                  <div className="mb-[18px] flex gap-1">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <div
                        key={si}
                        className={`h-3 w-3 ${si < (t.rating ?? 5) ? 'bg-[#0A1628]' : 'bg-[#0A1628]/20'}`}
                        style={{
                          clipPath:
                            'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                        }}
                      />
                    ))}
                  </div>

                  <p className="mb-6 text-[13px] font-light leading-[1.9] tracking-[0.02em] text-[#253246]">
                    {t.quote}
                  </p>

                  <div className="font-serif text-[18px] font-normal text-[#0A1628]">{t.author}</div>
                  <div className="mt-1 text-[9px] font-normal uppercase tracking-[0.26em] text-[#6A6A6A]">
                    {t.origin}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {testimonials.length > 1 ? (
          <div className="mt-5 flex items-center justify-center gap-2">
            {testimonials.map((item, index) => (
              <button
                key={`${item.author}-${index}-dot`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show testimonial ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'w-8 bg-[#0A1628]' : 'w-2 bg-[#0A1628]/25'
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
