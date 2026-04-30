'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { HomeBestSellerProduct, HomeBestSellerSection } from '@/lib/home-data'
import { useWishlistStore } from '@/lib/hooks/useWishlistStore'
import { getProductKey } from '@/lib/product-keys'
import ProductCard from '@/components/shop/ProductCard'

type Product = {
  dbId: string
  id: string
  slug: string
  name: string
  shortMeta: string
  priceFrom: number
  featured?: boolean
  isNew?: boolean
  category?: string
  imageUrl?: string
  metalsFull?: { id: string; name: string; slug: string; colorHex?: string | null }[]
}

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

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      {direction === 'left' ? (
        <path d="M15 6L9 12L15 18" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 6L15 12L9 18" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

export default function BestSellers({
  initialSection,
  initialProducts = [],
}: {
  initialSection?: HomeBestSellerSection
  initialProducts?: HomeBestSellerProduct[]
}) {
  const [section] = useState<SectionData>(
    initialSection ?? {
      eyebrow: 'House of Diams',
      heading: 'Our Best Sellers',
      cta_label: 'View All Collection',
      cta_href: '/shop',
    }
  )
  const { wishlist, toggle } = useWishlistStore()
  const [products] = useState<Product[]>(
    initialProducts.map((product) => ({
      dbId: product.id,
      id: product.id,
      slug: product.slug,
      name: product.name,
      shortMeta: product.meta,
      priceFrom: Number(String(product.price).replace(/[^0-9.]/g, '')) || 0,
      featured: product.badge !== 'Bestseller',
      isNew: false,
      category: product.detailTemplate === 'hiphop' ? 'hiphop' : 'fine-jewellery',
      imageUrl: product.image,
      metalsFull: product.metalsFull,
    }))
  )
  const [visibleCount, setVisibleCount] = useState(4)
  const [page, setPage] = useState(0)

  const headingParts = useMemo(() => {
    const parts = section.heading.trim().split(/\s+/)
    if (parts.length < 2) return { start: section.heading, emphasis: '' }
    return {
      start: parts.slice(0, -1).join(' '),
      emphasis: parts[parts.length - 1],
    }
  }, [section.heading])

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1)
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2)
      } else {
        setVisibleCount(4)
      }
    }

    updateVisibleCount()
    window.addEventListener('resize', updateVisibleCount, { passive: true })
    return () => window.removeEventListener('resize', updateVisibleCount)
  }, [])

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(products.length / visibleCount) - 1)
    setPage((current) => Math.min(current, maxPage))
  }, [products.length, visibleCount])

  const totalPages = Math.max(1, Math.ceil(products.length / visibleCount))
  const showSliderControls = products.length > visibleCount

  if (!products.length) return null

  return (
    <section className="mx-auto max-w-[1400px] px-[52px] py-[110px] max-lg:px-7 max-md:px-5 max-md:py-[70px]">
      <RevealDiv className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mb-[14px] flex items-center gap-3 text-[8px] font-normal uppercase tracking-[0.28em] text-[var(--theme-ink)] opacity-60">
            <span className="inline-block h-px w-7 bg-[var(--theme-ink)]" />
            {section.eyebrow}
          </p>

          <h2
            className="font-serif font-light leading-[1.08] tracking-[0.01em] text-[var(--theme-heading)]"
            style={{ fontSize: 'clamp(32px, 4vw, 50px)' }}
          >
            {headingParts.start}{' '}
            {headingParts.emphasis ? (
              <em className="not-italic italic font-normal text-[var(--theme-ink)]">
                {headingParts.emphasis}
              </em>
            ) : null}
          </h2>
        </div>

        <a
          href={section.cta_href}
          className="flex items-center gap-2 border-b border-[var(--theme-border-strong)] pb-1 text-[8px] uppercase tracking-[0.22em] text-[var(--theme-ink)] no-underline transition-[gap] duration-300 hover:gap-[14px]"
        >
          {section.cta_label} →
        </a>
      </RevealDiv>

      <RevealDiv delay={150}>
        <div className="relative">
          {showSliderControls ? (
            <>
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={page === 0}
                aria-label="Previous products"
                className="absolute left-[-18px] top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--theme-border-strong)] bg-white text-[var(--theme-ink)] shadow-[0_14px_30px_rgba(10,22,40,0.12)] transition disabled:cursor-not-allowed disabled:opacity-35 lg:flex"
              >
                <Chevron direction="left" />
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                disabled={page >= totalPages - 1}
                aria-label="Next products"
                className="absolute right-[-18px] top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--theme-border-strong)] bg-white text-[var(--theme-ink)] shadow-[0_14px_30px_rgba(10,22,40,0.12)] transition disabled:cursor-not-allowed disabled:opacity-35 lg:flex"
              >
                <Chevron direction="right" />
              </button>
            </>
          ) : null}

          <div className="overflow-hidden">
            <div
              className="flex gap-0 transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)] sm:gap-5"
              style={{ transform: `translateX(-${page * 100}%)` }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="min-w-full sm:min-w-[calc(50%-10px)] lg:min-w-[calc(25%-15px)]"
                >
                  <ProductCard
                    product={product}
                    wishlisted={wishlist.includes(getProductKey(product))}
                    onWishlist={() => toggle(getProductKey(product))}
                    onEnquire={() => {}}
                    forceLight
                  />
                </div>
              ))}
            </div>
          </div>

          {showSliderControls ? (
            <div className="mt-5 flex items-center justify-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={page === 0}
                aria-label="Previous products"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-border-strong)] bg-white text-[var(--theme-ink)] disabled:opacity-35"
              >
                <Chevron direction="left" />
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPage(index)}
                    aria-label={`Go to product page ${index + 1}`}
                    className={`h-2 rounded-full transition-all ${index === page ? 'w-8 bg-[var(--theme-ink)]' : 'w-2 bg-[var(--theme-border-strong)]'}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                disabled={page >= totalPages - 1}
                aria-label="Next products"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-border-strong)] bg-white text-[var(--theme-ink)] disabled:opacity-35"
              >
                <Chevron direction="right" />
              </button>
            </div>
          ) : null}
        </div>
      </RevealDiv>
    </section>
  )
}
