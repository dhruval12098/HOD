'use client'

import { useState } from 'react'
import {
  HIPHOP_PRODUCTS,
  HIPHOP_TYPES,
  HipHopProduct,
} from './hiphop-products'
import { useWishlist } from './useWishlist'
import TypeFilterBar, { FilterType } from './TypeFilterBar'
import HipHopProductCard from './HipHopProductCard'

interface HipHopCollectionProps {
  onEnquire: (piece: string) => void
  onWishlistToast: (msg: string) => void
}

function getFiltered(type: FilterType): HipHopProduct[] {
  if (type === 'all') return HIPHOP_PRODUCTS
  if (type === 'others')
    return HIPHOP_PRODUCTS.filter((p) => !HIPHOP_TYPES.includes(p.type))
  return HIPHOP_PRODUCTS.filter((p) => p.type === type)
}

export default function HipHopCollection({
  onEnquire,
  onWishlistToast,
}: HipHopCollectionProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const { toggle, isWishlisted } = useWishlist()

  const products = getFiltered(activeFilter)

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
          <h3 className="font-serif text-[28px] font-normal text-[#E8D898] mb-3">
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
              text-[10px] font-normal tracking-[0.28em] uppercase
              text-[#B8922A] border border-[#B8922A]
              px-8 py-[15px] bg-transparent cursor-pointer
              hover:bg-[#B8922A] hover:text-[#111111]
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
              key={product.id}
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
