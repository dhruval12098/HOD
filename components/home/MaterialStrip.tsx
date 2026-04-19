'use client';

import Link from 'next/link';

const materials = [
  {
    title: 'Natural Diamonds',
    desc: 'Ethically sourced · All cuts · D-Z colour · FL-SI',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <polygon points="18,4 30,12 26,32 10,32 6,12" stroke="#B8922A" strokeWidth="1" fill="rgba(184,146,42,0.06)" />
      </svg>
    ),
  },
  {
    title: 'Precious Gems',
    desc: 'Emeralds · Rubies · Sapphires · Alexandrite',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="12" stroke="#7BC4B0" strokeWidth="1" fill="rgba(123,196,176,0.08)" />
        <circle cx="18" cy="18" r="6" stroke="#7BC4B0" strokeWidth=".6" fill="none" />
      </svg>
    ),
  },
  {
    title: 'Precious Metals',
    desc: 'Platinum · 22K · 18K · 14K · 10K · 925 Silver',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="6" y="11" width="24" height="14" rx="7" stroke="#B8922A" strokeWidth="1" fill="rgba(184,146,42,0.06)" />
      </svg>
    ),
  },
  {
    title: 'CVD Diamonds',
    desc: 'Type IIA lab-grown · All cuts · Conflict-free',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <polygon points="18,4 25,14 18,32 11,14" stroke="#D4A840" strokeWidth="1" fill="rgba(212,168,64,0.1)" />
      </svg>
    ),
  },
];

export default function MaterialStrip() {
  return (
    <section className="py-[110px] px-[52px] max-w-[1400px] mx-auto grid grid-cols-[1fr_1.4fr] gap-20 items-center max-lg:grid-cols-1 max-lg:gap-10 max-lg:px-7 max-md:px-5 max-md:py-[70px]">
      {/* Left */}
      <div>
        <div className="w-[60px] h-px bg-[#B8922A] mb-6" />
        <div className="text-[10px] font-normal tracking-[0.32em] text-[#B8922A] uppercase mb-3.5 inline-flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-[#B8922A]">
          Precious Materials
        </div>
        <h2 className="font-serif font-light tracking-[0.02em] text-[#14120D] leading-[1.05] mb-[22px] text-[clamp(40px,5.5vw,72px)]">
          More Than <em className="not-italic text-[#B8922A] font-normal">Diamonds</em>
        </h2>
        <p className="text-[13px] font-light leading-[2] text-[#7A7060] tracking-[0.04em] mb-8">
          We work with the world's most precious materials — from CVD diamonds to natural gemstones,
          platinum to 22K gold. Every material selected for its rarity, beauty and integrity.
        </p>
        <Link
          href="/bespoke"
          className="inline-flex items-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#14120D] bg-transparent px-8 py-[15px] border border-[#14120D] cursor-pointer uppercase no-underline transition-all duration-400 hover:bg-[#14120D] hover:text-[#FBF9F5]"
        >
          Explore Custom Orders
        </Link>
      </div>

      {/* Right — 2×2 grid */}
      <div className="grid grid-cols-2 gap-5">
        {materials.map(mat => (
          <div
            key={mat.title}
            className="bg-white p-8 border border-[rgba(20,18,13,0.10)] transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:-translate-y-1 hover:border-[rgba(184,146,42,0.25)] hover:shadow-[0_8px_30px_rgba(20,18,13,0.08)]"
          >
            <div className="mb-5">{mat.icon}</div>
            <div className="font-serif text-[20px] font-normal text-[#14120D] mb-2.5 tracking-[0.02em]">
              {mat.title}
            </div>
            <p className="text-[10px] font-light tracking-[0.1em] text-[#7A7060] leading-[1.8]">
              {mat.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
