import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import type { CheckoutSummaryData } from '@/components/checkout/types'
import { useCurrency } from '@/context/CurrencyContext'
import { formatMoney } from '@/lib/currency'

function selectionLabel(item: CheckoutSummaryData['items'][number]) {
  return [item.purity, item.metal, item.sizeOrFit, item.gemstone, item.carat].filter(Boolean).join(', ')
}

export default function CheckoutSummary({ summary, couponValue = '', onCouponChange, onCouponAction, couponApplied = false, couponLoading = false }: { summary: CheckoutSummaryData; couponValue?: string; onCouponChange?: (value: string) => void; onCouponAction?: () => void; couponApplied?: boolean; couponLoading?: boolean }) {
  const { format } = useCurrency()
  const [promoOpen, setPromoOpen] = useState(Boolean(couponValue))
  const subtotal = summary.items.reduce((sum, item) => sum + (item.priceFrom * item.quantity), 0)
  const couponDiscount = Math.max(0, summary.couponDiscount ?? 0)
  const taxableSubtotal = Math.max(0, subtotal - couponDiscount)
  const gstAmount = summary.items.reduce((sum, item) => {
    const lineSubtotal = item.priceFrom * item.quantity
    const discountShare = subtotal > 0 ? couponDiscount * (lineSubtotal / subtotal) : 0
    return sum + Math.max(0, lineSubtotal - discountShare) * ((item.gstPercentage ?? 0) / 100)
  }, 0)
  const total = taxableSubtotal + gstAmount

  return (
    <aside className="border border-black/10 bg-[#f7f7f7] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.05)] sm:p-6">
      <h2 className="font-[family-name:var(--font-family-primary)] text-[20px] font-semibold uppercase text-black">Order Summary</h2>
      <div className="mt-5 divide-y divide-black/10">
        {summary.items.map((item) => <article key={`${item.slug}-${item.metal || ''}-${item.sizeOrFit || ''}`} className="grid grid-cols-[76px_minmax(0,1fr)_auto] gap-3 py-5 first:pt-0">
          <div className="relative aspect-square overflow-hidden bg-white">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="absolute inset-0 h-full w-full object-cover" /> : null}</div>
          <div className="min-w-0 font-[family-name:var(--font-family-secondary)]"><h3 className="text-[12px] font-semibold leading-4 text-black">{item.name}</h3>{selectionLabel(item) ? <p className="mt-1 text-[10px] leading-4 text-black/60">{selectionLabel(item)}</p> : null}<p className="mt-3 text-[10px] text-black/50">Qty {item.quantity}</p><p className="mt-3 text-[10px] font-medium text-black">Delivery</p></div>
          <span className="font-[family-name:var(--font-family-secondary)] text-[11px] font-semibold text-black">{format(item.priceFrom * item.quantity)}</span>
        </article>)}
      </div>
      {summary.gift ? <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-3 border-t border-black/10 py-4"><div className="relative aspect-square overflow-hidden bg-white">{summary.gift.imageUrl ? <img src={summary.gift.imageUrl} alt={summary.gift.name} className="absolute inset-0 h-full w-full object-cover" /> : null}</div><div><p className="font-[family-name:var(--font-family-secondary)] text-[9px] font-semibold uppercase text-black/45">Complimentary gift</p><p className="mt-1 font-[family-name:var(--font-family-primary)] text-[12px] font-semibold text-black">{summary.gift.name}</p><p className="mt-1 text-[10px] text-black"><span className="mr-2 text-black/40 line-through">{format(summary.gift.originalUnitPrice)}</span>Free</p></div></div> : null}
      <div className="border-y border-black/10 py-4">
        <button type="button" onClick={() => setPromoOpen((open) => !open)} className="flex w-full items-center justify-between border-0 bg-transparent p-0 font-[family-name:var(--font-family-secondary)] text-[11px] text-black underline underline-offset-3"><span>Add Promo Code</span>{promoOpen ? <ChevronDown size={14} /> : <Plus size={14} />}</button>
        {promoOpen ? <div className="mt-3 flex h-10"><input value={couponValue} onChange={(event) => onCouponChange?.(event.target.value.toUpperCase())} disabled={couponApplied} placeholder="Enter code" className="min-w-0 flex-1 border border-r-0 border-black/20 bg-white px-3 text-[11px] outline-none"/><button type="button" onClick={onCouponAction} disabled={couponLoading} className="border border-black bg-black px-4 text-[10px] font-semibold uppercase text-white">{couponApplied ? 'Remove' : couponLoading ? 'Checking' : 'Apply'}</button></div> : null}
      </div>
      <div className="mt-5 space-y-3 font-[family-name:var(--font-family-secondary)] text-[11px] text-black/65"><div className="flex justify-between"><span>Subtotal</span><strong className="text-black">{format(subtotal)}</strong></div>{couponDiscount > 0 ? <div className="flex justify-between"><span>Savings {summary.couponCode ? `(${summary.couponCode})` : ''}</span><strong className="text-black">-{format(couponDiscount)}</strong></div> : null}<div className="flex justify-between"><span>Shipping</span><span>Complimentary</span></div><div className="flex justify-between"><span>Taxes</span><span>{gstAmount > 0 ? format(gstAmount) : format(0)}</span></div><div className="mt-4 flex justify-between border-t border-black/10 pt-4 font-[family-name:var(--font-family-primary)] text-[15px] font-semibold text-black"><span>Total</span><span>{format(total)}</span></div>{summary.chargeQuote ? <p className="border-t border-black/10 pt-4 text-[10px] leading-4 text-black/45">You will be charged {formatMoney(summary.chargeQuote.totalCharged, summary.chargeQuote.chargeCurrency)} at checkout.</p> : null}</div>
    </aside>
  )
}
