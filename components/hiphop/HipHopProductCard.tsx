'use client'

import Link from 'next/link'
import type { StorefrontProduct } from '@/lib/catalog-products'
import GemSVG from '@/components/common/GemSVG'

interface HipHopProductCardProps {
  product: StorefrontProduct
  isWishlisted: boolean
  onWishlistToggle: (id: number) => void
  onEnquire: (name: string) => void
}

export default function HipHopProductCard({
  product,
  isWishlisted,
  onWishlistToggle,
  onEnquire,
}: HipHopProductCardProps) {
  const tag = product.readyToShip ? 'Ready To Ship' : product.isNew ? 'New' : 'Featured'
  const cardImage = product.imageUrl || product.galleryUrls?.[0]
  const svgSize =
    ['chain', 'tennis', 'grillz', 'cross'].includes(product.gemStyle)
      ? 140
      : 110

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="
        bg-[#0A1628] border border-white/12
        overflow-hidden relative aspect-square flex flex-col rounded-[26px]
        transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.2,.7,.3,1)]
        hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(0,0,0,0.4)] hover:border-white/35
        cursor-pointer
      "
    >
      {/* Visual area */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A1628] to-[#111F34] group">
        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(10,22,40,0.1), transparent 70%)' }}
        />

        {/* Tag */}
        <span className="
          absolute top-[14px] left-[14px] z-10
          text-[8px] font-medium tracking-[0.26em] uppercase
          border border-white/20 px-3 py-[5px] bg-white/10 text-white
        ">
          {tag}
        </span>

        {/* Wishlist button */}
        <button
          aria-label={`${isWishlisted ? 'Remove' : 'Add'} ${product.name} ${isWishlisted ? 'from' : 'to'} wishlist`}
          onClick={(e) => {
            e.preventDefault()
            onWishlistToggle(product.id)
          }}
          className={`
            absolute top-[14px] right-[14px] z-10
            w-8 h-8 rounded-full
            flex items-center justify-center
            border border-white/20
            backdrop-blur-[10px] transition-all duration-300
            ${isWishlisted
              ? 'bg-white text-[#0A1628] border-white'
              : 'bg-black/40 hover:bg-white hover:border-white'
            }
          `}
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill={isWishlisted ? '#0A1628' : 'none'} stroke={isWishlisted ? '#0A1628' : 'white'} strokeWidth={1.3} strokeLinejoin="round">
            <path d="M8 14L2.5 8.5C1 7 1 4.5 2.5 3C4 1.5 6.5 1.5 8 3C9.5 1.5 12 1.5 13.5 3C15 4.5 15 7 13.5 8.5L8 14Z" />
          </svg>
        </button>

        {/* Gem illustration */}
        {cardImage ? (
          <img
            src={cardImage}
            alt={`${product.name} jewellery`}
            className="h-full w-full scale-[1.12] object-cover object-center transition-transform duration-700 ease-[cubic-bezier(.2,.7,.3,1)] group-hover:scale-[1.18]"
            loading="lazy"
          />
        ) : (
          <div className="transition-transform duration-700 ease-[cubic-bezier(.2,.7,.3,1)] group-hover:scale-[1.08] group-hover:-rotate-3 [filter:drop-shadow(0_8px_20px_rgba(10,22,40,0.3))]">
            <GemSVG style={product.gemStyle} size={svgSize} color={product.gemColor} />
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="grid shrink-0 gap-1.5 border-t border-white/12 px-[22px] pt-[18px] pb-[20px]">
        <p className="mb-1.5 text-[9px] font-light uppercase tracking-[0.22em] text-white/55">
          {product.shortMeta}
        </p>
        <h3 className="font-serif text-[20px] font-normal text-[#FFFFFF] tracking-[0.02em] leading-[1.2]">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-1 pt-3">
          <div>
            <span className="mb-0.5 block text-[8px] font-normal uppercase tracking-[0.24em] text-white/45">
              From
            </span>
            <span className="font-numeric text-[18px] font-medium tracking-[0.02em] text-white">
              ${product.priceFrom.toLocaleString()}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              onEnquire(product.name)
            }}
            className="
              text-[8px] font-normal tracking-[0.24em] uppercase
              px-[14px] py-[7px]
              border border-white/24 text-white
              bg-transparent cursor-pointer
              hover:bg-white hover:text-[#0A1628] hover:border-white
              transition-all duration-300
            "
          >
            Enquire
          </button>
        </div>
      </div>
    </Link>
  )
}
