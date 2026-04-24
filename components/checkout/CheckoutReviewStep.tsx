import Link from 'next/link';
import CheckoutSectionCard from '@/components/checkout/CheckoutSectionCard';
import { getCollectionHref } from '@/lib/browse-context';

export default function CheckoutReviewStep({
  onPlaceOrder,
  isPlacingOrder,
  continueHref,
}: {
  onPlaceOrder: () => void
  isPlacingOrder: boolean
  continueHref?: string
}) {
  return (
    <CheckoutSectionCard
      title="Review"
      description="Review your order and create a pending order record in the admin panel."
    >
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
