'use client';

import { useState } from 'react';
import ShopHero from '@/components/shop/ShopHero';
import ProductGrid from '@/components/shop/ProductGrid';
import EnquireModal from '@/components/home/EnquireModal';
import type { StorefrontProduct } from '@/lib/catalog-products';

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
  filterGroups,
  headerBrowseSections,
}: {
  products: StorefrontProduct[]
  sourceProducts?: StorefrontProduct[]
  heroTitle?: string
  heroSubtitle?: string
  heroDesktopImageUrl?: string
  heroMobileImageUrl?: string
  heroCtaLabel?: string
  heroCtaHref?: string
  heroBannerEnabled?: boolean
  initialFilters?: Record<string, string[]>
  filterGroups?: { id: string; title: string; options: { value: string; label: string }[] }[]
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

  const handleEnquire = (name: string = '') => {
    setEnquirePiece(name);
    setIsEnquireOpen(true);
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      <ShopHero
        title={heroTitle}
        subtitle={heroSubtitle}
        desktopImageUrl={heroDesktopImageUrl}
        mobileImageUrl={heroMobileImageUrl}
        ctaLabel={heroCtaLabel}
        ctaHref={heroCtaHref}
        bannerEnabled={heroBannerEnabled}
        browseSections={headerBrowseSections}
      />
      <ProductGrid
        products={products}
        sourceProducts={sourceProducts ?? products}
        initialFilters={initialFilters}
        filterGroups={filterGroups}
        onEnquire={handleEnquire}
      />
      <EnquireModal open={isEnquireOpen} piece={enquirePiece} onClose={() => setIsEnquireOpen(false)} />
    </div>
  );
}
