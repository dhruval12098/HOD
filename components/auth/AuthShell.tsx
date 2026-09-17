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
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1600&q=85',
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
    }, 3600);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="bg-white">
      <div className="grid min-h-dvh md:grid-cols-[minmax(0,52.25%)_minmax(390px,47.75%)]">
        <div className="relative min-h-[42dvh] overflow-hidden border-b border-[var(--theme-border)] md:min-h-dvh md:border-b-0 md:border-r">
          {JEWELRY_IMAGES.map((image, index) => (
            <div
              key={image}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{
                opacity: index === activeImage ? 1 : 0,
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: index === 0 ? 'center top' : 'center',
              }}
            />
          ))}

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/42 via-black/12 to-transparent p-5 text-white sm:p-7">
            <div className="max-w-[390px]">
              <p className="font-primary-display text-[10px] font-semibold uppercase tracking-[0.24em]">{eyebrow}</p>
              <h1 className="mt-3 max-w-[11ch] font-primary-display text-[clamp(1.65rem,3.6vw,3rem)] font-medium leading-[1.02] text-white">
                {title}
              </h1>
              <p className="mt-3 max-w-[330px] font-secondary text-[12px] leading-5 text-white/84">{description}</p>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              {JEWELRY_IMAGES.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  onClick={() => setActiveImage(index)}
                  className={`h-1.5 transition-all ${
                    index === activeImage ? 'w-9 bg-white' : 'w-4 bg-white/45 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-h-[58dvh] items-center justify-center px-5 py-10 sm:px-8 md:min-h-dvh lg:px-12">
          <div className="w-full max-w-[390px]">
            {children}

            <div className="mt-8 border border-[var(--theme-border)] p-4 sm:p-5">
              <h2 className="font-primary-display text-[18px] font-medium leading-tight text-[var(--theme-ink)]">{asideTitle}</h2>
              <p className="mt-2 font-secondary text-[12px] leading-5 text-[var(--theme-muted)]">{asideBody}</p>
              <div className="mt-4 grid gap-2.5">
                {asidePoints.map((point) => (
                  <div key={point} className="flex items-center gap-2.5 font-secondary text-[12px] text-[var(--theme-ink)]">
                    <span className="h-1.5 w-1.5 border border-[var(--theme-ink)]" />
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
