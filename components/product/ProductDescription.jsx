// components/product/ProductDescription.jsx — House of Diams

/**
 * Product description paragraph.
 * @param {object} props
 * @param {string} props.text
 */
export default function ProductDescription({ text, compact = false }) {
  return (
    <div className={compact ? 'mb-6' : 'mb-8'}>
      {!compact ? (
        <h2 className="mb-3 font-display-title text-[28px] font-normal leading-[1.1] tracking-[0.01em] text-[#0A1628] sm:text-[32px]">
          About The Product
        </h2>
      ) : null}
      <p className={`${compact ? 'max-w-[58ch] text-[12px] leading-[1.8]' : 'text-[13px] leading-[1.9]'} font-sans font-light text-[#253246] tracking-[0.02em]`}>
        {text}
      </p>
    </div>
  );
}
