// components/product/ProductBreadcrumb.jsx — House of Diams

/**
 * Breadcrumb navigation for the product detail page.
 * @param {object} props
 * @param {string} props.productName - Current product name displayed as the last crumb
 * @param {string} [props.collectionHref]
 * @param {string} [props.collectionLabel]
 */
export default function ProductBreadcrumb({ productName, collectionHref = '/fine-jewellery', collectionLabel = 'Collection' }) {
  return (
    <nav
      className="font-sans text-[9px] font-light tracking-[0.3em] uppercase text-[#6A6A6A] mb-5"
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
  );
}
