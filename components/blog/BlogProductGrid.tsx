'use client'

import ProductCard from '@/components/shop/ProductCard'
import type { StorefrontProduct } from '@/lib/catalog-products'

export default function BlogProductGrid({ products }: { products: StorefrontProduct[] }) {
  if (products.length === 0) return null

  return (
    <section aria-labelledby="shop-the-edit-title" className="bg-white px-[var(--space-2)] py-[var(--space-6)] sm:px-[var(--space-3)] sm:py-[var(--space-8)] xl:py-[var(--space-10)]">
      <div className="mb-[var(--space-6)] flex items-end justify-between gap-4 px-1 sm:mb-[var(--space-8)] xl:mb-[var(--space-10)]">
        <h2 id="shop-the-edit-title" className="section-title text-[clamp(1.35rem,2.2vw,2rem)] font-medium uppercase leading-none tracking-[0.025em] text-black">
          Shop the Edit
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-[3px] md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.dbId || product.slug}
            product={product}
            wishlisted={false}
            onWishlist={() => {}}
            onEnquire={() => {}}
            forceLight
          />
        ))}
      </div>
    </section>
  )
}
