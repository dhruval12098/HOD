'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCollectionHref } from '@/lib/browse-context';
import { supabase } from '@/lib/supabase';

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const requestedOrderNumber = searchParams.get('order')?.trim() || '';
  const continueHref = getCollectionHref(searchParams.get('category'));
  const [orderNumber, setOrderNumber] = useState('');
  const [status, setStatus] = useState<'loading' | 'confirmed' | 'invalid' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    const confirmOrder = async () => {
      if (!requestedOrderNumber) {
        setStatus('invalid');
        return;
      }

      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        if (!cancelled) setStatus('invalid');
        return;
      }

      try {
        const response = await fetch(`/api/checkout/success?order=${encodeURIComponent(requestedOrderNumber)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store',
        });
        const payload = await response.json().catch(() => null) as { orderNumber?: string } | null;

        if (cancelled) return;
        if (response.ok && payload?.orderNumber) {
          setOrderNumber(payload.orderNumber);
          setStatus('confirmed');
        } else {
          setStatus(response.status >= 500 ? 'error' : 'invalid');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    void confirmOrder();
    return () => { cancelled = true; };
  }, [requestedOrderNumber]);

  if (status !== 'confirmed') {
    const isLoading = status === 'loading';
    return (
      <section className="min-h-[calc(100vh-111px)] bg-[#f7f8fa] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[720px] rounded-[28px] border border-[#e7ebf0] bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-10">
          <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-[#101828]">
            {isLoading ? 'Confirming your order…' : 'Order confirmation unavailable'}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#667085]">
            {isLoading
              ? 'We are securely checking your completed payment.'
              : status === 'error'
                ? 'We could not check this order right now. Please try again or view your orders.'
                : 'This link does not match a completed order in your account.'}
          </p>
          {!isLoading ? (
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/profile?tab=orders" className="inline-flex h-11 items-center justify-center rounded-full bg-[#101828] px-6 text-sm font-medium text-white transition hover:bg-[#1d2939]">
                View Orders
              </Link>
              <Link href={continueHref} className="inline-flex h-11 items-center justify-center rounded-full border border-[#d0d5dd] px-6 text-sm font-medium text-[#344054] transition hover:border-[#101828] hover:text-[#101828]">
                Continue Shopping
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-111px)] bg-[#f7f8fa] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[720px] rounded-[28px] border border-[#e7ebf0] bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#101828] text-white">
          ✓
        </div>
        <h1 className="mt-5 text-[32px] font-semibold tracking-[-0.04em] text-[#101828]">Order placed</h1>
        <p className="mt-3 text-sm leading-7 text-[#667085]">
          Your payment has been confirmed and your order has been placed successfully.
        </p>

        <div className="mt-6 rounded-[20px] border border-[#eaecf0] bg-[#fcfcfd] p-5 text-left">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#98a2b3]">Order Number</div>
          <div className="mt-2 text-lg font-semibold text-[#101828]">{orderNumber}</div>
          <div className="mt-4 text-sm text-[#667085]">Estimated delivery: approximately 3 to 4 weeks</div>
          <div className="mt-2 text-sm text-[#667085]">You will also receive delivery and progress updates by email after the order is placed.</div>
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
