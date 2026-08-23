'use client';

import { useCallback, useEffect, useState } from 'react';
import ShopHero from '@/components/shop/ShopHero';
import ProductGrid from '@/components/shop/ProductGrid';
import EnquireModal from '@/components/home/EnquireModal';
import type { StorefrontProductCard } from '@/lib/catalog-products';

export type CategoryGridPoster = {
  id: string
  title?: string | null
  imageUrl: string
  imageAlt?: string | null
  linkUrl?: string | null
  insertAfter: number
  displayOrder: number
}

const clientFilterKeys = ['category', 'subcategory', 'option', 'shape', 'style', 'metal', 'certificate'] as const

function filtersFromHref(href: string, products: StorefrontProductCard[]) {
  const target = new URL(href, window.location.origin)
  const filters: Record<string, string[]> = {}

  for (const key of clientFilterKeys) {
    const value = target.searchParams.get(key)
    if (!value) continue

    if (key === 'certificate') {
      const certificateName = products
        .flatMap((product) => product.certificateNames ?? [])
        .find((name) => name.toLowerCase().trim().replace(/\s+/g, '-') === value)
      filters[key] = [certificateName ?? value]
      continue
    }

    filters[key] = [value]
  }

  const parsedPage = Number.parseInt(target.searchParams.get('page') ?? '1', 10)
  return { target, filters, page: Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1 }
}

export default function ShopClient({
  products,
  sourceProducts,
  heroTitle,
  heroSubtitle,
  heroDesktopImageUrl,
  heroMobileImageUrl,
  heroCtaLabel,
  heroCtaHref,
  heroBannerEnabled,
  initialFilters,
  initialPage = 1,
  filterGroups,
  headerBrowseSections,
  gridPosters,
}: {
  products: StorefrontProductCard[]
  sourceProducts?: StorefrontProductCard[]
  heroTitle?: string
  heroSubtitle?: string
  heroDesktopImageUrl?: string
  heroMobileImageUrl?: string
  heroCtaLabel?: string
  heroCtaHref?: string
  heroBannerEnabled?: boolean
  initialFilters?: Record<string, string[]>
  initialPage?: number
  filterGroups?: { id: string; title: string; options: { value: string; label: string }[] }[]
  gridPosters?: CategoryGridPoster[]
  headerBrowseSections?: {
    id: string
    title: string
    iconUrl?: string | null
    href?: string | null
    options: { label: string; href: string; type?: 'default' | 'swatch' | 'icon'; iconUrl?: string | null; colorHex?: string | null }[]
    emphasis?: 'section' | 'group'
  }[]
}) {
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [enquirePiece, setEnquirePiece] = useState('');
  const clientProducts = sourceProducts ?? products;
  const [activeFilters, setActiveFilters] = useState(initialFilters ?? {});
  const [activePage, setActivePage] = useState(initialPage);

  const applyClientBrowseHref = useCallback((href: string) => {
    const { target, filters, page } = filtersFromHref(href, clientProducts)
    if (target.origin !== window.location.origin || target.pathname !== window.location.pathname) return false

    setActiveFilters(filters)
    setActivePage(page)
    window.history.pushState(null, '', `${target.pathname}${target.search}${target.hash}`)
    return true
  }, [clientProducts])

  useEffect(() => {
    const handlePopState = () => {
      const { filters, page } = filtersFromHref(window.location.href, clientProducts)
      setActiveFilters(filters)
      setActivePage(page)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [clientProducts])

  const handleEnquire = (name: string = '') => {
    setEnquirePiece(name);
    setIsEnquireOpen(true);
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink) -mt-[118px] lg:-mt-[146px]">
      <ShopHero
        title={heroTitle}
        subtitle={heroSubtitle}
        desktopImageUrl={heroDesktopImageUrl}
        mobileImageUrl={heroMobileImageUrl}
        ctaLabel={heroCtaLabel}
        ctaHref={heroCtaHref}
        bannerEnabled={heroBannerEnabled}
        browseSections={headerBrowseSections}
        activeFilters={activeFilters}
        onBrowseNavigate={applyClientBrowseHref}
      />
      <ProductGrid
        key={`${JSON.stringify(activeFilters)}:${activePage}`}
        products={clientProducts}
        sourceProducts={clientProducts}
        initialFilters={activeFilters}
        initialPage={activePage}
        filterGroups={filterGroups}
        gridPosters={gridPosters}
        onEnquire={handleEnquire}
      />
      <EnquireModal open={isEnquireOpen} piece={enquirePiece} onClose={() => setIsEnquireOpen(false)} />
    </div>
  );
}
