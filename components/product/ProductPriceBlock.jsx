// components/product/ProductPriceBlock.jsx — House of Diams

import { formatUsdNumber } from '@/lib/money';

/**
 * Price block showing "From" label, price, and note.
 * @param {object} props
 * @param {number} props.priceFrom
 */
export default function ProductPriceBlock({ priceFrom }) {
  return (
    <div className="py-6 border-t border-b border-[rgba(10,22,40,0.10)] mb-7">
      <div className="text-[42px] font-bold text-[#0A1628] leading-none tracking-[-0.03em]" style={{ fontFamily: 'var(--font-plus-jakarta), Arial, Helvetica, sans-serif' }}>
        ${formatUsdNumber(priceFrom)}
      </div>
    </div>
  );
}
