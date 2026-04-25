'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { HomeBestSellerProduct, HomeBestSellerSection } from '@/lib/home-data'

type Product = {
  id: string
  slug: string
  name: string
  meta: string
  price: string
  badge: string
  badgeVariant: 'navy' | 'outline'
  image?: string
  placeholder: React.ReactNode
}

type SectionData = {
  eyebrow: string
  heading: string
  cta_label: string
  cta_href: string
}

function PlaceholderGem() {
  return (
    <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="30" stroke="var(--theme-ink)" strokeWidth="3" fill="none" />
      <circle cx="50" cy="50" r="24" stroke="var(--theme-ink)" strokeWidth="1" fill="none" opacity=".4" />
    </svg>
  )
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

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill={filled ? 'var(--theme-ink)' : 'none'}
      stroke={filled ? 'var(--theme-ink)' : 'var(--theme-muted-2)'}
      strokeWidth="1.5"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
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

function ProductCard({ product }: { product: Product }) {
  const [wishlisted, setWishlisted] = useState(false)

  return (
    <div className="group h-full overflow-hidden rounded-[22px] border border-[var(--theme-border)] bg-[var(--theme-surface)] transition-transform duration-[350ms] ease-[cubic-bezier(.4,0,.2,1)] hover:-translate-y-[3px] hover:z-[2]">
      <a href={`/shop/${product.slug}`} className="block no-underline">
        <div className="relative aspect-[1.08/1] overflow-hidden bg-white sm:aspect-square">
          <div
            className={[
              'absolute top-3 left-3 z-[2] text-[6.5px] tracking-[0.16em] uppercase px-[10px] py-1 font-medium',
              product.badgeVariant === 'navy'
                ? 'bg-[var(--theme-ink)] text-white'
                : 'border border-[var(--theme-border-strong)] bg-[var(--theme-surface)] text-[var(--theme-ink)]',
            ].join(' ')}
          >
            {product.badge}
          </div>

          <button
            onClick={(event) => {
              event.preventDefault()
              setWishlisted((value) => !value)
            }}
            className="absolute top-3 right-3 z-[2] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-[0.5px] border-[var(--theme-border-strong)] bg-[color:rgba(255,255,255,0.9)] transition-colors duration-200 hover:bg-[var(--theme-ink)]"
            aria-label="Toggle wishlist"
          >
            <HeartIcon filled={wishlisted} />
          </button>

          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 block h-full w-full object-cover object-center scale-[1.08] transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.12] sm:scale-100 sm:group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center opacity-10 transition-opacity duration-500 group-hover:opacity-[0.06]">
              {product.placeholder}
            </div>
          )}
        </div>

        <div className="px-[16px] pb-[18px] pt-4 sm:px-[18px] sm:pt-5 sm:pb-[22px]">
          <div className="mb-[5px] font-serif text-[17px] font-normal leading-[1.22] tracking-[0.02em] text-[var(--theme-heading)] sm:text-[19px]">
            {product.name}
          </div>

          <p className="mb-3 text-[7px] font-light uppercase leading-[1.75] tracking-[0.13em] text-[var(--theme-muted)] sm:mb-4 sm:text-[7.5px] sm:tracking-[0.14em]">
            {product.meta}
          </p>

          <div className="flex items-center justify-between">
            <span className="font-numeric text-[20px] font-light text-[var(--theme-heading)] sm:text-[22px]">
              {product.price}
            </span>

            <button
              onClick={(event) => event.preventDefault()}
              className="cursor-pointer border border-[var(--theme-ink)] bg-transparent px-[12px] py-[6px] text-[6.5px] font-medium uppercase tracking-[0.16em] text-[var(--theme-ink)] transition-colors duration-200 hover:bg-[var(--theme-ink)] hover:text-white sm:px-[14px] sm:py-[7px] sm:text-[7px] sm:tracking-[0.18em]"
            >
              Enquire
            </button>
          </div>
        </div>
      </a>
    </div>
  )
}

export default function BestSellers({
  initialSection,
  initialProducts = [],
}: {
  initialSection?: HomeBestSellerSection
  initialProducts?: HomeBestSellerProduct[]
}) {
  const [section] = useState<SectionData>(initialSection ?? {
    eyebrow: 'House of Diams',
    heading: 'Our Best Sellers',
    cta_label: 'View All Collection',
    cta_href: '/shop',
  })
  const [products] = useState<Product[]>(
    initialProducts.map((product) => ({
      ...product,
      placeholder: <PlaceholderGem />,
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
    <section className="max-w-[1400px] mx-auto px-[52px] py-[110px] max-lg:px-7 max-md:px-5 max-md:py-[70px]">
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
                  <ProductCard product={product} />
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
