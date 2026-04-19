// components/product/ProductPriceBlock.jsx — House of Diams

/**
 * Price block showing "From" label, price, and note.
 * @param {object} props
 * @param {number} props.priceFrom
 */
export default function ProductPriceBlock({ priceFrom }) {
  return (
    <div className="py-6 border-t border-b border-[rgba(20,18,13,0.10)] mb-7">
      <div className="font-sans text-[9px] font-light tracking-[0.3em] uppercase text-[#7A7060] mb-[6px]">
        From
      </div>

      <div className="font-serif text-[42px] font-medium text-[#B8922A] leading-none font-numeric">
        <span className="text-2xl text-[#7A7060] font-normal mr-1 font-numeric">USD</span>
        ${priceFrom.toLocaleString()}
      </div>

      <p className="text-[11px] text-[#7A7060] mt-[10px] tracking-[0.02em] font-numeric">
        Price varies by carat, metal and certification. Final quote on enquiry.
      </p>
    </div>
  );
}
