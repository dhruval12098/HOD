import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { ShopByCategoryData } from '@/lib/shop-by-category'

export default function ShopByCategory({ data }: { data: ShopByCategoryData | null }) {
  if (!data) return null
  const style = { '--shop-cols-mobile': data.mobileColumns, '--shop-cols-tablet': data.tabletColumns, '--shop-cols-desktop': data.desktopColumns } as CSSProperties
  return <section className="bg-[var(--color-brand-tertiary,#fff)] px-[var(--space-2)] py-[var(--space-12)] sm:px-[var(--space-3)] sm:py-[var(--space-16)] xl:py-[var(--space-24)]" aria-labelledby="shop-by-category-heading">
    <div className="mb-[var(--space-6)] flex items-end justify-between gap-4 px-1 sm:mb-[var(--space-8)] xl:mb-[var(--space-12)]">
      <h2 id="shop-by-category-heading" className="shop-category-heading section-title text-[clamp(1.35rem,2.2vw,2rem)] font-medium uppercase leading-none tracking-[0.025em] text-[var(--color-brand-primary,#000)]">{data.heading}</h2>
      {data.shopAllLabel && data.shopAllLink ? <Link href={data.shopAllLink} className="shrink-0 font-[family-name:var(--font-family-button)] text-[0.7rem] font-medium uppercase tracking-[0.14em] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">{data.shopAllLabel}</Link> : null}
    </div>
    <div className="shop-category-grid grid gap-[3px]" style={style}>
      {data.cards.map((card) => <Link key={card.id} href={card.href} className="group relative aspect-[4/5] overflow-hidden bg-[var(--color-brand-secondary,#F9F9F9)] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
        {card.imageUrl ? <Image src={card.imageUrl} alt={card.imageAlt} fill sizes={`(max-width: 639px) ${Math.ceil(100/data.mobileColumns)}vw, (max-width: 1023px) ${Math.ceil(100/data.tabletColumns)}vw, ${Math.ceil(100/data.desktopColumns)}vw`} className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"/> : <div className="flex h-full items-center justify-center bg-[var(--color-brand-secondary,#F9F9F9)] px-5 text-center font-[family-name:var(--font-family-secondary)] text-xs uppercase tracking-[0.12em] text-black/45">Image coming soon</div>}
        <span className="absolute inset-x-0 bottom-0 px-[var(--space-3)] py-[var(--space-4)] text-center font-[family-name:var(--font-family-secondary)] text-[clamp(0.58rem,0.9vw,0.72rem)] font-medium uppercase tracking-[0.09em] text-[var(--color-brand-accent,#fff)] [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">{card.name}</span>
      </Link>)}
    </div>
  </section>
}
