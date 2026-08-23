import Link from 'next/link';
import CheckoutSectionCard from '@/components/checkout/CheckoutSectionCard';
import { useCurrency } from '@/context/CurrencyContext';
import { getCollectionHref } from '@/lib/browse-context';
import { getLoveLetterOccasionLabel, type LoveLetterDraft } from '@/lib/love-letter';
import { formatMoney } from '@/lib/currency';
import type { CheckoutChargeQuote } from '@/components/checkout/types';

export default function CheckoutReviewStep({
  onPayNow,
  isProcessingPayment,
  paymentButtonLabel,
  continueHref,
  loveLetter,
  totalAmount,
  chargeQuote,
  isPaymentDisabled,
  paymentAvailabilityMessage,
}: {
  onPayNow: () => void
  isProcessingPayment: boolean
  paymentButtonLabel?: string
  continueHref?: string
  loveLetter?: LoveLetterDraft | null
  totalAmount: number
  chargeQuote?: CheckoutChargeQuote | null
  isPaymentDisabled?: boolean
  paymentAvailabilityMessage?: string
}) {
  const { format } = useCurrency();

  return (
    <CheckoutSectionCard
      title="Review"
      description="Review your order, then continue into secure Razorpay payment."
    >
      {loveLetter ? (
        <div className="mb-4 rounded-[18px] border border-[#d8dde5] bg-[#f7f9fb] p-4">
          <div className="text-sm font-medium text-[#344054]">Love letter</div>
          {loveLetter.wantsLetter ? (
            <div className="mt-2 space-y-1 text-sm leading-6 text-[#667085]">
              <div className="text-[#101828]">
                {loveLetter.letterType === 'write_myself' ? 'A custom written letter will be printed with this order.' : 'A generated love letter will be printed with this order.'}
              </div>
              {loveLetter.recipientName ? <div>Recipient: {loveLetter.recipientName}</div> : null}
              {loveLetter.occasionKey ? <div>Occasion: {getLoveLetterOccasionLabel(loveLetter.occasionKey)}</div> : null}
            </div>
          ) : (
            <p className="mt-2 text-sm leading-6 text-[#667085]">No letter will be included with this order.</p>
          )}
        </div>
      ) : null}
      <div className="rounded-[18px] border border-[#eaecf0] bg-[#fcfcfd] p-4">
        <div className="text-sm font-medium text-[#344054]">Ready to place your order</div>
        <p className="mt-2 text-sm leading-6 text-[#667085]">
          We will create your pending order first, then open Razorpay so the payment can be completed securely.
        </p>
        <div className="mt-3 space-y-1 text-sm text-[#667085]">
          <div>
            Catalog total: <span className="font-medium text-[#101828]">{format(totalAmount)}</span>
          </div>
          <div>
            Amount to pay now:{' '}
            <span className="font-medium text-[#101828]">
              {formatMoney(chargeQuote?.totalCharged ?? totalAmount, chargeQuote?.chargeCurrency || 'USD')}
            </span>
          </div>
          {chargeQuote ? (
            <div>
              Checkout is charged in {chargeQuote.chargeCurrency} using the latest USD exchange rate locked for this payment.
            </div>
          ) : null}
        </div>
        <div className="mt-5 border-t border-[#eaecf0] pt-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#667085]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#b8964e]" />
            Secure payment options
          </div>
          {paymentAvailabilityMessage ? (
            <p role="status" className="mb-3 text-sm leading-6 text-[#b54708]">{paymentAvailabilityMessage}</p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onPayNow}
              disabled={isProcessingPayment || isPaymentDisabled}
              className="inline-flex min-h-[72px] flex-col items-center justify-center rounded-[14px] bg-[#101828] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(16,24,40,0.12)] transition hover:bg-[#1d2939] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8964e] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#98a2b3] disabled:shadow-none"
            >
              <span>{isProcessingPayment ? paymentButtonLabel || 'Starting Payment...' : 'Pay by Razorpay'}</span>
              {!isProcessingPayment ? <span className="mt-1 text-[11px] font-normal text-white/70">Open secure checkout</span> : null}
            </button>
            <div
              aria-label="Apple Pay availability"
              className="relative flex min-h-[72px] items-center justify-between gap-4 overflow-hidden rounded-[14px] border border-[#d8d2c3] bg-[#fffdf8] px-5 py-3 shadow-[0_8px_22px_rgba(58,45,20,0.06)] before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[#b8964e]"
            >
              <div>
                <div className="text-[15px] font-semibold tracking-[-0.01em] text-[#101828]">Apple Pay</div>
                <div className="mt-1 text-xs leading-5 text-[#667085]">Appears inside Razorpay Checkout on supported Apple devices</div>
              </div>
              <span aria-hidden="true" className="max-w-[86px] shrink-0 text-right text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-[#8a6d32]">Shown when supported</span>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#667085]">
            Razorpay automatically shows Apple Pay in its secure checkout when your browser, device, and wallet are eligible.
          </p>
          <Link
            href={continueHref || getCollectionHref()}
            className="mt-4 inline-flex min-h-10 items-center text-sm font-medium text-[#475467] underline decoration-[#b8bec8] underline-offset-4 transition hover:text-[#101828] focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8964e]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </CheckoutSectionCard>
  );
}
