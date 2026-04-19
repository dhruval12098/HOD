// components/product/ProductTagLine.jsx — House of Diams

/**
 * Pill badges row shown above the product title (e.g. "New Arrival", "In Stock").
 * @param {object} props
 * @param {boolean} props.isNew
 */
export default function ProductTagLine({ isNew }) {
  const tag = isNew ? 'New Arrival' : 'Bespoke';

  return (
    <div className="flex gap-[10px] mb-[14px]">
      {/* Tag pill — bespoke / new arrival */}
      <span
        className="
          font-sans text-[8px] font-medium tracking-[0.28em] uppercase
          px-3 py-[5px]
          bg-[#14120D] text-[#E8D898]
          border border-[#14120D]
        "
      >
        {tag}
      </span>

      {/* In Stock pill */}
      <span
        className="
          font-sans text-[8px] font-medium tracking-[0.28em] uppercase
          px-3 py-[5px]
          border
          text-[#2d8a4f] bg-[rgba(50,160,80,0.08)] border-[rgba(50,160,80,0.3)]
        "
      >
        In Stock
      </span>
    </div>
  );
}
