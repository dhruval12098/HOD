import type { CheckoutDisplayItem } from '@/components/checkout/types';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CheckoutSummary({ item }: { item: CheckoutDisplayItem }) {
  const subtotal = item.priceFrom * item.quantity;
  const gstAmount = subtotal * ((item.gstPercentage ?? 0) / 100);
  const shipping = 0;
  const couponDiscount = Math.max(0, item.couponDiscount ?? 0);
  const total = subtotal + shipping + gstAmount - couponDiscount;

  return (
    <aside className="rounded-[24px] border border-[#e7ebf0] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-6">
      <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#101828]">Order Summary</h2>

      <div className="mt-5 rounded-[20px] border border-[#eaecf0] bg-[#fcfcfd] p-4">
        <div className="flex gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-[18px] bg-[#f2f4f7]">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold text-[#101828]">{item.name}</div>
            <div className="mt-2 grid gap-1 text-sm text-[#667085]">
              {item.metal ? <div>Metal: {item.metal}</div> : null}
              {item.purity ? <div>Purity: {item.purity}</div> : null}
              {item.sizeOrFit ? <div>Size / Fit: {item.sizeOrFit}</div> : null}
              {item.gemstone ? <div>Stone: {item.gemstone}</div> : null}
              <div>Quantity: {item.quantity}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between text-[#667085]">
          <span>Subtotal</span>
          <span className="font-medium text-[#101828]">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-[#667085]">
          <span>Shipping</span>
          <span className="font-medium text-[#101828]">Free</span>
        </div>
        <div className="flex items-center justify-between text-[#667085]">
          <span>{item.gstLabel || 'Taxes'}</span>
          <span className="font-medium text-[#101828]">
            {item.gstPercentage ? `${formatCurrency(gstAmount)} (${item.gstPercentage}%)` : 'Free'}
          </span>
        </div>
        {couponDiscount > 0 ? (
          <div className="flex items-center justify-between text-[#12b76a]">
            <span>Coupon {item.couponCode ? `(${item.couponCode})` : ''}</span>
            <span className="font-medium">-{formatCurrency(couponDiscount)}</span>
          </div>
        ) : null}
        <div className="h-px bg-[#eaecf0]" />
        <div className="flex items-center justify-between text-base font-semibold text-[#101828]">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </aside>
  );
}
