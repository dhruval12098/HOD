'use client';

import type { CollectionPageConfig } from '@/lib/home-data';
import { FindYourMatchQuiz } from '@/components/home/FindYourMatchQuiz';

export default function CollectionShowcase({ config }: { config: CollectionPageConfig }) {
  const imageUrl = config.showcaseImageUrl || config.showcaseMobileImageUrl || '';

  return (
    <section className="w-full bg-[var(--color-brand-accent,#fff)] py-[var(--space-12)] md:py-[var(--space-16)] lg:py-[var(--space-24)]">
      <div className="grid w-full overflow-hidden bg-[var(--color-brand-accent,#fff)] lg:h-[clamp(26.25rem,31vw,32.5rem)] lg:grid-cols-2">
        <div className="relative h-[20rem] overflow-hidden bg-[var(--color-brand-accent,#fff)] md:h-[22.5rem] lg:h-full">
          {imageUrl ? (
            <picture>
              {config.showcaseMobileImageUrl ? <source media="(max-width: 1023px)" srcSet={config.showcaseMobileImageUrl} /> : null}
              <img
                src={imageUrl}
                alt={config.showcaseHeading || 'Collection showcase'}
                className="absolute inset-0 h-full w-full object-cover object-center"
                loading="lazy"
              />
            </picture>
          ) : null}
        </div>

        <div className="flex items-center px-[var(--space-6)] py-[var(--space-12)] md:px-[var(--space-12)] md:py-[var(--space-16)] lg:px-[clamp(3rem,5vw,5rem)] lg:py-[var(--space-12)]">
          <div className="w-full max-w-[30rem]">
            <h2
              className="collection-showcase-heading leading-[1.08] tracking-[0.01em] text-[var(--color-brand-primary)]"
              style={{ fontSize: 'clamp(2rem, 3.2vw, 3.25rem)' }}
            >
              {config.showcaseHeading || 'Collection'}
            </h2>

            <p className="mt-[var(--space-6)] max-w-[28rem] font-[family-name:var(--font-family-secondary)] text-[15px] font-normal leading-[1.75] tracking-[0.01em] text-[#4E4E4E] md:text-base">
              {config.showcaseSubtitle || 'Browse House of Diams collection pieces in a dedicated enquiry-first showcase.'}
            </p>

            <FindYourMatchQuiz />
          </div>
        </div>
      </div>
    </section>
  );
}
