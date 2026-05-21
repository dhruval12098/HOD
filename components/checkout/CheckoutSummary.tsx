import type { CheckoutSummaryData } from '@/components/checkout/types';
import { formatMoney } from '@/lib/currency';
import { getLoveLetterOccasionLabel } from '@/lib/love-letter';

function buildSelectionLabel(metal?: string, purity?: string) {
  const normalizedMetal = metal?.trim() || ''
  const normalizedPurity = purity?.trim() || ''
  if (!normalizedMetal) return normalizedPurity
  if (!normalizedPurity || normalizedMetal.toLowerCase().includes(normalizedPurity.toLowerCase())) return normalizedMetal
  return `${normalizedPurity} ${normalizedMetal}`.trim()
}

export default function CheckoutSummary({ summary }: { summary: CheckoutSummaryData }) {
  const subtotal = summary.items.reduce((sum, item) => sum + (item.priceFrom * item.quantity), 0);
  const gstAmount = summary.items.reduce(
    (sum, item) => sum + (item.priceFrom * item.quantity * ((item.gstPercentage ?? 0) / 100)),
    0
  );
  const shipping = 0;
  const couponDiscount = Math.max(0, summary.couponDiscount ?? 0);
  const total = subtotal + shipping + gstAmount - couponDiscount;
  const singleItem = summary.items[0];

  return (
    <aside className="rounded-[24px] border border-[#e7ebf0] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-6">
      <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#101828]">Order Summary</h2>

      <div className="mt-5 space-y-3">
        {summary.items.map((item) => (
          <div key={`${item.slug}-${item.metal || ''}-${item.purity || ''}-${item.sizeOrFit || ''}-${item.gemstone || ''}-${item.carat || ''}`} className="rounded-[20px] border border-[#eaecf0] bg-[#fcfcfd] p-4">
            <div className="flex gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-[18px] bg-[#f2f4f7]">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-[#101828]">{item.name}</div>
                <div className="mt-2 grid gap-1 text-sm text-[#667085]">
                  {buildSelectionLabel(item.metal, item.purity) ? <div>Metal: {buildSelectionLabel(item.metal, item.purity)}</div> : null}
                  {item.sizeOrFit ? <div>Size / Fit: {item.sizeOrFit}</div> : null}
                  {item.gemstone ? <div>Stone: {item.gemstone}</div> : null}
                  <div>Quantity: {item.quantity}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {summary.loveLetter ? (
        <div className="mt-5 rounded-[20px] border border-[#eaecf0] bg-[#fcfcfd] p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#98a2b3]">Love Letter</div>
          {summary.loveLetter.wantsLetter ? (
            <div className="mt-3 space-y-1 text-sm text-[#667085]">
              <div className="font-medium text-[#101828]">
                {summary.loveLetter.letterType === 'write_myself' ? 'Written by you' : 'Generated from your prompts'}
              </div>
              {summary.loveLetter.recipientName ? <div>For: {summary.loveLetter.recipientName}</div> : null}
              {summary.loveLetter.occasionKey ? <div>Occasion: {getLoveLetterOccasionLabel(summary.loveLetter.occasionKey)}</div> : null}
            </div>
          ) : (
            <div className="mt-3 text-sm text-[#667085]">No letter will be included with this order.</div>
          )}
        </div>
      ) : null}

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between text-[#667085]">
          <span>Subtotal</span>
          <span className="font-medium text-[#101828]">{formatMoney(subtotal, 'USD')}</span>
        </div>
        <div className="flex items-center justify-between text-[#667085]">
          <span>Shipping</span>
          <span className="font-medium text-[#101828]">Free</span>
        </div>
        <div className="flex items-center justify-between text-[#667085]">
          <span>{summary.items.length === 1 ? singleItem?.gstLabel || 'Taxes' : 'Taxes'}</span>
          <span className="font-medium text-[#101828]">
            {gstAmount > 0 ? formatMoney(gstAmount, 'USD') : 'Free'}
          </span>
        </div>
        {couponDiscount > 0 ? (
          <div className="flex items-center justify-between text-[#12b76a]">
            <span>Coupon {summary.couponCode ? `(${summary.couponCode})` : ''}</span>
            <span className="font-medium">-{formatMoney(couponDiscount, 'USD')}</span>
          </div>
        ) : null}
        <div className="h-px bg-[#eaecf0]" />
        <div className="flex items-center justify-between text-base font-semibold text-[#101828]">
          <span>Total</span>
          <span>{formatMoney(total, 'USD')}</span>
        </div>
        {summary.chargeQuote ? (
          <div className="rounded-[18px] border border-[#eaecf0] bg-[#fcfcfd] p-4 text-sm text-[#667085]">
            <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#98a2b3]">Payment Currency</div>
            <div className="mt-2">
              {summary.chargeQuote.chargeCurrency === 'INR'
                ? `You will be charged ${formatMoney(summary.chargeQuote.totalCharged, 'INR')} at checkout.`
                : `You will be charged ${formatMoney(summary.chargeQuote.totalCharged, 'USD')} at checkout.`}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
