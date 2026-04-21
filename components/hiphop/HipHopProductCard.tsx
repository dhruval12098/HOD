'use client'

import { HipHopProduct } from './hiphop-products'
import GemSVG from '@/components/common/GemSVG'

interface HipHopProductCardProps {
  product: HipHopProduct
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
  const tag = product.isNew ? 'New' : 'Featured'
  const svgSize =
    ['chain', 'tennis', 'grillz', 'cross'].includes(product.gemStyle)
      ? 140
      : 110

  return (
    <article
      className="
        bg-[#111111] border border-[rgba(184,146,42,0.18)]
        overflow-hidden relative aspect-square flex flex-col
        transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.2,.7,.3,1)]
        hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(0,0,0,0.4)] hover:border-[rgba(184,146,42,0.45)]
        cursor-pointer
      "
    >
      {/* Visual area */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center bg-gradient-to-br from-[#111111] to-[#1A1A1A] overflow-hidden group">
        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(184,146,42,0.1), transparent 70%)' }}
        />

        {/* Tag */}
        <span className="
          absolute top-[14px] left-[14px] z-10
          text-[8px] font-medium tracking-[0.26em] uppercase
          px-3 py-[5px] bg-[#B8922A] text-[#111111]
        ">
          {tag}
        </span>

        {/* Wishlist button */}
        <button
          aria-label={`${isWishlisted ? 'Remove' : 'Add'} ${product.name} ${isWishlisted ? 'from' : 'to'} wishlist`}
          onClick={() => onWishlistToggle(product.id)}
          className={`
            absolute top-[14px] right-[14px] z-10
            w-8 h-8 rounded-full
            flex items-center justify-center
            border border-[rgba(184,146,42,0.3)]
            backdrop-blur-[10px] transition-all duration-300
            ${isWishlisted
              ? 'bg-[#B8922A] border-[#B8922A]'
              : 'bg-black/70 hover:bg-[#B8922A] hover:border-[#B8922A]'
            }
          `}
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill={isWishlisted ? 'white' : 'none'} stroke={isWishlisted ? 'white' : '#D4A840'} strokeWidth={1.3} strokeLinejoin="round">
            <path d="M8 14L2.5 8.5C1 7 1 4.5 2.5 3C4 1.5 6.5 1.5 8 3C9.5 1.5 12 1.5 13.5 3C15 4.5 15 7 13.5 8.5L8 14Z" />
          </svg>
        </button>

        {/* Gem illustration */}
        <div className="transition-transform duration-700 ease-[cubic-bezier(.2,.7,.3,1)] group-hover:scale-[1.08] group-hover:-rotate-3 [filter:drop-shadow(0_8px_20px_rgba(184,146,42,0.3))]">
          <GemSVG style={product.gemStyle} size={svgSize} color={product.gemColor} />
        </div>
      </div>

      {/* Info area */}
      <div className="grid gap-1.5 px-[22px] pt-[18px] pb-[20px] border-t border-[rgba(184,146,42,0.12)] shrink-0">
        <p className="text-[9px] font-light tracking-[0.22em] uppercase text-[#888888] mb-1.5">
          {product.shortMeta}
        </p>
        <h3 className="font-serif text-[20px] font-normal text-[#F9F6F1] tracking-[0.02em] leading-[1.2]">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-1 pt-3">
          <div>
            <span className="block text-[8px] font-normal tracking-[0.24em] uppercase text-[#AAAAAA] mb-0.5">
              From
            </span>
            <span className="font-numeric text-[18px] font-medium text-[#B8922A] tracking-[0.02em]">
              ${product.priceFrom.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => onEnquire(product.name)}
            className="
              text-[8px] font-normal tracking-[0.24em] uppercase
              px-[14px] py-[7px]
              border border-[rgba(184,146,42,0.3)] text-[#D4A840]
              bg-transparent cursor-pointer
              hover:bg-[#B8922A] hover:text-white hover:border-[#B8922A]
              transition-all duration-300
            "
          >
            Enquire
          </button>
        </div>
      </div>
    </article>
  )
}
