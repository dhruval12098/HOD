'use client';

import type { CollectionPageConfig } from '@/lib/home-data';
import { FindYourMatchQuiz } from '@/components/home/FindYourMatchQuiz';

export default function CollectionShowcase({ config }: { config: CollectionPageConfig }) {
  const desktopImage = config.showcaseImageUrl || config.showcaseMobileImageUrl || '';
  const mobileImage = config.showcaseMobileImageUrl || desktopImage;

  return (
    <section className="relative w-full overflow-hidden bg-black" aria-labelledby="collection-showcase-heading">
      <picture className="block h-[520px] w-full sm:aspect-[5/2] sm:h-auto">
        {mobileImage ? <source media="(max-width: 639px)" srcSet={mobileImage} /> : null}
        {desktopImage ? <img src={desktopImage} alt={config.showcaseHeading || 'Collection showcase'} className="block size-full object-cover object-center" loading="lazy" /> : <span className="block size-full bg-black" />}
      </picture>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
      <div className="absolute inset-0 z-10 flex items-end px-[var(--space-4)] pb-[var(--space-10)] sm:items-center sm:px-[var(--space-8)] sm:pb-0 lg:px-[var(--space-12)] xl:px-[var(--space-16)]">
        <div className="w-full max-w-[42rem] py-[var(--space-6)] sm:py-[var(--space-10)]">
          <h2 id="collection-showcase-heading" className="hero-slide-heading text-[clamp(1.75rem,7vw,2.25rem)] font-medium leading-[1.12] tracking-[-0.02em] text-white sm:text-[clamp(2.25rem,3.4vw,3.25rem)]">
            {config.showcaseHeading || 'Collection'}
          </h2>
          <p className="mt-[var(--space-2)] max-w-[38rem] font-[family-name:var(--font-family-secondary)] text-[clamp(0.75rem,2.8vw,0.95rem)] leading-[1.55] text-white/90 sm:text-[clamp(0.9rem,1.15vw,1.1rem)]">
            {config.showcaseSubtitle || 'Browse House of Diams collection pieces in a dedicated enquiry-first showcase.'}
          </p>
          <div className="pointer-events-auto">
            <FindYourMatchQuiz />
          </div>
        </div>
      </div>
    </section>
  );
}
