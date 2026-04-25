'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import type { HomeCollectionItem } from '@/lib/home-data';

// ── Types ─────────────────────────────────────────────────────────────────────
interface CollectionProps {
  onEnquire?: (name: string) => void;
}

interface PanelData {
  index: number;
  name: string;
  label: string;
  desc: string;
  cta: string;
  ctaHref: string;
  gem: React.ReactNode;
  bgClass: string;
  darkVignette?: boolean;
}

interface CollectionApiItem {
  sort_order: number;
  label: string;
  title: string;
  description: string;
  image_path: string;
  link: string;
}

// ── SVG Gems ──────────────────────────────────────────────────────────────────
const FineJewelleryGem = () => (
  <svg width="200" height="200" viewBox="0 0 110 110" fill="none">
    <path d="M55 15 Q75 38 72 68 Q65 92 55 94 Q45 92 38 68 Q35 38 55 15Z" stroke="#0A1628" strokeWidth="1" fill="rgba(10,22,40,0.14)" />
    <path d="M55 25 Q68 42 65 65 Q60 82 55 84 Q50 82 45 65 Q42 42 55 25Z" stroke="#0A1628" strokeWidth=".5" fill="rgba(10,22,40,0.07)" />
    <line x1="55" y1="15" x2="38" y2="68" stroke="#0A1628" strokeWidth=".3" opacity=".5" />
    <line x1="55" y1="15" x2="72" y2="68" stroke="#0A1628" strokeWidth=".3" opacity=".5" />
    <line x1="38" y1="68" x2="72" y2="68" stroke="#0A1628" strokeWidth=".3" opacity=".5" />
    <circle cx="48" cy="42" r="3.5" fill="#fff" opacity=".45" />
  </svg>
);

const EngagementRingsGem = () => (
  <svg width="200" height="200" viewBox="0 0 110 110" fill="none">
    <polygon points="55,15 85,35 77,85 33,85 25,35" stroke="#0A1628" strokeWidth="1" fill="rgba(10,22,40,0.13)" />
    <polygon points="55,25 75,40 69,75 41,75 35,40" stroke="#0A1628" strokeWidth=".5" fill="rgba(10,22,40,0.06)" />
    <line x1="55" y1="15" x2="33" y2="85" stroke="#0A1628" strokeWidth=".3" opacity=".4" />
    <line x1="55" y1="15" x2="77" y2="85" stroke="#0A1628" strokeWidth=".3" opacity=".4" />
    <line x1="25" y1="35" x2="85" y2="35" stroke="#0A1628" strokeWidth=".3" opacity=".35" />
    <circle cx="48" cy="33" r="3.5" fill="#fff" opacity=".45" />
  </svg>
);

const WeddingBandsGem = () => (
  <svg width="200" height="200" viewBox="0 0 110 110" fill="none">
    <circle cx="55" cy="55" r="38" stroke="#0A1628" strokeWidth="1" fill="none" />
    <circle cx="55" cy="55" r="28" stroke="#0A1628" strokeWidth=".5" fill="none" opacity=".4" />
    <circle cx="55" cy="55" r="18" stroke="#0A1628" strokeWidth=".3" fill="rgba(10,22,40,0.05)" opacity=".5" />
    {([[55,17],[89,47],[76,88],[34,88],[21,47]] as [number,number][]).map(([cx,cy],i) => (
      <circle key={i} cx={cx} cy={cy} r="4.5" fill="rgba(32,48,74,0.35)" stroke="#0A1628" strokeWidth=".5" />
    ))}
  </svg>
);

const HipHopGem = () => (
  <svg width="180" height="180" viewBox="0 0 110 110" fill="none">
    {([22,42,62,82] as number[]).map((cy, i) => (
      <g key={i}>
        <ellipse cx="55" cy={cy} rx="22" ry="8" stroke="#0A1628" strokeWidth="1" fill="rgba(32,48,74,0.15)" />
        <rect x="44" y={cy - 2.5} width="22" height="5" fill="#20304A" opacity=".6" />
      </g>
    ))}
    <line x1="33" y1="22" x2="33" y2="82" stroke="#0A1628" strokeWidth=".4" opacity=".3" />
    <line x1="77" y1="22" x2="77" y2="82" stroke="#0A1628" strokeWidth=".4" opacity=".3" />
  </svg>
);

const BespokeGem = () => (
  <svg width="200" height="200" viewBox="0 0 110 110" fill="none">
    <polygon points="55,15 73,30 68,90 42,90 37,30" stroke="#0A1628" strokeWidth="1" fill="rgba(10,22,40,0.14)" />
    <polygon points="28,40 38,48 33,80 18,80 13,48" stroke="#0A1628" strokeWidth=".8" fill="rgba(10,22,40,0.08)" />
    <polygon points="82,40 92,48 87,80 72,80 67,48" stroke="#0A1628" strokeWidth=".8" fill="rgba(10,22,40,0.08)" />
    <line x1="37" y1="30" x2="28" y2="40" stroke="#0A1628" strokeWidth=".4" opacity=".4" />
    <line x1="73" y1="30" x2="82" y2="40" stroke="#0A1628" strokeWidth=".4" opacity=".4" />
    <circle cx="55" cy="44" r="4" fill="rgba(255,255,255,0.4)" />
  </svg>
);

// ── Chevron SVGs ───────────────────────────────────────────────────────────────
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

// ── Panel data ────────────────────────────────────────────────────────────────
const PANELS: PanelData[] = [
  {
    index: 0,
    name: 'Fine Jewellery',
    label: 'Collection 01',
    desc: 'Necklaces, earrings, bracelets & pendants',
    cta: 'Shop Collection',
    ctaHref: '/shop?category=fine',
    gem: <FineJewelleryGem />,
    bgClass: 'bg-[linear-gradient(145deg,#f8f6f0,#ddd5be)]',
  },
  {
    index: 1,
    name: 'Engagement Rings',
    label: 'Collection 02',
    desc: 'Solitaire, halo, pavé & three stone',
    cta: 'Shop Collection',
    ctaHref: '/shop?category=engagement',
    gem: <EngagementRingsGem />,
    bgClass: 'bg-[linear-gradient(145deg,#f0ece4,#d8cebb)]',
  },
  {
    index: 2,
    name: 'Wedding Bands',
    label: 'Collection 03',
    desc: 'For her & for him — classic to diamond-set',
    cta: 'Shop Collection',
    ctaHref: '/shop?category=wedding',
    gem: <WeddingBandsGem />,
    bgClass: 'bg-[linear-gradient(145deg,#faf8f4,#e8e0d0)]',
  },
  {
    index: 3,
    name: 'Hip Hop',
    label: 'Collection 04',
    desc: 'Iced chains, grillz & statement pieces',
    cta: 'Shop Collection',
    ctaHref: '/shop?category=hiphop',
    gem: <HipHopGem />,
    bgClass: 'bg-[#0A0A0A]',
    darkVignette: true,
  },
  {
    index: 4,
    name: 'Bespoke',
    label: 'Collection 05',
    desc: 'Design your dream piece from scratch',
    cta: 'Start Designing',
    ctaHref: '/bespoke',
    gem: <BespokeGem />,
    bgClass: 'bg-[linear-gradient(145deg,#f5f2ec,#e0d8c8)]',
  },
];

const AUTO_DELAY = 4000;
const COLLECTION_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? 'hod';
const COLLECTION_BUCKET_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${COLLECTION_BUCKET}`
  : '';

// ── Component ─────────────────────────────────────────────────────────────────
function mapPanels(items: CollectionApiItem[]): PanelData[] {
  return items.map((item, index) => ({
    index,
    name: item.title,
    label: item.label,
    desc: item.description,
    cta: 'Shop Collection',
    ctaHref: item.link,
    gem: item.image_path ? (
      <div className="relative h-full w-full">
        <img
          src={`${COLLECTION_BUCKET_URL}/${item.image_path}`}
          alt={item.title}
          className="h-full w-full object-cover"
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      </div>
    ) : null,
    bgClass: index % 2 === 0 ? 'bg-[linear-gradient(145deg,#f8f6f0,#ddd5be)]' : 'bg-[linear-gradient(145deg,#f0ece4,#d8cebb)]',
  }));
}

export default function Collection({ onEnquire, items = [] }: CollectionProps & { items?: HomeCollectionItem[] }) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [panels] = useState<PanelData[]>(items.length ? mapPanels(items) : PANELS);

  const trackRef      = useRef<HTMLDivElement>(null);
  const progressRef   = useRef<HTMLDivElement>(null);
  const labelRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const titleRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const descRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRefs       = useRef<(HTMLAnchorElement | null)[]>([]);
  const gemRefs       = useRef<(HTMLDivElement | null)[]>([]);

  const autoTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progRafRef    = useRef<number | null>(null);
  const progStartRef  = useRef<number>(0);
  const touchStartX   = useRef<number>(0);
  const currentRef    = useRef(0);

  // ── Text animation helpers ────────────────────────────────────────────────
  const hideSlideContent = (i: number, instant = false) => {
    const dur = instant ? 0 : 0.15;
    gsap.to(labelRefs.current[i], { opacity: 0, y: 8, duration: dur, ease: 'power1.in' });
    gsap.to(titleRefs.current[i], { opacity: 0, y: 10, duration: dur, ease: 'power1.in' });
    gsap.to(descRefs.current[i],  { opacity: 0, y: 8, duration: dur, ease: 'power1.in' });
    gsap.to(ctaRefs.current[i],   { opacity: 0, y: -8, duration: dur, ease: 'power1.in' });
    gsap.to(gemRefs.current[i],   { scale: 1, opacity: 0.7, duration: instant ? 0 : 0.3 });
  };

  const showSlideContent = (i: number) => {
    gsap.fromTo(labelRefs.current[i], { opacity: 0, y: 8 },  { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.1 });
    gsap.fromTo(titleRefs.current[i], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.18 });
    gsap.fromTo(descRefs.current[i],  { opacity: 0, y: 8 },  { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', delay: 0.26 });
    gsap.fromTo(ctaRefs.current[i],   { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.32, ease: 'back.out(1.6)', delay: 0.32 });
    gsap.to(gemRefs.current[i],       { scale: 1.1, opacity: 0.95, duration: 0.5, ease: 'power2.out' });
  };

  // ── Slide transition ──────────────────────────────────────────────────────
  const goTo = (idx: number, resetAuto = true) => {
    const next = ((idx % panels.length) + panels.length) % panels.length;
    const prev = currentRef.current;
    if (next === prev) return;

    hideSlideContent(prev);

    gsap.to(trackRef.current, {
      x: `-${next * 100}%`,
      duration: 0.65,
      ease: 'power3.inOut',
      onComplete: () => showSlideContent(next),
    });

    currentRef.current = next;
    setCurrent(next);
    if (resetAuto) startAuto(next);
  };

  // ── Progress bar ──────────────────────────────────────────────────────────
  const startAuto = (fromIndex?: number) => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (progRafRef.current) cancelAnimationFrame(progRafRef.current);

    setProgress(0);
    progStartRef.current = 0;

    const tick = (now: number) => {
      if (progStartRef.current === 0) {
        progStartRef.current = now;
      }
      const pct = Math.min(((now - progStartRef.current) / AUTO_DELAY) * 100, 100);
      setProgress(pct);
      if (pct < 100) progRafRef.current = requestAnimationFrame(tick);
    };
    progRafRef.current = requestAnimationFrame(tick);

    autoTimerRef.current = setTimeout(() => {
      const next = (currentRef.current + 1) % panels.length;
      goTo(next, false);
      startAuto(next);
    }, AUTO_DELAY);
  };

  // ── Mount ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Set initial positions
    gsap.set(trackRef.current, { x: '0%' });
    panels.forEach((_, i) => {
      hideSlideContent(i, true);
    });
    showSlideContent(0);
    startAuto(0);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (progRafRef.current) cancelAnimationFrame(progRafRef.current);
    };
  }, [panels]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Swipe ─────────────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd   = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? currentRef.current + 1 : currentRef.current - 1);
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 font-[Montserrat,sans-serif] font-light sm:px-4 sm:py-20">

      {/* ── Header ── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-3 mb-4 text-[10px] font-medium tracking-[0.32em] uppercase text-[#0A1628]">
          <span className="w-6 h-px bg-[#0A1628] inline-block" />
          Explore
          <span className="w-6 h-px bg-[#0A1628] inline-block" />
        </div>
        <h2 className="font-[Cormorant_Garamond,Georgia,serif] font-light text-[clamp(36px,5vw,60px)] leading-[1.05] mb-3">
          Our{' '}
          <em className="not-italic text-[#0A1628] italic">Collections</em>
        </h2>
        <p className="text-[12px] font-light tracking-[0.12em] leading-[1.9] text-gray-400 max-w-lg mx-auto">
          Swipe or use the arrows to explore each collection.
        </p>
      </div>

      {/* ── Carousel ── */}
      <div className="relative rounded-xl overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Track */}
        <div ref={trackRef} className="flex will-change-transform">
          {panels.map((panel) => (
            <div
              key={panel.index}
              className={`relative min-w-full overflow-hidden cursor-pointer select-none h-[clamp(360px,58vw,480px)] sm:h-[clamp(320px,50vw,480px)] ${panel.bgClass}`}
            >
              {/* Gem */}
              <div
                ref={(el) => { gemRefs.current[panel.index] = el; }}
                className="absolute inset-0 pointer-events-none will-change-transform"
              >
                {panel.gem}
              </div>

              {/* Vignette */}
              <div className={`absolute inset-0 pointer-events-none ${panel.darkVignette
                ? 'bg-[linear-gradient(to_top,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0)_55%)]'
                : 'bg-[linear-gradient(to_top,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0)_55%)]'
              }`} />

              {/* CTA */}
              <Link
                ref={(el) => { ctaRefs.current[panel.index] = el; }}
                href={panel.ctaHref}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-4 right-4 z-10 px-4 py-2 text-[8px] font-medium tracking-[0.18em] uppercase text-white no-underline border border-white/30 bg-black/25 backdrop-blur-sm rounded-[2px] transition-colors duration-200 hover:bg-[#0A1628] hover:border-[#0A1628] hover:text-white will-change-[opacity,transform] sm:top-6 sm:right-6 sm:px-5 sm:py-2.5 sm:text-[8.5px] sm:tracking-[0.22em]"
              >
                {panel.cta}
              </Link>

              {/* Content */}
              <div className="absolute bottom-5 left-5 right-5 z-[2] sm:bottom-7 sm:left-7 sm:right-7">
                <div
                  ref={(el) => { labelRefs.current[panel.index] = el; }}
                  className="mb-1.5 text-[8px] font-medium tracking-[0.22em] uppercase text-[#0A1628] will-change-[opacity,transform] sm:text-[9px] sm:tracking-[0.28em]"
                >
                  {panel.label}
                </div>
                <div
                  ref={(el) => { titleRefs.current[panel.index] = el; }}
                  className="font-[Cormorant_Garamond,Georgia,serif] text-[clamp(24px,6vw,42px)] font-normal text-white leading-[1.02] will-change-[opacity,transform]"
                >
                  {panel.name}
                </div>
                <div
                  ref={(el) => { descRefs.current[panel.index] = el; }}
                  className="mt-1.5 text-[10px] font-light tracking-[0.06em] text-white/70 will-change-[opacity,transform] sm:text-[11px] sm:tracking-[0.1em] sm:text-white/60"
                >
                  {panel.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 h-[3px] bg-[#0A1628] z-10 pointer-events-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Nav ── */}
      <div className="flex items-center justify-center gap-2.5 mt-5">
        {/* Prev */}
        <button
          onClick={() => goTo(currentRef.current - 1)}
          aria-label="Previous"
          className="w-10 h-10 rounded-full border border-black/15 bg-white dark:bg-zinc-900 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft />
        </button>

        {/* Dots */}
        {panels.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="h-1.5 rounded-full bg-[#0A1628] transition-all duration-[450ms] ease-[cubic-bezier(0.77,0,0.18,1)] cursor-pointer"
            style={{
              width: i === current ? '28px' : '6px',
              opacity: i === current ? 1 : 0.3,
            }}
          />
        ))}

        {/* Next */}
        <button
          onClick={() => goTo(currentRef.current + 1)}
          aria-label="Next"
          className="w-10 h-10 rounded-full border border-black/15 bg-white dark:bg-zinc-900 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
