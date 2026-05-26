// components/product/ProductBreadcrumb.jsx — House of Diams

/**
 * Breadcrumb navigation for the product detail page.
 * @param {object} props
 * @param {string} props.productName - Current product name displayed as the last crumb
 * @param {string} [props.collectionHref]
 * @param {string} [props.collectionLabel]
 * @param {boolean} [props.inWishlist]
 * @param {function} [props.onWishlist]
 */
export default function ProductBreadcrumb({
  productName,
  collectionHref = '/fine-jewellery',
  collectionLabel = 'Collection',
  inWishlist = false,
  onWishlist,
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <nav
        className="flex flex-wrap items-center font-sans text-[9px] font-light tracking-[0.3em] uppercase text-[#6A6A6A]"
        aria-label="Breadcrumb"
      >
        <a
          href="/"
          className="text-[#6A6A6A] no-underline hover:text-[#0A1628] transition-colors duration-300"
        >
          Home
        </a>
        <span className="mx-[10px] text-[#7F8898]">/</span>
        <a
          href={collectionHref}
          className="text-[#6A6A6A] no-underline hover:text-[#0A1628] transition-colors duration-300"
        >
          {collectionLabel}
        </a>
        <span className="mx-[10px] text-[#7F8898]">/</span>
        <span className="text-[#0A1628]">{productName}</span>
      </nav>

      {onWishlist ? (
        <button
          type="button"
          onClick={onWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="inline-flex h-8 w-8 flex-none items-center justify-center bg-transparent p-0 text-[#0A1628] transition-transform duration-300 hover:scale-110"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill={inWishlist ? 'currentColor' : 'none'}
            className="transition-colors duration-300"
            style={{ stroke: '#0A1628', color: '#0A1628' }}
          >
            <path
              d="M8 14L2.5 8.5C1 7 1 4.5 2.5 3C4 1.5 6.5 1.5 8 3C9.5 1.5 12 1.5 13.5 3C15 4.5 15 7 13.5 8.5L8 14Z"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
