'use client';

import Link from 'next/link';
import type { CollectionPageConfig } from '@/lib/home-data';

export default function CollectionShowcase({ config }: { config: CollectionPageConfig }) {
  return (
    <section className="grid min-h-[600px] w-full grid-cols-2 overflow-hidden bg-[var(--theme-base)] max-[960px]:grid-cols-1">
      <div className="flex flex-col justify-center px-20 py-[88px] max-[960px]:px-7 max-[960px]:py-16">
        <p className="mb-7 font-sans text-[8.5px] font-normal uppercase tracking-[.32em] text-[var(--theme-ink)] opacity-65">
          House of Diams Collection
        </p>
        <h2
          className="mb-8 font-serif font-light leading-none tracking-[.01em] text-[var(--theme-heading)]"
          style={{ fontSize: 'clamp(48px, 6vw, 82px)' }}
        >
          {config.showcaseHeading}
        </h2>
        <p className="mb-10 max-w-[520px] text-[15px] leading-[1.9] text-[var(--theme-ink)] opacity-72">
          {config.showcaseSubtitle}
        </p>
        <Link
          href={config.showcaseCtaHref || '/collection'}
          className="inline-flex w-fit items-center gap-3 border-[1.5px] border-[var(--theme-ink)] bg-[var(--theme-ink)] px-9 py-4 font-sans text-[9px] font-normal uppercase tracking-[.26em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[var(--theme-ink)]"
        >
          {config.showcaseCtaLabel || 'Explore Collection'}
          <span className="text-[15px]">→</span>
        </Link>
      </div>
      <div className="relative flex items-center justify-center px-8 py-10 max-[960px]:min-h-[320px] max-[960px]:px-6 max-[960px]:py-8">
        <div className="relative aspect-square w-full max-w-[560px] overflow-hidden rounded-[22px] border border-[rgba(10,22,40,0.14)] bg-[linear-gradient(180deg,#faf7f0_0%,#f0eadf_100%)] shadow-[0_18px_48px_rgba(10,22,40,0.08)]">
          {config.showcaseImageUrl ? (
            <picture>
              {config.showcaseMobileImageUrl ? <source media="(max-width: 960px)" srcSet={config.showcaseMobileImageUrl} /> : null}
              <img src={config.showcaseImageUrl} alt={config.showcaseHeading || 'Collection showcase'} className="h-full w-full object-cover object-center" loading="lazy" />
            </picture>
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center text-[11px] uppercase tracking-[0.22em] text-[var(--theme-ink)] opacity-35">
              Upload a Collection showcase image in CMS
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
