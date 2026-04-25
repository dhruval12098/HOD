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
        <polygon points="7,2 11,5 10,12 4,12 3,5" stroke="#0A1628" strokeWidth="1" fill="rgba(10,22,40,0.15)" />
      </svg>
    ) : (
      <svg className="w-[14px] h-[14px] flex-shrink-0" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="4" width="10" height="7" stroke="#0A1628" strokeWidth="1" />
        <path d="M2 6H12" stroke="#0A1628" strokeWidth=".8" />
      </svg>
    );

  return (
    <div className="mb-7 rounded-[24px] border border-[rgba(10,22,40,0.10)] bg-white p-5 shadow-[0_18px_50px_rgba(10,22,40,0.04)] last:mb-0">
      {/* Section title */}
      <div className="mb-[6px] flex items-center gap-[10px] border-b border-[rgba(10,22,40,0.25)] pb-[10px] font-sans text-[16px] font-semibold tracking-[0.01em] text-[#0A1628] sm:text-[18px]">
        {/* faint gold dot */}
        <span className="w-[14px] h-[14px] bg-[#0A1628] opacity-20 rounded-full flex-shrink-0" />
        {icon}
        {title}
      </div>

      {/* Rows */}
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex flex-col gap-1 py-3 border-b border-[rgba(10,22,40,0.10)] last:border-b-0 font-sans text-[12px] sm:flex-row sm:items-start sm:justify-between sm:gap-6"
        >
          <span className="max-w-full break-words text-[#6A6A6A] tracking-[0.04em]">{label}</span>
          <span className="max-w-full break-words text-[#0A1628] font-medium tracking-[0.01em] sm:text-right">{value}</span>
        </div>
      ))}
    </div>
  );
}
