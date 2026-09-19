'use client'

import BrandButton from '@/components/ui/BrandButton'

const positionClasses = {
  left: 'items-center justify-start text-left', center: 'items-center justify-center text-center', right: 'items-center justify-end text-right',
  'bottom-left': 'items-end justify-start text-left', 'bottom-center': 'items-end justify-center text-center', 'bottom-right': 'items-end justify-end text-right',
}

export default function AboutHero({ content }) {
  if (!content?.is_enabled) return null
  const position = positionClasses[content.overlay_position] ?? positionClasses.left
  const hasCopy = content.show_text_overlay && (content.heading || content.paragraph || (content.show_button && content.button_label && content.button_link))
  const desktop = content.desktop_media_url || ''
  const mobile = content.mobile_media_url || desktop
  const poster = content.video_poster_url || ''

  const media = content.media_type === 'video' && desktop ? <>
    <video className="hidden size-full object-cover sm:block" autoPlay muted loop playsInline poster={poster || undefined} aria-label={content.media_alt || undefined}><source src={desktop} /></video>
    <video className="size-full object-cover sm:hidden" autoPlay muted loop playsInline poster={poster || undefined} aria-label={content.media_alt || undefined}><source src={mobile} /></video>
  </> : desktop ? <picture className="block size-full"><source media="(max-width: 639px)" srcSet={mobile} /><img src={desktop} alt={content.media_alt || ''} className="block size-full object-cover" /></picture> : <div className="size-full bg-white" />

  return <section className="relative w-full overflow-hidden bg-white" aria-label="About House of Diams">
    <div className="relative h-[520px] sm:hidden">{media}</div>
    <div className="relative hidden aspect-[5/2] sm:block">{media}</div>
    {hasCopy ? <div className={`pointer-events-none absolute inset-0 z-10 flex px-[var(--space-4)] py-[var(--space-10)] sm:px-[var(--space-8)] sm:py-0 lg:px-[var(--space-12)] xl:px-[var(--space-16)] ${position}`}>
      <div className={`w-full max-w-[42rem] py-[var(--space-6)] sm:py-[var(--space-10)] ${content.overlay_position?.includes('center') ? 'mx-auto' : ''}`}>
        {content.heading ? <h1 className="hero-slide-heading text-[clamp(1.75rem,7vw,2.25rem)] font-medium leading-[1.12] tracking-[-0.02em] text-white sm:text-[clamp(2.25rem,3.4vw,3.25rem)]">{content.heading}</h1> : null}
        {content.paragraph ? <p className="mt-[var(--space-2)] max-w-[38rem] font-[family-name:var(--font-family-secondary)] text-[clamp(0.75rem,2.8vw,0.95rem)] leading-[1.55] text-white/90 sm:text-[clamp(0.9rem,1.15vw,1.1rem)]">{content.paragraph}</p> : null}
        {content.show_button && content.button_label && content.button_link ? <BrandButton href={content.button_link} className="pointer-events-auto mt-[var(--space-3)]">{content.button_label}</BrandButton> : null}
      </div>
    </div> : null}
  </section>
}
