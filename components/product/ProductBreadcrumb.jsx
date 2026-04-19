// components/product/ProductBreadcrumb.jsx — House of Diams

/**
 * Breadcrumb navigation for the product detail page.
 * @param {object} props
 * @param {string} props.productName - Current product name displayed as the last crumb
 */
export default function ProductBreadcrumb({ productName }) {
  return (
    <nav
      className="font-sans text-[9px] font-light tracking-[0.3em] uppercase text-[#7A7060] mb-5"
      aria-label="Breadcrumb"
    >
      <a
        href="/"
        className="text-[#7A7060] no-underline hover:text-[#B8922A] transition-colors duration-300"
      >
        Home
      </a>
      <span className="mx-[10px] text-[#B0A898]">/</span>
      <a
        href="/shop"
        className="text-[#7A7060] no-underline hover:text-[#B8922A] transition-colors duration-300"
      >
        Shop
      </a>
      <span className="mx-[10px] text-[#B0A898]">/</span>
      <span className="text-[#14120D]">{productName}</span>
    </nav>
  );
}
