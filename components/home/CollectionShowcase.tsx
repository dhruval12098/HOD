'use client';

import Link from 'next/link';
import type { CollectionPageConfig } from '@/lib/home-data';

export default function CollectionShowcase({ config }: { config: CollectionPageConfig }) {
  const imageUrl = config.showcaseImageUrl || config.showcaseMobileImageUrl || '';

  return (
    <section className="bg-[var(--theme-surface-warm)] px-5 py-16 md:px-8 md:py-24 lg:px-12 lg:py-30">
      <div className="mx-auto grid max-w-[1400px] items-end gap-8 md:grid-cols-[1.4fr_1fr] md:gap-14 lg:gap-20">
        <div className="relative aspect-[3/4] min-h-[420px] overflow-hidden bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.32),transparent_36%),linear-gradient(135deg,#f7f1e7_0%,#eadfce_42%,#dcc9ab_100%)] md:min-h-[580px]">
          {imageUrl ? (
            <picture>
              {config.showcaseMobileImageUrl ? <source media="(max-width: 960px)" srcSet={config.showcaseMobileImageUrl} /> : null}
              <img
                src={imageUrl}
                alt={config.showcaseHeading || 'Collection showcase'}
                className="absolute inset-0 h-full w-full object-cover object-center"
                loading="lazy"
              />
            </picture>
          ) : null}
        </div>

        <div className="pb-0 md:pb-16 lg:pb-20">
          <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#8B7B5C]">
            The featured edit
          </div>
          <div className="mt-5 h-px w-16 bg-[#0A1628]" />
          <h2
            className="mt-7 font-display-title font-light uppercase leading-[1.05] tracking-[0.01em] text-[#0A1628]"
            style={{ fontSize: 'clamp(36px, 5vw, 52px)' }}
          >
            {config.showcaseHeading || 'Collection'}
          </h2>

          <p className="mt-6 max-w-[460px] text-[15px] font-light leading-[1.9] tracking-[0.02em] text-[#6A6A6A] md:text-[16px]">
            {config.showcaseSubtitle || 'Browse House of Diams collection pieces in a dedicated enquiry-first showcase.'}
          </p>

          <Link
            href={config.showcaseCtaHref || '/collection'}
            className="mt-8 inline-flex items-center gap-3 border border-[#0A1628] bg-[#0A1628] px-9 py-3.5 font-sans text-[10px] uppercase tracking-[0.28em] text-[#FAF7F2] transition hover:bg-transparent hover:text-[#0A1628]"
          >
            {config.showcaseCtaLabel || 'Explore Collection'}
            <span className="text-sm">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
