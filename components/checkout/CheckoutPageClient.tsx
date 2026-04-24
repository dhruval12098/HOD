'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import CheckoutCustomerStep from '@/components/checkout/CheckoutCustomerStep';
import CheckoutDeliveryStep from '@/components/checkout/CheckoutDeliveryStep';
import CheckoutPaymentStep from '@/components/checkout/CheckoutPaymentStep';
import CheckoutReviewStep from '@/components/checkout/CheckoutReviewStep';
import CheckoutShippingStep from '@/components/checkout/CheckoutShippingStep';
import CheckoutStepper from '@/components/checkout/CheckoutStepper';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';
import type { CheckoutDisplayItem, CheckoutProfileForm } from '@/components/checkout/types';
import Loader from '@/components/home/Loader';
import { getCollectionHref } from '@/lib/browse-context';
import { supabase } from '@/lib/supabase';

function parseCurrency(value: string | null) {
  const parsed = Number(value ?? '0');
  return Number.isFinite(parsed) ? parsed : 0;
}

const CHECKOUT_STEPS = [
  { id: 'customer', label: 'Customer', component: CheckoutCustomerStep },
  { id: 'shipping', label: 'Shipping', component: CheckoutShippingStep },
  { id: 'delivery', label: 'Delivery', component: CheckoutDeliveryStep },
  { id: 'payment', label: 'Payment', component: CheckoutPaymentStep },
  { id: 'review', label: 'Review', component: CheckoutReviewStep },
] as const;

const EMPTY_PROFILE_FORM: CheckoutProfileForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  country: '',
  state: '',
  city: '',
  postal_code: '',
  address_line_1: '',
  address_line_2: '',
};

export default function CheckoutPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [customerForm, setCustomerForm] = useState<CheckoutProfileForm>(EMPTY_PROFILE_FORM);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [taxInfo, setTaxInfo] = useState<{ gstLabel: string; gstPercentage: number } | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: number
    code: string
    title: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    discountAmount: number
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const item = useMemo<CheckoutDisplayItem>(() => ({
    name: searchParams.get('name') ?? 'Selected Piece',
    slug: searchParams.get('slug') ?? '',
    imageUrl: searchParams.get('image') ?? undefined,
    priceFrom: parseCurrency(searchParams.get('price')),
    metal: searchParams.get('metal') ?? '',
    purity: searchParams.get('purity') ?? '',
    sizeOrFit: searchParams.get('size') ?? '',
    gemstone: searchParams.get('gemstone') ?? '',
    carat: searchParams.get('carat') ?? '',
    quantity: 1,
    gstLabel: taxInfo?.gstLabel ?? '',
    gstPercentage: taxInfo?.gstPercentage ?? 0,
    couponCode: appliedCoupon?.code,
    couponDiscount: appliedCoupon?.discountAmount ?? 0,
  }), [searchParams, taxInfo, appliedCoupon]);

  useEffect(() => {
    if (!item.slug) return;
    void (async () => {
      const response = await fetch(`/api/checkout/tax?slug=${encodeURIComponent(item.slug)}`);
      const payload = await response.json().catch(() => null);
      if (response.ok) {
        setTaxInfo({
          gstLabel: payload?.gstLabel ?? 'Taxes',
          gstPercentage: Number(payload?.gstPercentage ?? 0),
        });
      }
    })();
  }, [item.slug]);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        setSessionReady(false);
        setSessionLoading(false);
        return;
      }

      const response = await fetch('/api/checkout/profile', {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      const payload = await response.json().catch(() => null);
      const sessionUser = data.session?.user;

      if (response.ok) {
        const nextProfile = payload?.profile ?? null;
        setCustomerForm({
          first_name: nextProfile?.first_name ?? '',
          last_name: nextProfile?.last_name ?? '',
          email: nextProfile?.email ?? sessionUser?.email ?? '',
          phone: nextProfile?.phone ?? '',
          country: nextProfile?.country ?? '',
          state: nextProfile?.state ?? '',
          city: nextProfile?.city ?? '',
          postal_code: nextProfile?.postal_code ?? '',
          address_line_1: nextProfile?.address_line_1 ?? '',
          address_line_2: nextProfile?.address_line_2 ?? '',
        });
        setSessionReady(true);
        setErrorMessage('');
      } else {
        setCustomerForm((current) => ({
          ...current,
          email: current.email || sessionUser?.email || '',
        }));
        setSessionReady(true);
        setErrorMessage(payload?.error ?? 'Profile could not be prefilled, but you can enter checkout details manually.');
      }

      setSessionLoading(false);
    })();
  }, []);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('page-loader-active', pageLoading);
    return () => {
      document.body.classList.remove('page-loader-active');
    };
  }, [pageLoading]);
  useEffect(() => {
    if (sessionLoading) return;
    const timer = window.setTimeout(() => setPageLoading(false), 150);
    return () => window.clearTimeout(timer);
  }, [sessionLoading]);
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === CHECKOUT_STEPS.length - 1;
  const continueHref = getCollectionHref(searchParams.get('category'));

  const updateCustomerForm = (field: keyof CheckoutProfileForm, value: string) => {
    setCustomerForm((current) => ({ ...current, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setErrorMessage('');
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        setErrorMessage('Please sign in to continue checkout.');
        return;
      }

      const response = await fetch('/api/checkout/place', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          item,
          customer: customerForm,
          coupon: appliedCoupon
            ? {
                id: appliedCoupon.id,
                code: appliedCoupon.code,
                discountAmount: appliedCoupon.discountAmount,
              }
            : null,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(payload?.error ?? 'Unable to place order.');
        return;
      }

      router.push(`/checkout/success?order=${encodeURIComponent(payload.orderNumber)}`);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCodeInput.trim().toUpperCase()
    if (!normalizedCode) return

    setCouponLoading(true)
    try {
      const response = await fetch('/api/checkout/coupon', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          code: normalizedCode,
          subtotal: item.priceFrom * item.quantity,
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.coupon) {
        setAppliedCoupon(null)
        setErrorMessage(payload?.error ?? 'Unable to apply coupon.')
        return
      }

      setAppliedCoupon(payload.coupon)
      setCouponCodeInput(payload.coupon.code)
      setErrorMessage('')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCodeInput('')
  }

  if (sessionLoading) {
    return (
      <section className="min-h-[calc(100vh-111px)] bg-[#f7f8fa] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1240px] rounded-[24px] border border-[#e7ebf0] bg-white p-6 text-sm text-[#667085] shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
          Loading checkout...
        </div>
      </section>
    )
  }

  if (!sessionReady) {
    return (
      <section className="min-h-[calc(100vh-111px)] bg-[#f7f8fa] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[720px] rounded-[24px] border border-[#e7ebf0] bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
          <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-[#101828]">Sign in to continue checkout</h1>
          <p className="mt-3 text-sm leading-7 text-[#667085]">
            Checkout is available only for logged-in customers so we can prefill your profile and create your order properly.
          </p>
          {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-full bg-[#101828] px-6 text-sm font-medium text-white transition hover:bg-[#1d2939]">
              Sign In
            </Link>
            <Link href="/signup" className="inline-flex h-11 items-center justify-center rounded-full border border-[#d0d5dd] px-6 text-sm font-medium text-[#344054] transition hover:border-[#101828] hover:text-[#101828]">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-[calc(100vh-111px)] bg-[#f7f8fa] px-4 py-8 sm:px-6 lg:px-10">
      {pageLoading ? <Loader ready onComplete={() => setPageLoading(false)} /> : null}
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-6">
          <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#98a2b3]">Checkout</div>
          <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.04em] text-[#101828]">Secure your piece</h1>
          <p className="mt-2 text-sm text-[#667085]">Static checkout preview for normal product purchases.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <CheckoutStepper currentStep={currentStep} />

            <div className="rounded-[24px] border border-[#e7ebf0] bg-white px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#98a2b3]">
                    Step {currentStep + 1} of {CHECKOUT_STEPS.length}
                  </div>
                  <div className="mt-1 text-base font-semibold text-[#101828]">{CHECKOUT_STEPS[currentStep].label}</div>
                </div>
                <div className="text-sm text-[#667085]">
                  {Math.round(((currentStep + 1) / CHECKOUT_STEPS.length) * 100)}% complete
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eef2f6]">
                <div
                  className="h-full rounded-full bg-[#101828] transition-[width] duration-300 ease-out"
                  style={{ width: `${((currentStep + 1) / CHECKOUT_STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            {errorMessage ? (
              <div className="rounded-[24px] border border-[rgba(220,38,38,0.18)] bg-[rgba(254,242,242,0.9)] px-5 py-4 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="animate-[fadeUp_0.35s_ease]">
              {currentStep === 0 ? <CheckoutCustomerStep form={customerForm} onChange={updateCustomerForm} /> : null}
              {currentStep === 1 ? <CheckoutShippingStep form={customerForm} onChange={updateCustomerForm} /> : null}
              {currentStep === 2 ? <CheckoutDeliveryStep /> : null}
              {currentStep === 3 ? <CheckoutPaymentStep /> : null}
              {currentStep === 4 ? <CheckoutReviewStep onPlaceOrder={handlePlaceOrder} isPlacingOrder={placingOrder} continueHref={continueHref} /> : null}
            </div>

            {!isLastStep ? (
              <div className="rounded-[24px] border border-[#e7ebf0] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
                    disabled={isFirstStep}
                    className={`inline-flex h-11 items-center justify-center rounded-full border px-6 text-sm font-medium transition ${
                      isFirstStep
                        ? 'cursor-not-allowed border-[#e4e7ec] text-[#98a2b3]'
                        : 'border-[#d0d5dd] text-[#344054] hover:border-[#101828] hover:text-[#101828]'
                    }`}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep((step) => Math.min(CHECKOUT_STEPS.length - 1, step + 1))}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-[#101828] px-6 text-sm font-medium text-white transition hover:bg-[#1d2939]"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#d0d5dd] bg-white px-6 text-sm font-medium text-[#344054] transition hover:border-[#101828] hover:text-[#101828]"
                >
                  Back
                </button>
              </div>
            )}

            <div className="flex justify-start">
              <Link
                href={continueHref}
                className="inline-flex h-11 items-center justify-center rounded-full border border-transparent px-2 text-sm font-medium text-[#667085] transition hover:text-[#101828]"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="lg:sticky lg:top-[140px] lg:self-start">
            <div className="space-y-4">
              <div className="rounded-[24px] border border-[#e7ebf0] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-6">
                <div className="text-[18px] font-semibold tracking-[-0.02em] text-[#101828]">Coupon</div>
                <div className="mt-4 flex gap-2">
                  <input
                    value={couponCodeInput}
                    onChange={(event) => setCouponCodeInput(event.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="h-11 flex-1 rounded-full border border-[#d0d5dd] px-4 text-sm text-[#101828] outline-none transition-colors focus:border-[#101828]"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[#d0d5dd] px-4 text-sm font-medium text-[#344054] transition hover:border-[#101828] hover:text-[#101828]"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleApplyCoupon()}
                      disabled={couponLoading}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[#101828] px-5 text-sm font-medium text-white transition hover:bg-[#1d2939] disabled:opacity-60"
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </button>
                  )}
                </div>
                {appliedCoupon ? (
                  <div className="mt-3 text-sm text-[#12b76a]">
                    {appliedCoupon.code} applied. You saved ${Math.round(appliedCoupon.discountAmount)}.
                  </div>
                ) : null}
              </div>
              <CheckoutSummary item={item} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
