import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Apple } from 'lucide-react';
import CheckoutSectionCard from '@/components/checkout/CheckoutSectionCard';
import { useCurrency } from '@/context/CurrencyContext';
import { getCollectionHref } from '@/lib/browse-context';
import { getLoveLetterOccasionLabel, type LoveLetterDraft } from '@/lib/love-letter';
import { formatMoney } from '@/lib/currency';
import type { CheckoutChargeQuote } from '@/components/checkout/types';

// Keep disabled by default. Enable only after live Razorpay keys and both Apple Pay domains are verified.
const APPLE_PAY_LIVE_READY = process.env.NEXT_PUBLIC_APPLE_PAY_ENABLED === 'true';

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
  const [applePayEligible, setApplePayEligible] = useState<boolean | null>(null);

  useEffect(() => {
    if (!APPLE_PAY_LIVE_READY) {
      setApplePayEligible(false);
      return;
    }

    try {
      const applePaySession = (window as Window & {
        ApplePaySession?: { canMakePayments: () => boolean };
      }).ApplePaySession;
      setApplePayEligible(Boolean(applePaySession?.canMakePayments?.()));
    } catch {
      setApplePayEligible(false);
    }
  }, []);

  const paymentBlocked = isProcessingPayment || isPaymentDisabled;
  const applePayBlocked = paymentBlocked || !APPLE_PAY_LIVE_READY || applePayEligible !== true;

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
              className="inline-flex min-h-[74px] items-center justify-center gap-3 rounded-[14px] bg-[linear-gradient(135deg,#2f74d0_0%,#123b78_55%,#091c3d_100%)] px-6 py-3 text-white shadow-[0_10px_24px_rgba(18,59,120,0.24)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397ed8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none disabled:hover:brightness-100"
            >
              <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] border border-white/30 bg-white/10 text-[15px] font-semibold">R</span>
              <span className="flex flex-col items-start">
                <span className="text-sm font-semibold">{isProcessingPayment ? paymentButtonLabel || 'Starting Payment...' : 'Pay with Razorpay'}</span>
                {!isProcessingPayment ? <span className="mt-0.5 text-[10px] font-normal text-white/70">Secure standard checkout</span> : null}
              </span>
            </button>
            <button
              type="button"
              onClick={onPayNow}
              disabled={applePayBlocked}
              aria-describedby="apple-pay-availability"
              className="inline-flex min-h-[74px] items-center justify-center gap-3 rounded-[14px] bg-[linear-gradient(135deg,#050505_0%,#20242a_58%,#626870_100%)] px-6 py-3 text-white shadow-[0_10px_24px_rgba(5,5,5,0.2)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#667085] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none disabled:hover:brightness-100"
            >
              <Apple aria-hidden="true" className="h-7 w-7" strokeWidth={1.8} />
              <span className="flex flex-col items-start">
                <span className="text-sm font-semibold">Apple Pay</span>
                <span className="mt-0.5 text-[10px] font-normal text-white/70">
                  {!APPLE_PAY_LIVE_READY
                    ? 'Setup pending'
                    : applePayEligible === null
                      ? 'Checking availability…'
                      : applePayEligible
                        ? 'Open Razorpay Checkout'
                        : 'Unavailable on this device'}
                </span>
              </span>
            </button>
          </div>
          <p id="apple-pay-availability" className="mt-3 text-xs leading-5 text-[#667085]">
            {APPLE_PAY_LIVE_READY
              ? 'This opens secure Razorpay Checkout, where Apple Pay is offered only when the Apple device, Safari browser, wallet, and verified live domain are eligible.'
              : 'Apple Pay will become available here after live Razorpay activation and domain verification. Razorpay Checkout remains available above.'}
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
