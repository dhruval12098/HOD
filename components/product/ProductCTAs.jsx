// components/product/ProductCTAs.jsx — House of Diams
'use client';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';

/**
 * CTA button row: primary purchase and enquiry actions.
 * @param {object}   props
 * @param {object}   props.product      - Full product object
 * @param {function} props.onEnquire    - Opens the enquiry modal
 * @param {string}   props.checkoutHref - Static checkout route for standard products
 * @param {function} props.onAddToCart  - Adds the configured product to cart
 * @param {function} props.onCheckout   - Opens the pre-checkout love letter flow
 * @param {'both'|'checkout_only'|'enquire_only'} [props.ctaMode] - Controls which CTAs are visible
 * @param {string|null} [props.ctaLabel] - Optional CTA label override from material rules
 */
export default function ProductCTAs({ product, ctaMode = 'both', ctaLabel = null, onEnquire, checkoutHref, onAddToCart, onCheckout }) {
  const { format } = useCurrency();
  const waText = encodeURIComponent(
    `Hi, I'd like to enquire about the ${product.name} (from ${format(product.priceFrom)})`
  );
  const isCollectionProduct = product.productLane === 'collection';
  const canCheckoutDirectly = !isCollectionProduct && (product.category !== 'hiphop' || Boolean(product.allowCheckout));
  const showWhatsapp = ctaMode !== 'checkout_only';
  const showCheckout = ctaMode !== 'enquire_only' && canCheckoutDirectly;
  const checkoutLabel = ctaLabel || 'Buy Now';

  return (
    <div className="mb-8 flex flex-col gap-3">
      <button
        onClick={onAddToCart}
        className="
          flex w-full items-center justify-center gap-[10px]
          font-[family-name:var(--font-family-button)] text-[14px] font-medium normal-case tracking-normal
          py-[18px] px-8
          text-[var(--color-brand-primary,#000000)] bg-transparent
          border border-[var(--color-brand-primary,#000000)] cursor-pointer
          transition-all duration-400
          hover:bg-[var(--color-brand-primary,#000000)] hover:text-[#FAFBFD]
        "
      >
        Add To Cart
      </button>

      {showCheckout ? (
        onCheckout ? (
          <button
            type="button"
            onClick={onCheckout}
            className="
              flex w-full items-center justify-center gap-[10px]
              font-[family-name:var(--font-family-button)] text-[14px] font-medium normal-case tracking-normal
              py-[18px] px-5
              bg-[var(--color-brand-primary,#000000)] text-white
              border-0 cursor-pointer no-underline
              transition-all duration-400 ease-out
              
              hover:opacity-80
            "
          >
            <span>{checkoutLabel}</span>
          </button>
        ) : (
          <Link
            href={checkoutHref}
            className="
              flex w-full items-center justify-center gap-[10px]
              font-[family-name:var(--font-family-button)] text-[14px] font-medium normal-case tracking-normal
              py-[18px] px-5
              bg-[var(--color-brand-primary,#000000)] text-white
              border-0 cursor-pointer no-underline
              transition-all duration-400 ease-out
              
              hover:opacity-80
            "
          >
            <span>{checkoutLabel}</span>
          </Link>
        )
      ) : null}

      {showWhatsapp ? (
        <a
          href={`https://wa.me/919328536178?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex w-full items-center justify-center gap-[10px]
            font-[family-name:var(--font-family-button)] text-[14px] font-medium normal-case tracking-normal
            py-[18px] px-8
            text-[var(--color-brand-primary,#000000)] bg-transparent
            border border-[var(--color-brand-primary,#000000)] cursor-pointer
            transition-all duration-400 no-underline
            hover:bg-[var(--color-brand-primary,#000000)] hover:text-[#FAFBFD]
          "
        >
          {ctaLabel || 'WhatsApp'}
        </a>
      ) : null}
    </div>
  );
}



