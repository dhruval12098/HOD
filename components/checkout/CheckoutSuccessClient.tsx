'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getCollectionHref } from '@/lib/browse-context';

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || 'Pending Confirmation';
  const continueHref = getCollectionHref(searchParams.get('category'));

  return (
    <section className="min-h-[calc(100vh-111px)] bg-[#f7f8fa] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[720px] rounded-[28px] border border-[#e7ebf0] bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#101828] text-white">
          ✓
        </div>
        <h1 className="mt-5 text-[32px] font-semibold tracking-[-0.04em] text-[#101828]">Order placed</h1>
        <p className="mt-3 text-sm leading-7 text-[#667085]">
          Your pending order has been created and is now available in the admin orders panel.
        </p>

        <div className="mt-6 rounded-[20px] border border-[#eaecf0] bg-[#fcfcfd] p-5 text-left">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#98a2b3]">Order Number</div>
          <div className="mt-2 text-lg font-semibold text-[#101828]">{orderNumber}</div>
          <div className="mt-4 text-sm text-[#667085]">Estimated delivery: 3 to 5 business days</div>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={continueHref}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#101828] px-6 text-sm font-medium text-white transition hover:bg-[#1d2939]"
          >
            Continue Shopping
          </Link>
          <Link
            href="/profile?tab=orders"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#d0d5dd] px-6 text-sm font-medium text-[#344054] transition hover:border-[#101828] hover:text-[#101828]"
          >
            View Orders
          </Link>
        </div>
      </div>
    </section>
  );
}
