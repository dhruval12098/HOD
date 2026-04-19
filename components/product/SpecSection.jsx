// components/product/SpecSection.jsx — House of Diams

/**
 * A single spec section with title + key-value rows.
 * @param {object}     props
 * @param {string}     props.title  - Section heading
 * @param {[string, string][]} props.rows  - Array of [label, value] pairs
 * @param {'piece'|'diamond'} [props.variant] - Icon variant
 */
export default function SpecSection({ title, rows, variant = 'piece' }) {
  const icon =
    variant === 'diamond' ? (
      <svg className="w-[14px] h-[14px] flex-shrink-0" viewBox="0 0 14 14" fill="none">
        <polygon points="7,2 11,5 10,12 4,12 3,5" stroke="#B8922A" strokeWidth="1" fill="rgba(184,146,42,0.15)" />
      </svg>
    ) : (
      <svg className="w-[14px] h-[14px] flex-shrink-0" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="4" width="10" height="7" stroke="#B8922A" strokeWidth="1" />
        <path d="M2 6H12" stroke="#B8922A" strokeWidth=".8" />
      </svg>
    );

  return (
    <div className="mb-7 last:mb-0">
      {/* Section title */}
      <div className="flex items-center gap-[10px] font-serif text-[18px] font-medium text-[#14120D] tracking-[0.04em] pb-[10px] mb-[6px] border-b border-[rgba(184,146,42,0.25)]">
        {/* faint gold dot */}
        <span className="w-[14px] h-[14px] bg-[#B8922A] opacity-20 rounded-full flex-shrink-0" />
        {icon}
        {title}
      </div>

      {/* Rows */}
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex justify-between py-3 border-b border-[rgba(20,18,13,0.10)] last:border-b-0 font-sans text-[12px]"
        >
          <span className="text-[#7A7060] tracking-[0.04em]">{label}</span>
          <span className="text-[#14120D] font-medium tracking-[0.02em] font-numeric">{value}</span>
        </div>
      ))}
    </div>
  );
}
