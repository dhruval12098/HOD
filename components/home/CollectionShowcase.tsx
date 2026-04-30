'use client';

import Link from 'next/link';
import type { CollectionPageConfig } from '@/lib/home-data';

export default function CollectionShowcase({ config }: { config: CollectionPageConfig }) {
  const imageUrl = config.showcaseImageUrl || config.showcaseMobileImageUrl || '';

  return (
    <section className="relative isolate min-h-[360px] overflow-hidden md:min-h-[460px] lg:min-h-[560px]">
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
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.22),transparent_36%),linear-gradient(135deg,#f7f1e7_0%,#eadfce_42%,#dcc9ab_100%)]" />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,247,240,0.94)_0%,rgba(250,247,240,0.78)_34%,rgba(250,247,240,0.42)_62%,rgba(250,247,240,0.14)_100%)]" />

      <div className="relative z-10 flex min-h-[360px] items-end px-5 py-12 md:min-h-[460px] md:px-8 md:py-16 lg:min-h-[560px] lg:px-12 lg:py-20">
        <div className="max-w-[620px]">
          <p className="mb-5 font-sans text-[10px] uppercase tracking-[0.34em] text-[#0A1628]/68 md:mb-6">
            House of Diams Collection
          </p>

          <h2
            className="font-serif font-light leading-[0.96] tracking-[0.01em] text-[#0A1628]"
            style={{ fontSize: 'clamp(42px, 7vw, 88px)' }}
          >
            {config.showcaseHeading || 'Collection'}
          </h2>

          <p className="mt-6 max-w-[540px] text-[15px] leading-[1.9] text-[#0A1628]/76 md:text-[16px]">
            {config.showcaseSubtitle || 'Browse House of Diams collection pieces in a dedicated enquiry-first showcase.'}
          </p>

          <Link
            href={config.showcaseCtaHref || '/collection'}
            className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#0A1628]/14 bg-[#0A1628] px-7 py-3.5 font-sans text-[10px] uppercase tracking-[0.28em] text-white transition hover:bg-white hover:text-[#0A1628]"
          >
            {config.showcaseCtaLabel || 'Explore Collection'}
            <span className="text-sm">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
