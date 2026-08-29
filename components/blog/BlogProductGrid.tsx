'use client'

import ProductCard from '@/components/shop/ProductCard'
import type { StorefrontProduct } from '@/lib/catalog-products'
import { veloriaFont } from '@/app/fonts'

export default function BlogProductGrid({ products }: { products: StorefrontProduct[] }) {
  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-[1180px] px-6 pb-16">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-[#A17842]">
            Selected Pieces
          </p>
          <h2 className={`${veloriaFont.variable} font-test-veloria text-[34px] font-light leading-none text-[#0A0A0A]`}>
            Shop the Edit
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.dbId}
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
