// components/product/ProductTrustRow.jsx — House of Diams

const TRUST_ITEMS = [
  {
    title: 'IGI Certified',
    sub: 'Included',
    icon: (
      <svg viewBox="0 0 22 22" fill="none" className="w-[22px] h-[22px] mb-2">
        <polygon points="11,3 17,6 17,15 11,19 5,15 5,6" stroke="#0A1628" strokeWidth="1" />
        <path d="M8 11L10 13L14 9" stroke="#0A1628" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Insured Delivery',
    sub: 'Worldwide',
    icon: (
      <svg viewBox="0 0 22 22" fill="none" className="w-[22px] h-[22px] mb-2">
        <rect x="2" y="5" width="18" height="12" rx="2" stroke="#0A1628" strokeWidth="1" />
        <path d="M2 9H20" stroke="#0A1628" strokeWidth="1" />
      </svg>
    ),
  },
  {
    title: 'Conflict Free',
    sub: '100% Traceable',
    icon: (
      <svg viewBox="0 0 22 22" fill="none" className="w-[22px] h-[22px] mb-2">
        <path d="M11 3L17 6V12C17 15 14 17 11 18C8 17 5 15 5 12V6L11 3Z" stroke="#0A1628" strokeWidth="1" />
      </svg>
    ),
  },
];

/**
 * Three-column trust strip below the CTA buttons.
 */
export default function ProductTrustRow() {
  return (
    <div className="mb-8 grid grid-cols-3 gap-4 rounded-[24px] border border-[rgba(10,22,40,0.10)] bg-white px-5 py-[22px] shadow-[0_18px_50px_rgba(10,22,40,0.04)]">
      {TRUST_ITEMS.map(({ title, sub, icon }) => (
        <div key={title} className="text-center">
          <div className="flex justify-center">{icon}</div>
          <div className="font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-[#0A1628] mb-[2px]">
            {title}
          </div>
          <div className="font-sans text-[9px] text-[#6A6A6A] tracking-[0.06em]">{sub}</div>
        </div>
      ))}
    </div>
  );
}
