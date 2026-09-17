'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { ShopByCategoryData } from '@/lib/shop-by-category'
import { useMobileSnapCarousel } from './useMobileSnapCarousel'

export default function ShopByCategory({ data }: { data: ShopByCategoryData | null }) {
  const { scrollerRef, pauseAutoplay, dragHandlers } = useMobileSnapCarousel()

  if (!data) return null
  const style = { '--shop-cols-mobile': data.mobileColumns, '--shop-cols-tablet': data.tabletColumns, '--shop-cols-desktop': data.desktopColumns } as CSSProperties
  return <section className="bg-[var(--color-brand-tertiary,#fff)] px-[var(--space-2)] py-[var(--space-6)] sm:px-[var(--space-3)] sm:py-[var(--space-8)] xl:py-[var(--space-12)]" aria-labelledby="shop-by-category-heading">
    <div className="mb-[var(--space-6)] flex items-end justify-between gap-4 px-1 sm:mb-[var(--space-8)] xl:mb-[var(--space-12)]">
      <h2 id="shop-by-category-heading" className="shop-category-heading section-title text-[clamp(1.35rem,2.2vw,2rem)] font-medium uppercase leading-none tracking-[0.025em] text-[var(--color-brand-primary,#000)]">{data.heading}</h2>
      {data.shopAllLabel && data.shopAllLink ? <Link href={data.shopAllLink} className="flex shrink-0 items-center gap-3 border-b border-[var(--theme-ink)] pb-1 font-[family-name:var(--font-family-primary)] text-[clamp(0.7rem,0.85vw,0.9rem)] font-semibold uppercase tracking-[0.08em] text-[var(--theme-ink)] no-underline transition-[gap] duration-300 hover:gap-5 focus-visible:outline-2 focus-visible:outline-offset-4">{data.shopAllLabel} →</Link> : null}
    </div>
    <div
      ref={scrollerRef}
      {...dragHandlers}
      onTouchStart={pauseAutoplay}
      onTouchEnd={pauseAutoplay}
      onWheel={pauseAutoplay}
      onKeyDown={pauseAutoplay}
      className="-mx-[var(--space-2)] flex snap-x snap-mandatory gap-2 overflow-x-auto px-[var(--space-2)] pb-2 [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden"
      aria-label={data.heading + ' carousel'}
    >
      {data.cards.map((card) => <Link key={card.id} href={card.href} className="group relative aspect-[4/5] w-[72vw] max-w-[300px] shrink-0 snap-start overflow-hidden bg-[var(--color-brand-secondary,#F9F9F9)] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
        {card.imageUrl ? <Image src={card.imageUrl} alt={card.imageAlt} fill sizes="72vw" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"/> : <div className="flex h-full items-center justify-center bg-[var(--color-brand-secondary,#F9F9F9)] px-5 text-center font-[family-name:var(--font-family-secondary)] text-xs uppercase tracking-[0.12em] text-black/45">Image coming soon</div>}
        <span className="absolute inset-x-0 bottom-0 px-[var(--space-3)] py-[var(--space-4)] text-center font-[family-name:var(--font-family-secondary)] text-[clamp(0.58rem,0.9vw,0.72rem)] font-medium uppercase tracking-[0.09em] text-[var(--color-brand-accent,#fff)] [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">{card.name}</span>
      </Link>)}
    </div>
    <div className="shop-category-grid hidden gap-[3px] sm:grid" style={style}>
      {data.cards.map((card) => <Link key={card.id} href={card.href} className="group relative aspect-[4/5] overflow-hidden bg-[var(--color-brand-secondary,#F9F9F9)] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
        {card.imageUrl ? <Image src={card.imageUrl} alt={card.imageAlt} fill sizes={`(max-width: 1023px) ${Math.ceil(100/data.tabletColumns)}vw, ${Math.ceil(100/data.desktopColumns)}vw`} className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"/> : <div className="flex h-full items-center justify-center bg-[var(--color-brand-secondary,#F9F9F9)] px-5 text-center font-[family-name:var(--font-family-secondary)] text-xs uppercase tracking-[0.12em] text-black/45">Image coming soon</div>}
        <span className="absolute inset-x-0 bottom-0 px-[var(--space-3)] py-[var(--space-4)] text-center font-[family-name:var(--font-family-secondary)] text-[clamp(0.58rem,0.9vw,0.72rem)] font-medium uppercase tracking-[0.09em] text-[var(--color-brand-accent,#fff)] [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">{card.name}</span>
      </Link>)}
    </div>
  </section>
}

