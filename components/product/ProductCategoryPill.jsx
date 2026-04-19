// components/product/ProductCategoryPill.jsx — House of Diams

/**
 * Gold category pill shown between tag-line and product title.
 * @param {object} props
 * @param {string} props.category - 'fine' | 'hiphop'
 * @param {string} props.carat    - e.g. '1.2 ct'
 */
export default function ProductCategoryPill({ category, carat }) {
  const label = category === 'fine' ? 'Fine Jewellery' : 'Hip Hop Jewellery';

  return (
    <div
      className="
        inline-flex items-center gap-[10px]
        px-[18px] py-2
        bg-[#F5EDD6] border border-[rgba(184,146,42,0.25)]
        font-sans text-[10px] font-medium tracking-[0.28em] uppercase
        text-[#8A6A10]
        mb-[22px]
      "
    >
      {/* leading dot */}
      <span className="w-[5px] h-[5px] bg-[#B8922A] rounded-full flex-shrink-0" />

      {label}

      {/* separator dot */}
      <span className="w-[3px] h-[3px] bg-[#B8922A] opacity-50 rounded-full" />

      {/* carat meta */}
      <span className="font-light tracking-[0.18em] text-[#7A7060] font-numeric">{carat}</span>
    </div>
  );
}
