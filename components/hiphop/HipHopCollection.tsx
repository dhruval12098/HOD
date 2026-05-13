'use client'

import { useMemo, useState } from 'react'
import type { StorefrontProduct } from '@/lib/catalog-products'
import { useWishlistStore } from '@/lib/hooks/useWishlistStore'
import { getProductKey } from '@/lib/product-keys'
import ProductCard from '@/components/shop/ProductCard'

interface HipHopCollectionProps {
  products: StorefrontProduct[]
  browseSections: {
    id: string
    title: string
    slug: string
    options: { id: string; label: string; slug: string }[]
  }[]
  onEnquire: (piece: string) => void
  onWishlistToast: (msg: string) => void
}

function getFiltered(products: StorefrontProduct[], activeSubcategory: string, activeOption: string): StorefrontProduct[] {
  return products.filter((product) => {
    if (activeSubcategory !== 'all' && product.subcategorySlug !== activeSubcategory) return false
    if (activeOption !== 'all' && product.optionSlug !== activeOption) return false
    return true
  })
}

export default function HipHopCollection({
  products: sourceProducts,
  browseSections,
  onEnquire,
  onWishlistToast,
}: HipHopCollectionProps) {
  const [activeSubcategory, setActiveSubcategory] = useState<string>(browseSections[0]?.slug ?? 'all')
  const [activeOption, setActiveOption] = useState<string>('all')
  const { toggle, contains } = useWishlistStore()

  const activeSection = useMemo(
    () => browseSections.find((section) => section.slug === activeSubcategory) ?? browseSections[0] ?? null,
    [activeSubcategory, browseSections]
  )
  const products = useMemo(
    () => getFiltered(sourceProducts, activeSubcategory, activeOption),
    [sourceProducts, activeSubcategory, activeOption]
  )

  const handleWishlist = (product: StorefrontProduct) => {
    const productKey = getProductKey(product)
    const wasWishlisted = contains(productKey)
    toggle(productKey)
    onWishlistToast(wasWishlisted ? 'Removed from wishlist' : 'Saved to wishlist')
  }

  return (
    <section className="px-[52px] pt-[60px] pb-[100px] max-w-[1400px] mx-auto md:px-7 sm:px-5">
      {browseSections.length > 0 ? (
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {browseSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setActiveSubcategory(section.slug)
                  setActiveOption('all')
                }}
                className={`
                  px-[18px] py-2
                  text-[9px] font-normal tracking-[0.24em] uppercase
                  border cursor-pointer transition-all duration-300
                  ${
                    activeSubcategory === section.slug
                      ? 'border-[#0A1628] bg-[#0A1628] text-white'
                      : 'text-[#0A1628]/72 border-[#0A1628]/16 hover:text-[#0A1628] hover:border-[#0A1628]/40'
                  }
                `}
              >
                {section.title}
              </button>
            ))}
          </div>

          {activeSection && activeSection.options.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveOption('all')}
                className={`
                  rounded-full px-4 py-2 text-[10px] tracking-[0.08em] transition-all duration-300
                  ${
                    activeOption === 'all'
                      ? 'bg-white text-[#0A1628]'
                      : 'border border-[#0A1628]/16 text-[#0A1628]/72 hover:border-[#0A1628]/40 hover:text-[#0A1628]'
                  }
                `}
              >
                All
              </button>
              {activeSection.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveOption(option.slug)}
                  className={`
                    rounded-full px-4 py-2 text-[10px] tracking-[0.08em] transition-all duration-300
                    ${
                      activeOption === option.slug
                        ? 'bg-white text-[#0A1628]'
                        : 'border border-[#0A1628]/16 text-[#0A1628]/72 hover:border-[#0A1628]/40 hover:text-[#0A1628]'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

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
        <div className="grid grid-cols-3 gap-7 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-2 max-[700px]:gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.dbId}
              product={product}
              wishlisted={contains(getProductKey(product))}
              onWishlist={() => handleWishlist(product)}
              onEnquire={onEnquire}
              forceLight
            />
          ))}
        </div>
      )}
    </section>
  )
}
