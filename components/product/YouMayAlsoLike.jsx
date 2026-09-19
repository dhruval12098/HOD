'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import { getProductKey } from '@/lib/product-keys';

/**
 * @param {{
 *   products: any[]
 *   wishlist?: string[]
 *   onWishlist?: (product: any) => void
 *   onEnquire?: (...args: any[]) => void
 * }} props
 */
export default function YouMayAlsoLike({ products, wishlist = [], onWishlist, onEnquire }) {
  const scrollerRef = useRef(null);
  if (!Array.isArray(products) || products.length === 0) return null;

  const scroll = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({ left: direction * Math.max(scroller.clientWidth * 0.72, 280), behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="you-may-also-like-heading" className="mt-[clamp(48px,6vw,88px)] bg-[var(--color-brand-tertiary,#fff)] px-[var(--space-2)] py-[var(--space-8)] sm:px-[var(--space-3)] sm:py-[var(--space-10)] xl:py-[var(--space-12)]">
      <div className="mb-[var(--space-6)] flex items-end justify-between gap-4 px-1 sm:mb-[var(--space-8)] xl:mb-[var(--space-12)]">
        <h2 id="you-may-also-like-heading" className="section-title text-[clamp(1.35rem,2.2vw,2rem)] font-medium uppercase leading-none tracking-[0.025em] text-[var(--color-brand-primary,#000)]">You May Also Like</h2>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => scroll(-1)} className="inline-flex h-10 w-10 items-center justify-center border border-black/20 bg-white text-black transition hover:border-black" aria-label="Previous products"><ChevronLeft size={19} strokeWidth={1.5} /></button>
          <button type="button" onClick={() => scroll(1)} className="inline-flex h-10 w-10 items-center justify-center border border-black/20 bg-white text-black transition hover:border-black" aria-label="Next products"><ChevronRight size={19} strokeWidth={1.5} /></button>
        </div>
      </div>

      <div ref={scrollerRef} className="-mx-[var(--space-2)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--space-2)] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="You May Also Like product carousel">
        {products.map((product) => (
          <div key={product.id} className="w-[62vw] max-w-[260px] shrink-0 snap-start sm:w-[240px] lg:w-[260px]">
            <ProductCard product={product} wishlisted={wishlist.includes(getProductKey(product))} onWishlist={() => onWishlist?.(product)} onEnquire={onEnquire} forceLight />
          </div>
        ))}
      </div>
    </section>
  );
}