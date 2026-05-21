'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      {direction === 'left' ? (
        <path d="M15 6L9 12L15 18" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 6L15 12L9 18" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export default function Testimonials({ initialData }: { initialData?: HomeTestimonialsData }) {
  const [eyebrow] = useState(initialData?.eyebrow || 'Client Stories');
  const [heading] = useState(initialData?.heading || 'What Our Clients Say');
  const [testimonials] = useState<TestimonialItem[]>(initialData?.items ?? []);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [viewportWidth, setViewportWidth] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const gapPx = cardsPerView === 1 ? 16 : 30;

  useEffect(() => {
    const syncCardsPerView = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
        return;
      }
      if (window.innerWidth < 1100) {
        setCardsPerView(2);
        return;
      }
      setCardsPerView(3);
    };

    syncCardsPerView();
    window.addEventListener('resize', syncCardsPerView);
    return () => window.removeEventListener('resize', syncCardsPerView);
  }, []);

  useEffect(() => {
    if (!viewportRef.current) return;

    const updateWidth = () => {
      setViewportWidth(viewportRef.current?.clientWidth ?? 0);
    };

    updateWidth();

    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(viewportRef.current);

    window.addEventListener('resize', updateWidth);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const marqueeItems = useMemo(() => {
    if (testimonials.length === 0) return [];
    return [...testimonials, ...testimonials];
  }, [testimonials]);
  const shouldAnimate = testimonials.length > cardsPerView;
  const animationDuration = Math.max(26, testimonials.length * 6);
  const cardPixelWidth = viewportWidth > 0
    ? (viewportWidth - gapPx * (cardsPerView - 1)) / cardsPerView
    : 0;

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
            className="font-display-title font-light uppercase leading-[1.08] tracking-[0.01em] text-[#0A1628] text-center max-md:text-[28px]"
            style={{ fontSize: 'clamp(24px, 4.5vw, 54px)', fontWeight: 400 }}
          >
            {heading}
          </h2>
        </RevealDiv>
      </div>

      <div className="mt-14">
        <div ref={viewportRef} className="overflow-hidden rounded-[28px] px-1 py-3 md:px-2 md:py-4">
          <div
            className={shouldAnimate ? 'testimonial-marquee-track flex' : 'flex'}
            style={{
              gap: `${gapPx}px`,
              width: shouldAnimate ? 'max-content' : '100%',
              animationDuration: `${animationDuration}s`,
            }}
          >
            {marqueeItems.map((t, i) => (
              <div
                key={`${t.author}-${i}-${shouldAnimate ? 'loop' : 'single'}`}
                className="shrink-0"
                style={{ width: cardPixelWidth > 0 ? `${cardPixelWidth}px` : undefined }}
              >
                <RevealDiv delay={i * 70} className="h-full">
                  <div className="relative min-h-[270px] border border-[rgba(10,22,40,0.10)] bg-white p-7 md:min-h-[290px] md:p-10">
                    <div className="pointer-events-none absolute right-6 top-6 font-serif text-[72px] font-medium leading-[0.5] text-[#0A1628] opacity-15 md:right-[30px] md:top-[30px] md:text-[88px] md:opacity-20">
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
                </RevealDiv>
              </div>
            ))}
          </div>
        </div>

        {shouldAnimate ? (
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                const track = document.querySelector<HTMLElement>('.testimonial-marquee-track');
                if (track) {
                  track.style.animationPlayState = track.style.animationPlayState === 'paused' ? 'running' : 'paused';
                }
              }}
              aria-label="Pause or resume testimonials"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-border-strong)] bg-white text-[var(--theme-ink)] disabled:opacity-35"
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              onClick={() => {
                const track = document.querySelector<HTMLElement>('.testimonial-marquee-track');
                if (track) {
                  track.style.animationDirection = track.style.animationDirection === 'reverse' ? 'normal' : 'reverse';
                }
              }}
              aria-label="Reverse testimonial direction"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-border-strong)] bg-white text-[var(--theme-ink)] disabled:opacity-35"
            >
              <Chevron direction="right" />
            </button>
          </div>
        ) : null}
      </div>

      <style jsx>{`
        .testimonial-marquee-track {
          animation-name: testimonial-marquee-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-play-state: running;
          animation-direction: normal;
        }

        @keyframes testimonial-marquee-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - ${gapPx / 2}px));
          }
        }
      `}</style>
    </section>
  );
}
