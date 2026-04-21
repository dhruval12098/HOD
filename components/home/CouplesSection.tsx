'use client';

// CouplesSection.tsx
// Fonts: Cormorant Garamond (font-serif) + Montserrat (body) — inherited from global setup, same as Hero.tsx

import type { ReactNode } from 'react';

interface Couple {
  names: string;
  location: string;
  story: string;
  productName: string;
  productDetail: string;
  gemIcon: ReactNode;
}

const couples: Couple[] = [
  {
    names: 'Priya & Arjun',
    location: 'Mumbai, India',
    story:
      'He proposed at sunset on Marine Drive with a cushion halo from House of Diams. She said yes before he even finished the question. \u201cThe ring was more beautiful than anything I\u2019d imagined \u2014 and he designed it himself with Krish.\u201d',
    productName: 'Cushion Halo Ring',
    productDetail: '1.5ct \u00b7 CVD \u00b7 18K Rose Gold',
    gemIcon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <polygon
          points="18,4 30,12 26,32 10,32 6,12"
          stroke="#B8922A"
          strokeWidth=".8"
          fill="rgba(184,146,42,0.1)"
        />
      </svg>
    ),
  },
  {
    names: 'Sarah & James',
    location: 'London, UK',
    story:
      'They flew to Surat to handpick their diamond together. \u201cAkshar showed us forty stones before we found \u2018the one.\u2019 It felt like finding each other all over again.\u201d',
    productName: 'Emerald Cut Solitaire',
    productDetail: '2.0ct \u00b7 Natural \u00b7 Platinum',
    gemIcon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect
          x="8"
          y="6"
          width="20"
          height="24"
          stroke="#B8922A"
          strokeWidth=".8"
          fill="rgba(184,146,42,0.1)"
        />
      </svg>
    ),
  },
  {
    names: 'Fatima & Ahmed',
    location: 'Dubai, UAE',
    story:
      'A bespoke trilogy ring for their 10th anniversary \u2014 past, present, future. \u201cHouse of Diams turned our love story into something we can wear forever.\u201d',
    productName: 'Fancy Yellow Trilogy',
    productDetail: '2.0ct Total \u00b7 Natural \u00b7 18K Yellow',
    gemIcon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <polygon
          points="18,4 28,10 24,28 12,28 8,10"
          stroke="#B8922A"
          strokeWidth=".8"
          fill="rgba(184,146,42,0.1)"
        />
        <polygon
          points="8,14 12,18 8,26 2,18"
          stroke="#B8922A"
          strokeWidth=".6"
          fill="rgba(184,146,42,0.06)"
        />
        <polygon
          points="28,14 32,18 28,26 24,18"
          stroke="#B8922A"
          strokeWidth=".6"
          fill="rgba(184,146,42,0.06)"
        />
      </svg>
    ),
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.75 mb-3.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 bg-[#B8922A]"
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
    <svg
      className="opacity-[0.12] transition-all duration-600 group-hover:scale-[1.15] group-hover:opacity-[0.2]"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
    >
      <path
        d="M40 70L10 40C3 33 3 21 10 14C17 7 29 7 40 17C51 7 63 7 70 14C77 21 77 33 70 40L40 70Z"
        stroke="#B8922A"
        strokeWidth="1.5"
        fill="rgba(184,146,42,0.05)"
      />
    </svg>
  );
}

export default function CouplesSection() {
  return (
    <section
      className="relative px-13 py-30 overflow-hidden max-md:px-5 max-md:py-20"
      style={{ background: 'linear-gradient(180deg,#FAFAFA,#fff)' }}
    >
      {/* Top gold rule */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg,transparent,rgba(184,146,42,0.3),transparent)',
        }}
      />

      <div className="max-w-350 mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 justify-center text-[10px] font-medium tracking-[0.32em] uppercase text-[#B8922A] mb-3.5">
            <span className="w-6 h-px bg-[#B8922A]" />
            Love Stories
            <span className="w-6 h-px bg-[#B8922A]" />
          </div>

          {/* Title */}
          <h2
            className="font-serif font-light text-[#111] leading-[1.05] mb-3.5"
            style={{ fontSize: 'clamp(40px,5vw,64px)' }}
          >
            Our Cute{' '}
            <em style={{ fontStyle: 'italic', color: '#B8922A' }}>Couples</em>
          </h2>

          <p className="text-[12px] font-light tracking-[0.12em] text-[#777] leading-[1.9] max-w-140 mx-auto">
            Real couples. Real proposals. Real diamonds. Every ring tells a story &mdash; here are
            some of our favourites.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-8 max-[1100px]:grid-cols-2 max-md:grid-cols-1">
          {couples.map((couple) => (
            <div
              key={couple.names}
              className="group relative bg-white border border-black/8 overflow-hidden cursor-pointer
                         transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)]
                         hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(0,0,0,0.08)] hover:border-[rgba(184,146,42,0.2)]"
            >
              {/* Image placeholder */}
              <div
                className="h-80 overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg,#f5f5f5,#ececec)' }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <HeartIcon />
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none"
                  style={{ background: 'linear-gradient(transparent,rgba(0,0,0,0.03))' }}
                />
              </div>

              {/* Body */}
              <div className="relative px-7 pt-7.5 pb-8.5">
                {/* Opening quote decoration */}
                <div
                  className="absolute top-6 right-6 font-serif text-[56px] font-medium text-[#B8922A] leading-[0.5]"
                  style={{ opacity: 0.2 }}
                  aria-hidden="true"
                >
                  &ldquo;
                </div>

                {/* Names */}
                <div className="font-serif text-2xl font-normal text-[#111] tracking-[0.02em] mb-1.5">
                  {couple.names}
                </div>

                {/* Location */}
                <div className="inline-flex items-center gap-2 text-[9px] font-normal tracking-[0.28em] uppercase text-[#B8922A] mb-4">
                  <span className="w-1 h-1 rounded-full bg-[#B8922A]" />
                  {couple.location}
                </div>

                {/* Stars */}
                <StarRating />

                {/* Story */}
                <p className="text-[13px] font-light leading-[1.9] text-[#777] tracking-[0.02em] mb-5 line-clamp-4">
                  {couple.story}
                </p>

                {/* Product tag */}
                <div
                  className="flex items-center gap-3.5 px-4.5 py-4 bg-[#FAFAFA] border border-black/8
                             transition-colors duration-300 group-hover:border-[rgba(184,146,42,0.2)]"
                >
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                    {couple.gemIcon}
                  </div>
                  <div>
                    <div className="font-serif text-[15px] font-normal text-[#111] tracking-[0.02em]">
                      {couple.productName}
                    </div>
                    <div className="text-[9px] font-normal tracking-[0.2em] text-[#aaa] uppercase mt-0.5">
                      {couple.productDetail}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}