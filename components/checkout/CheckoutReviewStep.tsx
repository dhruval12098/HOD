import Link from 'next/link';
import CheckoutSectionCard from '@/components/checkout/CheckoutSectionCard';
import { getCollectionHref } from '@/lib/browse-context';
import { getLoveLetterOccasionLabel, type LoveLetterDraft } from '@/lib/love-letter';

export default function CheckoutReviewStep({
  onPlaceOrder,
  isPlacingOrder,
  continueHref,
  loveLetter,
}: {
  onPlaceOrder: () => void
  isPlacingOrder: boolean
  continueHref?: string
  loveLetter?: LoveLetterDraft | null
}) {
  return (
    <CheckoutSectionCard
      title="Review"
      description="Review your order and create a pending order record in the admin panel."
    >
      {loveLetter ? (
        <div className="mb-4 rounded-[18px] border border-[#eadfbc] bg-[#fffaf0] p-4">
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
          Payment is not integrated yet. This step will create a pending order so it shows up in admin orders.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onPlaceOrder}
            disabled={isPlacingOrder}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#101828] px-6 text-sm font-medium text-white transition hover:bg-[#1d2939]"
          >
            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
          </button>
          <Link
            href={continueHref || getCollectionHref()}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#d0d5dd] px-6 text-sm font-medium text-[#344054] transition hover:border-[#101828] hover:text-[#101828]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </CheckoutSectionCard>
  );
}
