// components/product/ProductBreadcrumb.jsx — House of Diams

import Link from 'next/link';

/**
 * Breadcrumb navigation for the product detail page.
 * @param {object} props
 * @param {string} [props.collectionHref]
 * @param {string} [props.collectionLabel]
 * @param {string | null} [props.subcategoryHref]
 * @param {string | null} [props.subcategoryLabel]
 */
export default function ProductBreadcrumb({
  collectionHref = '/fine-jewellery',
  collectionLabel = 'Collection',
  subcategoryHref = null,
  subcategoryLabel = null,
}) {
  return (
    <div className="mb-3 flex min-h-8 items-center justify-between gap-4 bg-white">
      <nav
        className="flex min-w-0 flex-wrap items-center font-sans text-[12px] font-normal tracking-[0.01em] text-black max-[700px]:text-[10px]"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="text-black no-underline hover:text-[#0A1628] transition-colors duration-300"
        >
          Home
        </Link>
        <span className="mx-[10px] text-black max-[700px]:mx-[6px]">/</span>
        <Link
          href={collectionHref}
          className="text-black no-underline hover:text-[#0A1628] transition-colors duration-300"
        >
          {collectionLabel}
        </Link>
        {subcategoryLabel ? (
          <>
            <span className="mx-[10px] text-black max-[700px]:mx-[6px]">/</span>
            {subcategoryHref ? (
              <Link
                href={subcategoryHref}
                className="text-black no-underline hover:text-[#0A1628] transition-colors duration-300"
              >
                {subcategoryLabel}
              </Link>
            ) : (
              <span className="text-black">{subcategoryLabel}</span>
            )}
          </>
        ) : null}
      </nav>
    </div>
  );
}
