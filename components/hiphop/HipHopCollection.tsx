'use client'

import { useMemo, useState } from 'react'
import type { StorefrontProduct } from '@/lib/catalog-products'
import { useWishlist } from './useWishlist'
import TypeFilterBar, { FilterType } from './TypeFilterBar'
import HipHopProductCard from './HipHopProductCard'

interface HipHopCollectionProps {
  products: StorefrontProduct[]
  onEnquire: (piece: string) => void
  onWishlistToast: (msg: string) => void
}

function getFiltered(products: StorefrontProduct[], type: FilterType): StorefrontProduct[] {
  if (type === 'all') return products
  if (type === 'others') return products.filter((product) => !['ring', 'bracelet', 'chain', 'pendant'].includes(product.type))
  return products.filter((product) => product.type === type)
}

export default function HipHopCollection({
  products: sourceProducts,
  onEnquire,
  onWishlistToast,
}: HipHopCollectionProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const { toggle, isWishlisted } = useWishlist()

  const products = useMemo(() => getFiltered(sourceProducts, activeFilter), [sourceProducts, activeFilter])

  const handleWishlist = (id: number) => {
    const wasWishlisted = isWishlisted(id)
    toggle(id)
    onWishlistToast(wasWishlisted ? 'Removed from wishlist' : 'Saved to wishlist')
  }

  return (
    <section className="px-[52px] pt-[60px] pb-[100px] max-w-[1400px] mx-auto md:px-7 sm:px-5">
      <TypeFilterBar active={activeFilter} onChange={setActiveFilter} />

      {products.length === 0 ? (
        <div className="text-center py-20 col-span-full">
          <h3 className="font-serif text-[28px] font-normal text-[#FFFFFF] mb-3">
            Coming Soon
          </h3>
          <p className="text-[#888888] text-[13px] mb-6">
            We&apos;re adding more pieces to this category. Check back soon or
            enquire for a bespoke design.
          </p>
          <button
            onClick={() => onEnquire('Hip Hop Enquiry')}
            className="
              inline-flex items-center gap-2.5
              px-8 py-[15px]
              text-[10px] font-normal tracking-[0.28em] uppercase
              text-white border border-white/35 bg-transparent cursor-pointer
              hover:bg-white hover:text-[#0A1628] hover:border-white
              transition-all duration-400
            "
          >
            Enquire Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-7 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
          {products.map((product) => (
            <HipHopProductCard
              key={product.dbId}
              product={product}
              isWishlisted={isWishlisted(product.id)}
              onWishlistToggle={handleWishlist}
              onEnquire={onEnquire}
            />
          ))}
        </div>
      )}
    </section>
  )
}
