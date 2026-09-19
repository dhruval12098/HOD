'use client'

import BrandButton from '@/components/ui/BrandButton'

export default function AboutWideBanner({ content }) {
  if (!content?.is_enabled || !content.desktop_image_url) return null
  const mobile = content.mobile_image_url || content.desktop_image_url
  return <section className="relative w-full overflow-hidden bg-white" aria-label={content.heading || 'About House of Diams'}>
    <picture className="block h-[520px] w-full sm:aspect-[5/2] sm:h-auto"><source media="(max-width: 639px)" srcSet={mobile} /><img src={content.desktop_image_url} alt={content.image_alt || ''} className="block size-full object-cover" loading="lazy" /></picture>
    {(content.heading || content.paragraph || (content.show_button && content.button_label && content.button_link)) ? <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center px-[var(--space-4)] pb-[var(--space-10)] text-center sm:px-[var(--space-8)] sm:pb-[var(--space-10)] lg:px-[var(--space-12)] xl:px-[var(--space-16)]">
      <div className="mx-auto w-full max-w-[42rem] py-[var(--space-6)] sm:py-[var(--space-10)]">
        {content.heading ? <h2 className="hero-slide-heading text-[clamp(1.75rem,7vw,2.25rem)] font-medium leading-[1.12] tracking-[-0.02em] text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.35)] sm:text-[clamp(2.25rem,3.4vw,3.25rem)]">{content.heading}</h2> : null}
        {content.paragraph ? <p className="mx-auto mt-[var(--space-2)] max-w-[38rem] font-[family-name:var(--font-family-secondary)] text-[clamp(0.75rem,2.8vw,0.95rem)] leading-[1.55] text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] sm:text-[clamp(0.9rem,1.15vw,1.1rem)]">{content.paragraph}</p> : null}
        {content.show_button && content.button_label && content.button_link ? <BrandButton href={content.button_link} className="pointer-events-auto mx-auto mt-[var(--space-3)]">{content.button_label}</BrandButton> : null}
      </div>
    </div> : null}
  </section>
}

