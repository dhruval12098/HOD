// components/product/ProductPriceBlock.jsx — House of Diams

import { useCurrency } from '@/context/CurrencyContext';

/**
 * Price block showing "From" label, price, and note.
 * @param {object} props
 * @param {number} props.priceFrom
 */
export default function ProductPriceBlock({ priceFrom, compact = false }) {
  const { format } = useCurrency();

  return (
    <div className={`${compact ? 'mb-5 py-2' : 'mb-7 py-4'}`}>
      <div className={`${compact ? 'text-[25px]' : 'text-[42px]'} font-bold text-[#0A1628] leading-none tracking-[-0.03em]`} style={{ fontFamily: 'var(--font-plus-jakarta), Arial, Helvetica, sans-serif' }}>
        {format(priceFrom)}
      </div>
    </div>
  );
}
