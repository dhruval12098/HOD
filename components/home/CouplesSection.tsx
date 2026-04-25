'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { HomeCoupleItem } from '@/lib/home-data';

type CoupleItem = {
  names: string;
  location: string;
  story: string;
  product_name: string;
  product_detail: string;
  image_path: string;
};

const COUPLES_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? 'hod';
const COUPLES_BUCKET_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${COUPLES_BUCKET}`
  : '';

function buildImageUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return COUPLES_BUCKET_URL ? `${COUPLES_BUCKET_URL}/${path}` : path;
}

function StarRating() {
  return (
    <div className="flex gap-0.75 mb-3.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 bg-[#0A1628]"
          style={{
            clipPath:
              'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
          }}
        />
      ))}
    </div>
  );
}

function HeartIcon() {
  return (
    <svg className="opacity-[0.12]" width="80" height="80" viewBox="0 0 80 80" fill="none">
      <path d="M40 70L10 40C3 33 3 21 10 14C17 7 29 7 40 17C51 7 63 7 70 14C77 21 77 33 70 40L40 70Z" stroke="#0A1628" strokeWidth="1.5" fill="rgba(10,22,40,0.05)" />
    </svg>
  );
}

export default function CouplesSection({
  initialData,
}: {
  initialData?: { eyebrow: string; heading: string; subtitle: string; items: HomeCoupleItem[] }
}) {
  const [eyebrow] = useState(initialData?.eyebrow || 'Love Stories');
  const [heading] = useState(initialData?.heading || 'Our Cute Couples');
  const [subtitle] = useState(initialData?.subtitle || 'Real couples. Real proposals. Real diamonds. Every ring tells a story.');
  const [items] = useState<CoupleItem[]>(initialData?.items ?? []);
  const [active, setActive] = useState<CoupleItem | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!active) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const lenis = typeof window !== 'undefined' ? (window as any).__lenis : null;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (lenis && typeof lenis.stop === 'function') {
      lenis.stop();
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      if (lenis && typeof lenis.start === 'function') {
        lenis.start();
      }
    };
  }, [active]);

  useEffect(() => {
    if (items.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, [items.length]);

  const modal = useMemo(() => {
    if (typeof document === 'undefined' || !active) return null;
    return createPortal(
      <div
        className="fixed inset-0 z-[1400] flex items-center justify-center bg-[rgba(10,22,40,0.34)] px-4 py-6 backdrop-blur-[14px] sm:px-5 sm:py-8"
        onClick={() => setActive(null)}
      >
        <div
          className="relative mx-auto flex max-h-[78vh] w-full max-w-[440px] flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl md:max-h-[88vh] md:max-w-3xl md:rounded-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-[#0A1628] shadow-[0_10px_25px_rgba(10,22,40,0.16)] transition hover:bg-white"
            aria-label="Close popup"
          >
            <X size={16} />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="min-h-[180px] bg-[#f5f1ea] flex items-center justify-center md:min-h-[320px]">
              {active.image_path ? <img src={buildImageUrl(active.image_path)} alt={active.names} className="h-full w-full object-cover" /> : <HeartIcon />}
            </div>
            <div className="max-h-[calc(78vh-180px)] overflow-y-auto p-4 pr-3 md:max-h-none md:overflow-visible md:p-8">
              <div className="mb-3 pr-8 text-[9px] uppercase tracking-[0.24em] text-[#0A1628] md:text-[10px] md:tracking-[0.3em]">{active.location}</div>
              <h3 className="mb-3 font-serif text-[26px] leading-none text-[#0A1628] md:mb-4 md:text-3xl">{active.names}</h3>
              <StarRating />
              <p className="mb-4 text-[12px] leading-6 text-[#555] md:mb-6 md:text-sm md:leading-8">{active.story}</p>
              <div className="border border-black/8 bg-[#fafafa] px-4 py-4">
                <div className="font-serif text-[16px] text-[#0A1628]">{active.product_name}</div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#999] mt-1">{active.product_detail}</div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }, [active]);

  return (
    <section className="relative px-13 py-30 overflow-hidden max-md:px-5 max-md:py-20" style={{ background: 'linear-gradient(180deg,#F5F7FC,#fff)' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(10,22,40,0.3),transparent)' }} />
      <div className="max-w-350 mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 justify-center text-[10px] font-medium tracking-[0.32em] uppercase text-[#0A1628] mb-3.5">
            <span className="w-6 h-px bg-[#0A1628]" />
            {eyebrow}
            <span className="w-6 h-px bg-[#0A1628]" />
          </div>
          <h2 className="font-serif font-light text-[#0A1628] leading-[1.05] mb-3.5" style={{ fontSize: 'clamp(40px,5vw,64px)' }}>
            {heading}
          </h2>
          <p className="text-[12px] font-light tracking-[0.12em] text-[#777] leading-[1.9] max-w-140 mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="hidden grid-cols-3 gap-8 max-[1100px]:grid-cols-2 md:grid">
          {items.map((couple) => (
            <button
              key={couple.names}
              onClick={() => setActive(couple)}
              className="text-left group relative bg-white border border-black/8 overflow-hidden cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(0,0,0,0.08)] hover:border-[rgba(10,22,40,0.2)]"
            >
              <div className="h-80 overflow-hidden relative bg-gradient-to-br from-[#f5f5f5] to-[#ececec]">
                {couple.image_path ? <img src={buildImageUrl(couple.image_path)} alt={couple.names} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" /> : <div className="w-full h-full flex items-center justify-center"><HeartIcon /></div>}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none" style={{ background: 'linear-gradient(transparent,rgba(0,0,0,0.03))' }} />
              </div>
              <div className="relative px-7 pt-7.5 pb-8.5">
                <div className="absolute top-6 right-6 font-serif text-[56px] font-medium text-[#0A1628] leading-[0.5]" style={{ opacity: 0.2 }} aria-hidden="true">&ldquo;</div>
                <div className="font-serif text-2xl font-normal text-[#0A1628] tracking-[0.02em] mb-1.5">{couple.names}</div>
                <div className="inline-flex items-center gap-2 text-[9px] font-normal tracking-[0.28em] uppercase text-[#0A1628] mb-4"><span className="w-1 h-1 rounded-full bg-[#0A1628]" />{couple.location}</div>
                <StarRating />
                <p className="text-[13px] font-light leading-[1.9] text-[#777] tracking-[0.02em] mb-5 line-clamp-4">{couple.story}</p>
                <div className="flex items-center gap-3.5 px-4.5 py-4 bg-[#F5F7FC] border border-black/8 transition-colors duration-300 group-hover:border-[rgba(10,22,40,0.2)]">
                  <div>
                    <div className="font-serif text-[15px] font-normal text-[#0A1628] tracking-[0.02em]">{couple.product_name}</div>
                    <div className="text-[9px] font-normal tracking-[0.2em] text-[#aaa] uppercase mt-0.5">{couple.product_detail}</div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="md:hidden">
          <div className="overflow-hidden rounded-[28px]">
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.3,1)]"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {items.map((couple) => (
                <div key={`${couple.names}-mobile`} className="min-w-full">
                  <button
                    onClick={() => setActive(couple)}
                    className="group relative w-full overflow-hidden border border-black/8 bg-white text-left shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
                  >
                    <div className="relative h-[310px] overflow-hidden bg-gradient-to-br from-[#f5f5f5] to-[#ececec] sm:h-[340px]">
                      {couple.image_path ? (
                        <img
                          src={buildImageUrl(couple.image_path)}
                          alt={couple.names}
                          className="h-full w-full object-cover object-center scale-[1.1] transition-transform duration-700 group-hover:scale-[1.14] sm:scale-100 sm:group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <HeartIcon />
                        </div>
                      )}
                      <div
                        className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/2"
                        style={{ background: 'linear-gradient(transparent,rgba(0,0,0,0.03))' }}
                      />
                    </div>

                    <div className="relative px-6 pb-7 pt-6">
                      <div className="absolute right-5 top-5 font-serif text-[48px] font-medium leading-[0.5] text-[#0A1628] opacity-20" aria-hidden="true">
                        &ldquo;
                      </div>
                      <div className="mb-1.5 font-serif text-[26px] font-normal tracking-[0.02em] text-[#0A1628]">{couple.names}</div>
                      <div className="mb-4 inline-flex items-center gap-2 text-[9px] font-normal uppercase tracking-[0.28em] text-[#0A1628]">
                        <span className="h-1 w-1 rounded-full bg-[#0A1628]" />
                        {couple.location}
                      </div>
                      <StarRating />
                      <p className="mb-5 line-clamp-4 text-[13px] font-light leading-[1.9] tracking-[0.02em] text-[#777]">{couple.story}</p>
                      <div className="flex items-center gap-3.5 border border-black/8 bg-[#F5F7FC] px-4.5 py-4">
                        <div>
                          <div className="font-serif text-[15px] font-normal tracking-[0.02em] text-[#0A1628]">{couple.product_name}</div>
                          <div className="mt-0.5 text-[9px] font-normal uppercase tracking-[0.2em] text-[#aaa]">{couple.product_detail}</div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {items.length > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-2">
              {items.map((item, index) => (
                <button
                  key={`${item.names}-${index}-dot`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show couple ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex ? 'w-8 bg-[#0A1628]' : 'w-2 bg-[#0A1628]/25'
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {modal}
    </section>
  );
}
