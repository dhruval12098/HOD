'use client';

import { useEffect, useMemo, useState } from 'react';
import TrustStrip from '@/components/home/TrustStrip';
import Loader from '@/components/home/Loader';
import ShopHero from '@/components/shop/ShopHero';
import ProductGrid from '@/components/shop/ProductGrid';
import EnquireModal from '@/components/home/EnquireModal';
import type { StorefrontProduct } from '@/lib/catalog-products';

export default function ShopClient({
  products,
  sourceProducts,
  heroTitle,
  heroSubtitle,
  initialFilters,
  filterGroups,
  headerBrowseSections,
}: {
  products: StorefrontProduct[]
  sourceProducts?: StorefrontProduct[]
  heroTitle?: string
  heroSubtitle?: string
  initialFilters?: Record<string, string[]>
  filterGroups?: { id: string; title: string; options: { value: string; label: string }[] }[]
  headerBrowseSections?: {
    id: string
    title: string
    options: { label: string; href: string; type?: 'default' | 'swatch' }[]
  }[]
}) {
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [enquirePiece, setEnquirePiece] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const cacheKey = useMemo(() => `hod_collection_loader_${heroTitle || 'collection'}`, [heroTitle]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('page-loader-active', pageLoading);
    return () => {
      document.body.classList.remove('page-loader-active');
    };
  }, [pageLoading]);

  useEffect(() => {
    try {
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as { expiresAt?: number } | null;
        if (parsed?.expiresAt && parsed.expiresAt > Date.now()) {
          setPageLoading(false);
          return;
        }
      }
    } catch {}

    const timer = window.setTimeout(() => setPageLoading(false), 220);
    return () => window.clearTimeout(timer);
  }, [cacheKey]);

  const handlePageLoaderComplete = () => {
    setPageLoading(false);
    try {
      window.localStorage.setItem(cacheKey, JSON.stringify({ expiresAt: Date.now() + 1000 * 60 * 60 * 6 }));
    } catch {}
  };

  const handleEnquire = (name: string = '') => {
    setEnquirePiece(name);
    setIsEnquireOpen(true);
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      {pageLoading ? <Loader ready onComplete={handlePageLoaderComplete} /> : null}
      <ShopHero title={heroTitle} subtitle={heroSubtitle} browseSections={headerBrowseSections} />
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
