// components/product/ProductPriceBlock.jsx — House of Diams

import { formatUsdNumber } from '@/lib/money';

/**
 * Price block showing "From" label, price, and note.
 * @param {object} props
 * @param {number} props.priceFrom
 */
export default function ProductPriceBlock({ priceFrom, compact = false }) {
  return (
    <div className={`${compact ? 'mb-5 py-2' : 'mb-7 py-4'}`}>
      <div className={`${compact ? 'text-[25px]' : 'text-[42px]'} font-bold text-[#0A1628] leading-none tracking-[-0.03em]`} style={{ fontFamily: 'var(--font-plus-jakarta), Arial, Helvetica, sans-serif' }}>
        ${formatUsdNumber(priceFrom)}
      </div>
    </div>
  );
}
