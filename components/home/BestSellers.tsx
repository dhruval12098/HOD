'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { cinzelFont } from '@/app/fonts'
import type { HomeBestSellerProduct, HomeBestSellerSection } from '@/lib/home-data'
import { useMobileSnapCarousel } from './useMobileSnapCarousel'

type SectionData = {
  eyebrow: string
  heading: string
  cta_label: string
  cta_href: string
}

function RevealDiv({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          entries[0].target.classList.add('opacity-100', 'translate-y-0')
          entries[0].target.classList.remove('opacity-0', 'translate-y-6')
          obs.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px' }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-6 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function BestSellerTile({ product }: { product: HomeBestSellerProduct }) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = product.image?.trim()

  return (
    <Link
      href={`/shop/${product.slug}`}
      aria-label={`Shop ${product.name}`}
      className="group relative block aspect-square overflow-hidden bg-[var(--color-brand-secondary,#F9F9F9)] no-underline outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand-primary,#000)]"
    >
      {imageUrl && !imageFailed ? (
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] motion-safe:group-hover:scale-[1.035]"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-[var(--space-4)] text-center font-[family-name:var(--font-family-secondary)] text-xs uppercase tracking-[0.18em] text-[var(--color-brand-primary,#000)]">
          {product.name}
        </div>
      )}

      {imageUrl && !imageFailed ? (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
        />
      ) : null}

      <div className={`absolute inset-x-0 bottom-0 z-10 p-[var(--space-3)] sm:p-[var(--space-4)] lg:p-[var(--space-5)] ${imageUrl && !imageFailed ? 'text-[var(--color-brand-accent,#fff)]' : 'text-[var(--color-brand-primary,#000)]'}`}>
        <h3 className="!font-[family-name:var(--font-family-secondary)] text-[11px] font-semibold uppercase leading-[1.25] tracking-[0.1em] sm:text-sm lg:text-base">
          {product.name}
        </h3>
        <span className="mt-1.5 inline-block border-b border-current pb-0.5 font-[family-name:var(--font-family-button)] text-[9px] font-medium uppercase tracking-[0.14em] sm:mt-2 sm:text-[10px]">
          Shop Now
        </span>
      </div>
    </Link>
  )
}

export default function BestSellers({
  initialSection,
  initialProducts = [],
}: {
  initialSection?: HomeBestSellerSection
  initialProducts?: HomeBestSellerProduct[]
}) {
  const section: SectionData =
    initialSection ?? {
      eyebrow: 'House of Diams',
      heading: 'Our Best Sellers',
      cta_label: 'View All Collection',
      cta_href: '/shop',
    }
  const products = initialProducts
  const { scrollerRef, pauseAutoplay, dragHandlers } = useMobileSnapCarousel()

  const headingParts = (() => {
    const parts = section.heading.trim().split(/\s+/)
    if (parts.length < 2) return { start: section.heading, emphasis: '' }
    return {
      start: parts.slice(0, -1).join(' '),
      emphasis: parts[parts.length - 1],
    }
  })()

  const desktopGridColumns =
    products.length === 1
      ? 'lg:grid-cols-1'
      : products.length === 2
        ? 'lg:grid-cols-2'
        : 'lg:grid-cols-3'

  if (!products.length) return null

  return (
    <section className="w-full px-[var(--space-2)] py-[var(--space-6)] sm:px-[var(--space-3)] sm:py-[var(--space-8)] lg:px-[var(--space-4)] lg:py-[var(--space-12)]">
      <RevealDiv className="mb-[var(--space-6)] flex flex-wrap items-end justify-between gap-[var(--space-4)] px-[var(--space-1)] sm:mb-[var(--space-8)] lg:mb-[var(--space-12)]">
        <div>
          <h2
            className={`${cinzelFont.variable} font-primary-display section-title font-light leading-[1.08] tracking-[0.01em] text-[var(--theme-heading)] max-md:text-[28px]`}
            style={{ fontSize: 'clamp(24px, 4.5vw, 54px)', fontWeight: 400 }}
          >
            {headingParts.start}{' '}
            {headingParts.emphasis ? (
              <em className="not-italic">
                {headingParts.emphasis}
              </em>
            ) : null}
          </h2>
        </div>

        <Link
          href={section.cta_href}
          className="flex items-center gap-3 border-b border-[var(--theme-ink)] pb-1 font-[family-name:var(--font-family-primary)] text-[clamp(0.7rem,0.85vw,0.9rem)] font-semibold uppercase tracking-[0.08em] text-[var(--theme-ink)] no-underline transition-[gap] duration-300 hover:gap-5"
        >
          {section.cta_label} →
        </Link>
      </RevealDiv>

      <RevealDiv delay={150}>
        <div
          ref={scrollerRef}
          {...dragHandlers}
          onTouchStart={pauseAutoplay}
          onTouchEnd={pauseAutoplay}
          onWheel={pauseAutoplay}
          onKeyDown={pauseAutoplay}
          className="-mx-[var(--space-2)] flex snap-x snap-mandatory gap-[var(--space-2)] overflow-x-auto px-[var(--space-2)] pb-2 [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden"
          aria-label={section.heading + ' carousel'}
        >
          {products.map((product) => (
            <div key={product.id} className="w-[76vw] max-w-[320px] shrink-0 snap-start">
              <BestSellerTile product={product} />
            </div>
          ))}
        </div>
        <div className={`hidden grid-cols-2 gap-[var(--space-1)] sm:grid sm:gap-[var(--space-2)] lg:gap-[var(--space-3)] ${desktopGridColumns}`}>
          {products.map((product) => (
            <BestSellerTile key={product.id} product={product} />
          ))}
        </div>
      </RevealDiv>
    </section>
  )
}

