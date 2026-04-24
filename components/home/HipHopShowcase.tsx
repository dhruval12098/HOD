"use client";

import Link from "next/link";
import { useState } from "react";
import type { HomeHipHopSection } from '@/lib/home-data';

const DiamondPlaceholder = () => (
  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" className="opacity-[0.08]">
    <polygon points="50,6 90,34 74,90 26,90 10,34" stroke="var(--theme-ink)" strokeWidth="4" fill="none" />
    <polygon points="50,20 72,38 62,74 38,74 28,38" fill="var(--theme-ink)" opacity={0.25} />
    <line x1="10" y1="34" x2="90" y2="34" stroke="var(--theme-ink)" strokeWidth="2" opacity={0.3} />
    <line x1="50" y1="6" x2="10" y2="34" stroke="var(--theme-ink)" strokeWidth="2" opacity={0.4} />
    <line x1="50" y1="6" x2="90" y2="34" stroke="var(--theme-ink)" strokeWidth="2" opacity={0.4} />
    <line x1="26" y1="90" x2="10" y2="34" stroke="var(--theme-ink)" strokeWidth="1" opacity={0.2} />
    <line x1="74" y1="90" x2="90" y2="34" stroke="var(--theme-ink)" strokeWidth="1" opacity={0.2} />
    <polygon points="22,62 28,68 22,74 16,68" fill="var(--theme-ink)" opacity={0.12} />
    <polygon points="72,20 76,25 72,30 68,25" fill="var(--theme-ink)" opacity={0.1} />
    <polygon points="80,72 84,77 80,82 76,77" fill="var(--theme-ink)" opacity={0.08} />
    <circle cx="30" cy="30" r="4" fill="var(--theme-ink)" opacity={0.1} />
    <circle cx="78" cy="55" r="3" fill="var(--theme-ink)" opacity={0.08} />
  </svg>
);

type HipHopSection = {
  eyebrow: string;
  heading_line_1: string;
  heading_line_2: string;
  heading_emphasis: string;
  cta_label: string;
  cta_link: string;
  image_path: string;
  image_alt: string;
};

const defaultSection: HipHopSection = {
  eyebrow: "Hip Hop Collection · House of Diams",
  heading_line_1: "Ice That",
  heading_line_2: "Speaks",
  heading_emphasis: "Louder.",
  cta_label: "Shop Iced Pieces",
  cta_link: "/hiphop",
  image_path: "",
  image_alt: "House of Diams Hip Hop Collection",
};

function buildImageUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? "hod";
  return base ? `${base}/storage/v1/object/public/${bucket}/${path}` : "";
}

export default function HipHopSection({ initialSection }: { initialSection?: HomeHipHopSection }) {
  const [section] = useState<HipHopSection>(initialSection ?? defaultSection);

  return (
    <>
      <style>{`
        .hh-right:hover .hh-placeholder { transform: scale(1.03); }
        .hh-btn:hover .hh-arr { transform: translateX(5px); }
      `}</style>

      <section className="grid min-h-[600px] w-full grid-cols-2 overflow-hidden bg-[var(--theme-base)] max-[960px]:grid-cols-1">
        <div className="flex flex-col justify-center pl-20 pr-16 py-[88px] max-[960px]:px-7 max-[960px]:py-16">
          <p className="mb-7 font-sans text-[8.5px] font-normal uppercase tracking-[.32em] text-[var(--theme-ink)] opacity-65">
            {section.eyebrow}
          </p>

          <h2
            className="mb-10 font-serif font-light leading-none tracking-[.01em] text-[var(--theme-heading)]"
            style={{ fontSize: "clamp(52px, 6.5vw, 88px)" }}
          >
            {section.heading_line_1}
            <br />
            {section.heading_line_2}
            <br />
            <em className="block italic text-[var(--theme-ink)]">{section.heading_emphasis}</em>
          </h2>

          <Link
            href={section.cta_link}
            className="hh-btn inline-flex w-fit items-center gap-3 border-[1.5px] border-[var(--theme-ink)] bg-[var(--theme-ink)] px-9 py-4 font-sans text-[9px] font-normal uppercase tracking-[.26em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[var(--theme-ink)]"
          >
            {section.cta_label}
            <span className="hh-arr text-[15px] transition-transform duration-300">→</span>
          </Link>
        </div>

        <div className="hh-right relative flex items-center justify-center overflow-hidden bg-[var(--theme-surface-soft)] max-[960px]:min-h-[320px]">
          <div className="absolute top-0 left-0 bottom-0 z-10 w-20 bg-gradient-to-r from-[var(--theme-base)] to-transparent pointer-events-none" />

          {section.image_path ? (
            <img
              src={buildImageUrl(section.image_path)}
              alt={section.image_alt}
              className="hh-placeholder absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(.4,0,.2,1)]"
              loading="lazy"
            />
          ) : (
            <div className="hh-placeholder absolute inset-0 flex flex-col items-center justify-center gap-4 transition-transform duration-[800ms] ease-[cubic-bezier(.4,0,.2,1)]">
              <DiamondPlaceholder />
              <span className="mt-2 font-sans text-[8px] uppercase tracking-[.2em] text-[var(--theme-ink)] opacity-30">
                Add your hip hop image here
              </span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
