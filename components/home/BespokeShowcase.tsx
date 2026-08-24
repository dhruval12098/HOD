'use client';

import { veloriaFont } from '@/app/fonts';
import type { HomeBespokeShowcaseSection } from '@/lib/home-data';

export default function BespokeShowcase({
  section,
  onEnquireClick,
}: {
  section: HomeBespokeShowcaseSection;
  onEnquireClick: () => void;
}) {
  const imageUrl = section.imageUrl || section.mobileImageUrl || '';

  return (
    <section className="bg-[var(--theme-surface-warm)] px-5 py-16 md:px-8 md:py-24 lg:px-12 lg:py-30">
      <div className="mx-auto grid max-w-[1400px] items-end gap-8 md:grid-cols-[1fr_1.4fr] md:gap-14 lg:gap-20">
        <div className="pb-0 md:pb-16 lg:pb-20">
          <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#8B7B5C]">
            {section.eyebrow || 'Bespoke Atelier'}
          </div>
          <div className="mt-5 h-px w-16 bg-[#0A1628]" />
          <h2
            className={`${veloriaFont.variable} font-test-veloria mt-7 font-light leading-[1.05] tracking-[0.01em] text-[#0A1628]`}
            style={{ fontSize: 'clamp(36px, 5vw, 52px)' }}
          >
            {section.heading || 'Create Something One of One'}
          </h2>

          <p className="mt-6 max-w-[460px] text-[15px] font-light leading-[1.9] tracking-[0.02em] text-[#6A6A6A] md:text-[16px]">
            {section.subtitle || 'Begin a bespoke commission with House of Diams, from first sketch to final setting.'}
          </p>

          <button
            type="button"
            onClick={onEnquireClick}
            className="mt-8 inline-flex items-center gap-3 border border-[#0A1628] bg-[#0A1628] px-9 py-3.5 font-sans text-[10px] uppercase tracking-[0.28em] text-[#FAF7F2] transition hover:bg-transparent hover:text-[#0A1628]"
          >
            {section.ctaLabel || 'Start Bespoke Enquiry'}
            <span className="text-sm">&rarr;</span>
          </button>
        </div>

        <div className="relative aspect-[3/4] min-h-[420px] overflow-hidden bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.42),transparent_36%),linear-gradient(135deg,#F5F7FC_0%,#EAF0FA_42%,#D8E2F2_100%)] md:min-h-[580px]">
          {imageUrl ? (
            <picture>
              {section.mobileImageUrl ? <source media="(max-width: 960px)" srcSet={section.mobileImageUrl} /> : null}
              <img
                src={imageUrl}
                alt={section.imageAlt || section.heading || 'House of Diams bespoke jewellery showcase'}
                className="absolute inset-0 h-full w-full object-cover object-center"
                loading="lazy"
              />
            </picture>
          ) : null}
        </div>
      </div>
    </section>
  );
}
