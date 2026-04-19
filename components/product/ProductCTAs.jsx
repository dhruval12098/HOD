// components/product/ProductCTAs.jsx — House of Diams
'use client';
import { useState } from 'react';

/**
 * CTA button row: Request Quote, WhatsApp, Wishlist heart.
 * @param {object}   props
 * @param {object}   props.product      - Full product object
 * @param {function} props.onEnquire    - Opens the enquiry modal
 * @param {boolean}  props.inWishlist   - Whether this product is currently wishlisted
 * @param {function} props.onWishlist   - Toggles wishlist state
 */
export default function ProductCTAs({ product, onEnquire, inWishlist, onWishlist }) {
  const waText = encodeURIComponent(
    `Hi, I'd like to enquire about the ${product.name} (from $${product.priceFrom.toLocaleString()})`
  );

  return (
    <div className="flex gap-3 mb-8 max-[1100px]:flex-col">
      {/* Request Quote */}
      <button
        onClick={() => onEnquire(product.name)}
        className="
          flex-1 flex items-center justify-center gap-[10px]
          font-sans text-[10px] font-medium tracking-[0.28em] uppercase
          py-[18px] px-5
          bg-gradient-to-br from-[#B8922A] to-[#D4A840] text-[#14120D]
          border-0 cursor-pointer
          transition-all duration-300 ease-out
          shadow-[0_8px_30px_rgba(20,18,13,0.08)]
          hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(184,146,42,0.18)]
        "
      >
        <span>Request Quote</span>
      </button>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/919328536178?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="
          flex-1 flex items-center justify-center gap-[10px]
          font-sans text-[10px] font-light tracking-[0.28em] uppercase
          py-[18px] px-8
          text-[#14120D] bg-transparent
          border border-[#14120D] cursor-pointer
          transition-all duration-300 no-underline
          hover:bg-[#14120D] hover:text-[#FBF9F5]
        "
      >
        WhatsApp
      </a>

      {/* Wishlist heart */}
      <button
        onClick={onWishlist}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`
          flex items-center justify-center
          w-14 flex-shrink-0 cursor-pointer
          border transition-all duration-300
          max-[1100px]:w-full max-[1100px]:h-[52px]
          ${inWishlist
            ? 'bg-[#B8922A] border-[#B8922A]'
            : 'bg-transparent border-[#14120D] hover:bg-[#14120D]'
          }
        `}
      >
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill={inWishlist ? '#fff' : 'none'}
          className={`transition-colors duration-300 ${inWishlist ? 'stroke-white' : 'stroke-[#14120D] group-hover:stroke-white'}`}
          style={{ stroke: inWishlist ? '#fff' : '#14120D' }}
        >
          <path
            d="M8 14L2.5 8.5C1 7 1 4.5 2.5 3C4 1.5 6.5 1.5 8 3C9.5 1.5 12 1.5 13.5 3C15 4.5 15 7 13.5 8.5L8 14Z"
            strokeWidth="1.3" strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
