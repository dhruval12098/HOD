// components/product/ProductBreadcrumb.jsx — House of Diams

import Link from 'next/link';

/**
 * Breadcrumb navigation for the product detail page.
 * @param {object} props
 * @param {string} props.productName - Current product name displayed as the last crumb
 * @param {string} [props.collectionHref]
 * @param {string} [props.collectionLabel]
 */
export default function ProductBreadcrumb({
  productName,
  collectionHref = '/fine-jewellery',
  collectionLabel = 'Collection',
}) {
  return (
    <div className="mb-3 flex min-h-8 items-center justify-between gap-4 bg-white">
      <nav
        className="flex min-w-0 flex-wrap items-center font-sans text-[12px] font-normal tracking-[0.01em] text-[#292727] max-[700px]:text-[11px]"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="text-[#292727] no-underline hover:text-[#0A1628] transition-colors duration-300"
        >
          Home
        </Link>
        <span className="mx-[10px] text-[#7F8898]">/</span>
        <Link
          href={collectionHref}
          className="text-[#292727] no-underline hover:text-[#0A1628] transition-colors duration-300"
        >
          {collectionLabel}
        </Link>
        <span className="mx-[10px] text-[#7F8898]">/</span>
        <span className="text-[#0A1628]">{productName}</span>
      </nav>
    </div>
  );
}
