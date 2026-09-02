import Link from 'next/link';
import AppleIcon from '@mui/icons-material/Apple';
import CheckoutSectionCard from '@/components/checkout/CheckoutSectionCard';
import { useCurrency } from '@/context/CurrencyContext';
import { getCollectionHref } from '@/lib/browse-context';
import { getLoveLetterOccasionLabel, type LoveLetterDraft } from '@/lib/love-letter';
import { formatMoney } from '@/lib/currency';
import type { CheckoutChargeQuote } from '@/components/checkout/types';

export default function CheckoutReviewStep({
  onPayNow,
  isProcessingPayment,
  continueHref,
  loveLetter,
  totalAmount,
  chargeQuote,
  isPaymentDisabled,
  paymentAvailabilityMessage,
}: {
  onPayNow: () => void
  isProcessingPayment: boolean
  continueHref?: string
  loveLetter?: LoveLetterDraft | null
  totalAmount: number
  chargeQuote?: CheckoutChargeQuote | null
  isPaymentDisabled?: boolean
  paymentAvailabilityMessage?: string
}) {
  const { format } = useCurrency();

  const paymentBlocked = isProcessingPayment || isPaymentDisabled;

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
              disabled={paymentBlocked}
              className="inline-flex min-h-[58px] items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#2f74d0_0%,#123b78_55%,#091c3d_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(18,59,120,0.24)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397ed8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none disabled:hover:brightness-100"
            >
              Proceed to Pay
            </button>
            <button
              type="button"
              onClick={onPayNow}
              disabled={paymentBlocked}
              aria-describedby="apple-pay-availability"
              className="inline-flex min-h-[58px] items-center justify-center gap-2.5 rounded-[14px] bg-[#050505] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(5,5,5,0.2)] transition hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#667085] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none"
            >
              <AppleIcon aria-hidden="true" sx={{ fontSize: 24 }} />
              Pay with Apple Pay
            </button>
          </div>
          <p id="apple-pay-availability" className="mt-3 text-xs leading-5 text-[#667085]">
            Both payment options open the same secure Razorpay Checkout.
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
