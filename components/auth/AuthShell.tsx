'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type AuthShellProps = {
  eyebrow: string
  title: string
  description: string
  asideTitle: string
  asideBody: string
  asidePoints: string[]
  children: ReactNode
};

const JEWELRY_IMAGES = [
  'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1400&q=80',
];

export default function AuthShell({
  eyebrow,
  title,
  description,
  asideTitle,
  asideBody,
  asidePoints,
  children,
}: AuthShellProps) {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % JEWELRY_IMAGES.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.14),transparent_32%),linear-gradient(180deg,#fbf7f0_0%,#ffffff_46%,#f6f8fc_100%)] px-4 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-6">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-[-8%] top-[8%] h-64 w-64 rounded-full bg-[rgba(10,22,40,0.06)] blur-3xl" />
        <div className="absolute bottom-[-6%] right-[-5%] h-72 w-72 rounded-full bg-[rgba(184,149,74,0.16)] blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1180px] items-center gap-4 md:grid-cols-2 lg:gap-5">
        <div className="relative overflow-hidden rounded-[30px] border border-[var(--theme-border-strong)] shadow-[0_30px_90px_rgba(10,22,40,0.18)]">
          {JEWELRY_IMAGES.map((image, index) => (
            <div
              key={image}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{
                opacity: index === activeImage ? 1 : 0,
                backgroundImage: `linear-gradient(180deg,rgba(7,14,24,0.18),rgba(7,14,24,0.72)), url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_32%)]" />

          <div className="relative flex h-full min-h-[300px] flex-col justify-between p-5 text-white sm:p-6 lg:min-h-[calc(100vh-4.5rem)] lg:max-h-[calc(100vh-4.5rem)] lg:p-7">
            <div>
              <div className="mb-2.5 inline-flex items-center gap-3 text-[8px] uppercase tracking-[0.28em] text-[rgba(255,255,255,0.78)]">
                <span className="inline-block h-px w-8 bg-[rgba(212,175,55,0.8)]" />
                {eyebrow}
              </div>

              <h1 className="max-w-[11ch] text-[clamp(1.55rem,2.1vw,2.15rem)] leading-[1] text-white">
                {title}
              </h1>

              <p className="mt-3 max-w-[350px] text-[11px] leading-5 tracking-[0.02em] text-[rgba(255,255,255,0.8)] sm:text-[12px]">
                {description}
              </p>
            </div>

            <div className="mt-4 rounded-[24px] border border-white/12 bg-[rgba(8,14,24,0.34)] p-3.5 backdrop-blur-md sm:p-4">
              <h2 className="text-[16px] leading-tight text-white sm:text-[18px]">{asideTitle}</h2>
              <p className="mt-2 max-w-[360px] text-[10px] leading-4.5 tracking-[0.03em] text-[rgba(255,255,255,0.76)] sm:text-[11px]">
                {asideBody}
              </p>

              <div className="mt-3.5 flex items-center gap-2">
                {JEWELRY_IMAGES.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    aria-label={`Show image ${index + 1}`}
                    onClick={() => setActiveImage(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === activeImage ? 'w-10 bg-[#d4af37]' : 'w-4 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              <div className="mt-3.5 grid gap-2">
                {asidePoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-center gap-2.5 rounded-full border border-white/10 bg-black/10 px-3 py-2 text-[8px] uppercase tracking-[0.16em] text-[rgba(255,255,255,0.88)]"
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-[#d4af37]" />
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-[560px] rounded-[26px] border border-[rgba(10,22,40,0.08)] bg-[rgba(255,255,255,0.9)] p-4 shadow-[0_24px_80px_rgba(10,22,40,0.08)] backdrop-blur-xl sm:p-5 lg:min-h-[calc(100vh-4.5rem)] lg:max-h-[calc(100vh-4.5rem)] lg:p-6">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
