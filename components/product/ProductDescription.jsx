// components/product/ProductDescription.jsx — House of Diams

/**
 * Product description paragraph.
 * @param {object} props
 * @param {string} props.text
 */
export default function ProductDescription({ text }) {
  return (
    <div className="mb-8">
      <h2 className="mb-3 font-display-title text-[28px] font-normal leading-[1.1] tracking-[0.01em] text-[#0A1628] sm:text-[32px]">
        About The Product
      </h2>
      <p className="font-sans text-[13px] font-light leading-[1.9] text-[#253246] tracking-[0.02em]">
        {text}
      </p>
    </div>
  );
}
