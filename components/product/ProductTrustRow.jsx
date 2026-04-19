// components/product/ProductTrustRow.jsx — House of Diams

const TRUST_ITEMS = [
  {
    title: 'IGI Certified',
    sub: 'Included',
    icon: (
      <svg viewBox="0 0 22 22" fill="none" className="w-[22px] h-[22px] mb-2">
        <polygon points="11,3 17,6 17,15 11,19 5,15 5,6" stroke="#B8922A" strokeWidth="1" />
        <path d="M8 11L10 13L14 9" stroke="#B8922A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Insured Delivery',
    sub: 'Worldwide',
    icon: (
      <svg viewBox="0 0 22 22" fill="none" className="w-[22px] h-[22px] mb-2">
        <rect x="2" y="5" width="18" height="12" rx="2" stroke="#B8922A" strokeWidth="1" />
        <path d="M2 9H20" stroke="#B8922A" strokeWidth="1" />
      </svg>
    ),
  },
  {
    title: 'Conflict Free',
    sub: '100% Traceable',
    icon: (
      <svg viewBox="0 0 22 22" fill="none" className="w-[22px] h-[22px] mb-2">
        <path d="M11 3L17 6V12C17 15 14 17 11 18C8 17 5 15 5 12V6L11 3Z" stroke="#B8922A" strokeWidth="1" />
      </svg>
    ),
  },
];

/**
 * Three-column trust strip below the CTA buttons.
 */
export default function ProductTrustRow() {
  return (
    <div className="grid grid-cols-3 gap-4 py-[22px] mb-8 border-t border-b border-[rgba(20,18,13,0.10)]">
      {TRUST_ITEMS.map(({ title, sub, icon }) => (
        <div key={title} className="text-center">
          <div className="flex justify-center">{icon}</div>
          <div className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-[#14120D] mb-[2px]">
            {title}
          </div>
          <div className="font-sans text-[9px] text-[#7A7060] tracking-[0.06em]">{sub}</div>
        </div>
      ))}
    </div>
  );
}
