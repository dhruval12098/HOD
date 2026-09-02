'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import type { CheckoutChargeQuote, CheckoutDisplayItem, CheckoutPostalAreaOption, CheckoutPostalLookupState, CheckoutProfileForm } from '@/components/checkout/types';
import { useCurrency } from '@/context/CurrencyContext';
import { getCollectionHref } from '@/lib/browse-context';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/hooks/useCart';
import { getProductKey, type CartProductSnapshot } from '@/lib/product-keys';
import type { StorefrontProduct } from '@/lib/catalog-products';
import { clearLoveLetterDraft, readLoveLetterDraft, type LoveLetterDraft } from '@/lib/love-letter';
import { PromotionBanner, type StorefrontPromotion } from '@/components/commerce/PromotionBanner';

const APPLIED_COUPON_KEY = 'hod_applied_coupon'

type RazorpayCheckoutSuccess = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

function buildCheckoutRequestItem(item: CheckoutDisplayItem) {
  return {
    name: item.name,
    slug: item.slug,
    metalVariantId: item.metalVariantId,
    imageUrl: item.imageUrl,
    metal: item.metal,
    purity: item.purity,
    sizeOrFit: item.sizeOrFit,
    gemstone: item.gemstone,
    carat: item.carat,
    quantity: item.quantity,
    customSelections: item.customSelections,
  }
}

type RazorpayCheckoutFailure = {
  error?: {
    code?: string
    description?: string
    source?: string
    step?: string
    reason?: string
    metadata?: {
      order_id?: string
      payment_id?: string
    }
  }
}

type RazorpayCheckoutOptions = {
  key: string
  order_id: string
  amount: number
  currency: string
  name: string
  description?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
  }
  handler: (response: RazorpayCheckoutSuccess) => void | Promise<void>
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void
      on: (event: 'payment.failed', handler: (response: RazorpayCheckoutFailure) => void) => void
    }
  }
}

type PendingPaymentSession = {
  orderId: string
  orderNumber: string
  razorpay: {
    keyId: string
    orderId: string
    amount: number
    currency: string
    name: string
    description?: string
    prefill?: {
      name?: string
      email?: string
      contact?: string
    }
    baseCurrency?: string
    baseAmount?: number
    exchangeRate?: number
    exchangeRateSource?: string
  }
}

type PaymentUiStage = 'idle' | 'starting' | 'confirming'

type PostalLookupResponse = {
  areas?: CheckoutPostalAreaOption[]
  error?: string
}

const POSTAL_CODE_LOOKUP_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s-]{2,11}$/

function normalizePostalCodeValue(value: string) {
  return value.trim().replace(/\s+/g, ' ').slice(0, 12)
}

function isLookupReadyAfterTyping(postalCode: string) {
  return POSTAL_CODE_LOOKUP_PATTERN.test(normalizePostalCodeValue(postalCode))
}

function loadRazorpayCheckoutScript() {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.Razorpay) return Promise.resolve(true)

  return new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.Razorpay)), { once: true })
      existing.addEventListener('error', () => resolve(false), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpayCheckout = 'true'
    script.onload = () => resolve(Boolean(window.Razorpay))
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

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
  district: '',
  city: '',
  postal_code: '',
  address_line_1: '',
  address_line_2: '',
};

export default function CheckoutPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: cartItems, clearCart, isHydrated: isCartHydrated } = useCart();
  const { currencyCode, format } = useCurrency();
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [customerForm, setCustomerForm] = useState<CheckoutProfileForm>(EMPTY_PROFILE_FORM);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentUiStage, setPaymentUiStage] = useState<PaymentUiStage>('idle')
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CheckoutProfileForm, string>>>({});
  const [taxInfo, setTaxInfo] = useState<{ gstLabel: string; gstPercentage: number } | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: number
    code: string
    title: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    discountAmount: number
    rewardType?: 'percentage' | 'fixed' | 'free_gift'
    minimumOrderAmount?: number
    gift?: { productId: string; name: string; slug: string; sku: string | null; imageUrl: string; originalUnitPrice: number; variantData: Record<string, unknown> } | null
    bannerTitle?: string | null
    bannerDescription?: string | null
    bannerImageUrl?: string
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [promotions, setPromotions] = useState<StorefrontPromotion[]>([])
  const [pendingPaymentSession, setPendingPaymentSession] = useState<PendingPaymentSession | null>(null)
  const [chargeQuote, setChargeQuote] = useState<CheckoutChargeQuote | null>(null)
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [quoteError, setQuoteError] = useState('')
  const [authoritativePricing, setAuthoritativePricing] = useState<{
    subtotalAmount: number
    gstAmount: number
    couponDiscountAmount: number
    totalAmount: number
    lines: Array<{ slug: string; unitPrice: number; quantity: number }>
    gift?: { productId: string; name: string; slug: string; sku: string | null; imageUrl: string; originalUnitPrice: number; variantData: Record<string, unknown> } | null
  } | null>(null)
  const [postalLookup, setPostalLookup] = useState<CheckoutPostalLookupState | null>(null)
  const [postalAreaOptions, setPostalAreaOptions] = useState<CheckoutPostalAreaOption[]>([])
  const [cartProducts, setCartProducts] = useState<CartProductSnapshot[]>([]);
  const [taxMap, setTaxMap] = useState<Record<string, { gstLabel: string; gstPercentage: number }>>({});
  const lastPostalAutofillRef = useRef<{
    country: string
    postalCode: string
    city: string
    district: string
    state: string
  } | null>(null)
  const postalLookupAbortRef = useRef<AbortController | null>(null)
  const checkoutAttemptKeyRef = useRef<string | null>(null)
  const lastPostalLookupKeyRef = useRef<string>('')
  const cartMode = searchParams.get('mode') === 'cart';

  useEffect(() => {
    void fetch('/api/public/promotions', { cache: 'no-store' }).then((response) => response.json()).then((payload) => setPromotions(Array.isArray(payload?.items) ? payload.items : [])).catch(() => {})
    if (!cartMode) {
      setAppliedCoupon(null)
      setCouponCodeInput('')
      return
    }
    try { const stored = localStorage.getItem(APPLIED_COUPON_KEY); if (stored) { const parsed = JSON.parse(stored); setAppliedCoupon(parsed); setCouponCodeInput(parsed.code || '') } } catch {}
  }, [cartMode])

  const singleItem = useMemo<CheckoutDisplayItem>(() => ({
    name: searchParams.get('name') ?? 'Selected Piece',
    slug: searchParams.get('slug') ?? '',
    metalVariantId: searchParams.get('variant') ?? undefined,
    imageUrl: searchParams.get('image') ?? undefined,
    priceFrom: parseCurrency(searchParams.get('price')),
    metal: searchParams.get('metal') ?? '',
    purity: searchParams.get('purity') ?? '',
    sizeOrFit: searchParams.get('size') ?? '',
    gemstone: searchParams.get('gemstone') ?? '',
    carat: searchParams.get('carat') ?? '',
    customSelections: (() => { try { return JSON.parse(decodeURIComponent(searchParams.get('custom') || '[]')) } catch { return [] } })(),
    quantity: 1,
    gstLabel: taxInfo?.gstLabel ?? '',
    gstPercentage: taxInfo?.gstPercentage ?? 0,
  }), [searchParams, taxInfo]);

  useEffect(() => {
    if (!cartMode || !isCartHydrated) return;
    const legacy = cartItems.filter((item) => !item.snapshot)
    if (!legacy.length) { setCartProducts([]); return }
    let ignore = false;
    void (async () => {
      const response = await fetch('/api/public/products/cart', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slugs: legacy.map((item) => item.productSlug).filter(Boolean), ids: legacy.map((item) => item.productKey).filter(Boolean) }) });
      const payload = await response.json().catch(() => null);
      if (!ignore && response.ok && Array.isArray(payload?.items)) {
        setCartProducts(payload.items);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [cartItems, cartMode, isCartHydrated]);

  const resolvedCartItems = useMemo(() => {
    if (!cartMode) return [];
    return cartItems
      .map((entry) => {
        const product = entry.snapshot || cartProducts.find((candidate) => getProductKey(candidate) === entry.productKey || candidate.slug === entry.productSlug);
        if (!product) return null;
        return { entry, product };
      })
      .filter(Boolean) as Array<{ entry: typeof cartItems[number]; product: typeof cartProducts[number] }>;
  }, [cartItems, cartMode, cartProducts]);
  const unavailableCartItemCount = cartMode ? Math.max(0, cartItems.length - resolvedCartItems.length) : 0

  const cartCheckoutItems = useMemo<CheckoutDisplayItem[]>(() => {
    if (!cartMode) return [];
    return resolvedCartItems
      .map(({ entry, product }) => {
        const tax = taxMap[product.slug];
        return {
          name: product.name,
          slug: product.slug,
          metalVariantId: entry.selection.metalVariantId,
          imageUrl: entry.selection.resolvedImageUrl || product.imageUrl || undefined,
          priceFrom: entry.selection.resolvedPrice ?? product.priceFrom,
          metal: entry.selection.metal ?? '',
          purity: entry.selection.purity ?? '',
          sizeOrFit: entry.selection.ringSize || entry.selection.sizeOrFit || '',
          gemstone: entry.selection.gemstone ?? '',
          carat: entry.selection.hiphopCarat ?? '',
          customSelections: entry.selection.customSelections ?? [],
          quantity: entry.quantity,
          gstLabel: tax?.gstLabel ?? 'Taxes',
          gstPercentage: tax?.gstPercentage ?? 0,
        };
      })
      .filter(Boolean) as CheckoutDisplayItem[];
  }, [cartMode, resolvedCartItems, taxMap]);

  const cartModeLoveLetterDraft = useMemo<LoveLetterDraft | null>(() => {
    if (!cartMode || resolvedCartItems.length !== 1) return null
    return resolvedCartItems[0]?.entry.selection.loveLetter ?? null
  }, [cartMode, resolvedCartItems])

  const loveLetterDraft = useMemo<LoveLetterDraft | null>(() => {
    if (cartMode) return cartModeLoveLetterDraft
    const draft = readLoveLetterDraft()
    if (!draft) return null
    if (draft.sourceSlug && draft.sourceSlug !== singleItem.slug) return null
    return draft
  }, [cartMode, cartModeLoveLetterDraft, singleItem.slug])

  const checkoutItems = useMemo(
    () =>
      cartMode
        ? cartCheckoutItems
        : singleItem.slug
          ? [
              {
                ...singleItem,
                gstLabel: taxInfo?.gstLabel ?? singleItem.gstLabel ?? 'Taxes',
                gstPercentage: taxInfo?.gstPercentage ?? singleItem.gstPercentage ?? 0,
              },
            ]
          : [],
    [cartMode, cartCheckoutItems, singleItem, taxInfo]
  );

  const displayedSubtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + (item.priceFrom * item.quantity), 0),
    [checkoutItems]
  );
  const displayedCouponDiscount = appliedCoupon?.discountAmount ?? 0
  const displayedGstTotal = useMemo(
    () => checkoutItems.reduce((sum, item) => {
      const lineSubtotal = item.priceFrom * item.quantity
      const discountShare = displayedSubtotal > 0 ? displayedCouponDiscount * (lineSubtotal / displayedSubtotal) : 0
      const taxableLineAmount = Math.max(0, lineSubtotal - discountShare)
      return sum + (taxableLineAmount * ((item.gstPercentage ?? 0) / 100))
    }, 0),
    [checkoutItems, displayedCouponDiscount, displayedSubtotal]
  )
  const subtotal = authoritativePricing?.subtotalAmount ?? displayedSubtotal
  const couponDiscount = authoritativePricing?.couponDiscountAmount ?? displayedCouponDiscount
  const gstTotal = authoritativePricing?.gstAmount ?? displayedGstTotal
  const totalPayable = authoritativePricing?.totalAmount ?? Math.max(0, subtotal - couponDiscount) + gstTotal
  const authoritativeCheckoutItems = useMemo(
    () => checkoutItems.map((item, index) => ({
      ...item,
      priceFrom: authoritativePricing?.lines[index]?.unitPrice ?? item.priceFrom,
    })),
    [authoritativePricing?.lines, checkoutItems]
  )
  const hasAuthoritativePriceChange = useMemo(
    () => Boolean(authoritativePricing?.lines.some((line, index) => Math.abs(line.unitPrice - Number(checkoutItems[index]?.priceFrom || 0)) >= 0.01)),
    [authoritativePricing?.lines, checkoutItems]
  )

  const paymentSessionSignature = useMemo(
    () =>
      JSON.stringify({
        items: checkoutItems,
        customerForm,
        couponId: appliedCoupon?.id ?? null,
        couponAmount: appliedCoupon?.discountAmount ?? 0,
        loveLetter: loveLetterDraft,
        currencyCode,
      }),
    [appliedCoupon?.discountAmount, appliedCoupon?.id, checkoutItems, currencyCode, customerForm, loveLetterDraft]
  )

  useEffect(() => {
    let ignore = false
    void (async () => {
      const ready = await loadRazorpayCheckoutScript()
      if (!ignore) setRazorpayReady(ready)
    })()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    setPendingPaymentSession(null)
    checkoutAttemptKeyRef.current = null
  }, [paymentSessionSignature])

  useEffect(() => {
    let ignore = false
    if (!checkoutItems.length) return
    if (!currencyCode && !customerForm.country.trim()) {
      setChargeQuote(null)
      setAuthoritativePricing(null)
      setQuoteStatus('idle')
      setQuoteError('')
      return
    }

    setQuoteStatus('loading')
    setQuoteError('')
    void (async () => {
      try {
        const response = await fetch('/api/checkout/quote', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            country: customerForm.country,
            currencyCode,
            coupon: appliedCoupon ? { id: appliedCoupon.id, code: appliedCoupon.code } : null,
            items: checkoutItems.map((item) => ({
              slug: item.slug,
              name: item.name,
              metalVariantId: item.metalVariantId,
              metal: item.metal,
              purity: item.purity,
              quantity: item.quantity,
            })),
          }),
        })
        const payload = await response.json().catch(() => null)
        if (!ignore && response.ok) {
          setChargeQuote(payload?.quote ?? null)
          setAuthoritativePricing(payload?.pricing ?? null)
          setQuoteStatus(payload?.quote && payload?.pricing ? 'ready' : 'error')
          setQuoteError(payload?.quote && payload?.pricing ? '' : 'We could not confirm the latest checkout total.')
        } else if (!ignore) {
          setChargeQuote(null)
          setAuthoritativePricing(null)
          setQuoteStatus('error')
          setQuoteError(response.status >= 500 ? 'We could not confirm pricing right now. Please try again shortly.' : payload?.error || 'One or more products need your attention before checkout.')
          if (appliedCoupon && response.status < 500) {
            setAppliedCoupon(null)
            setCouponCodeInput('')
            if (cartMode) localStorage.removeItem(APPLIED_COUPON_KEY)
            setErrorMessage(payload?.error || 'This coupon is not valid for the current checkout.')
          }
        }
      } catch {
        if (!ignore) {
          setChargeQuote(null)
          setAuthoritativePricing(null)
          setQuoteStatus('error')
          setQuoteError('We could not confirm pricing right now. Check your connection and try again.')
        }
      }
    })()

    return () => {
      ignore = true
    }
  }, [appliedCoupon, cartMode, checkoutItems, currencyCode, customerForm.country])

  const setPostalCodeFieldError = useCallback((message?: string) => {
    setFieldErrors((current) => {
      if (!message) {
        if (!current.postal_code) return current
        const next = { ...current }
        delete next.postal_code
        return next
      }

      if (current.postal_code === message) return current
      return { ...current, postal_code: message }
    })
  }, [])

  const applyPostalArea = useCallback((area: CheckoutPostalAreaOption, postalCode: string) => {
    setCustomerForm((current) => ({
      ...current,
      city: area.city,
      district: area.district,
      state: area.state,
      country: area.country,
    }))

    setFieldErrors((current) => {
      const next = { ...current }
      delete next.city
      delete next.district
      delete next.state
      delete next.country
      delete next.postal_code
      return next
    })

    lastPostalAutofillRef.current = {
      country: area.country,
      postalCode,
      city: area.city,
      district: area.district,
      state: area.state,
    }

    setPostalLookup({
      status: 'success',
      message: 'Location filled from postal code.',
      city: area.city || undefined,
      district: area.district || undefined,
      state: area.state || undefined,
      country: area.country || undefined,
      countryCode: area.country === 'India' ? 'IN' : undefined,
      locked: true,
    })
  }, [])

  const lookupPostalCode = useCallback(
    async (postalCode: string) => {
      const normalizedPostalCode = normalizePostalCodeValue(postalCode)
      const selectedCountry = customerForm.country.trim()
      const lookupKey = `${selectedCountry.toUpperCase()}:${normalizedPostalCode.toUpperCase()}`

      if (!normalizedPostalCode || normalizedPostalCode.length < 3) {
        setPostalLookup(null)
        setPostalAreaOptions([])
        setPostalCodeFieldError()
        lastPostalLookupKeyRef.current = ''
        return
      }

      if (!POSTAL_CODE_LOOKUP_PATTERN.test(normalizedPostalCode)) {
        setPostalLookup({
          status: 'error',
          message: 'Invalid postal code, please check',
        })
        setPostalAreaOptions([])
        setPostalCodeFieldError('Invalid postal code, please check')
        return
      }

      if (lastPostalLookupKeyRef.current === lookupKey) {
        return
      }

      postalLookupAbortRef.current?.abort()
      const controller = new AbortController()
      postalLookupAbortRef.current = controller

      setPostalLookup({
        status: 'loading',
        message: 'Looking up city, district, state, and country...',
      })
      setPostalAreaOptions([])
      setCustomerForm((current) => ({
        ...current,
        city: '',
        district: '',
        state: '',
      }))
      setPostalCodeFieldError()

      try {
        const response = await fetch(
          `/api/checkout/postal-lookup?postalCode=${encodeURIComponent(normalizedPostalCode)}${selectedCountry ? `&country=${encodeURIComponent(selectedCountry)}` : ''}`,
          {
            cache: 'no-store',
            signal: controller.signal,
            method: 'GET',
            headers: { accept: 'application/json' },
          }
        )
        const payload = (await response.json().catch(() => null)) as PostalLookupResponse | null

        if (!response.ok) {
          throw new Error(payload?.error || 'Network error')
        }

        const areas = Array.isArray(payload?.areas) ? payload.areas : []

        if (!areas.length) {
          const message = 'Invalid postal code, please check'
          setPostalLookup({
            status: 'error',
            message,
          })
          setPostalAreaOptions([])
          setPostalCodeFieldError(message)
          return
        }

        setPostalAreaOptions(areas)
        applyPostalArea(areas[0], normalizedPostalCode)
        lastPostalLookupKeyRef.current = `${areas[0].country.trim().toUpperCase()}:${normalizedPostalCode.toUpperCase()}`
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('Postal lookup failed:', error)
        const message = error instanceof Error && error.message
          ? error.message
          : 'Could not fetch location, try again'
        setPostalLookup({
          status: 'error',
          message,
        })
        setPostalAreaOptions([])
        setPostalCodeFieldError(message)
      } finally {
        if (postalLookupAbortRef.current === controller) {
          postalLookupAbortRef.current = null
        }
      }
    },
    [applyPostalArea, customerForm.country, setPostalCodeFieldError]
  )

  const handlePostalCodeBlur = useCallback(() => {
    const postalCode = normalizePostalCodeValue(customerForm.postal_code)

    if (!postalCode) {
      setPostalLookup(null)
      setPostalAreaOptions([])
      setPostalCodeFieldError()
      return
    }

    if (isLookupReadyAfterTyping(postalCode)) {
      void lookupPostalCode(postalCode)
    }
  }, [customerForm.postal_code, lookupPostalCode, setPostalCodeFieldError])

  useEffect(() => {
    const postalCode = normalizePostalCodeValue(customerForm.postal_code)

    if (!postalCode || postalCode.length < 3) {
      postalLookupAbortRef.current?.abort()
      lastPostalLookupKeyRef.current = ''
      setPostalLookup(null)
      setPostalAreaOptions([])
      setPostalCodeFieldError()
      lastPostalAutofillRef.current = null
      if (customerForm.city || customerForm.district || customerForm.state || customerForm.country) {
        setCustomerForm((current) => ({
          ...current,
          city: '',
          district: '',
          state: '',
          country: '',
        }))
      }
      return
    }

    if (!isLookupReadyAfterTyping(postalCode)) {
      postalLookupAbortRef.current?.abort()
      setPostalLookup(null)
      return
    }

    const timeoutId = window.setTimeout(() => {
      void lookupPostalCode(postalCode)
    }, 400)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [customerForm.city, customerForm.country, customerForm.district, customerForm.postal_code, customerForm.state, lookupPostalCode, setPostalCodeFieldError])

  useEffect(() => {
    if (cartMode || !singleItem.slug) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`/api/checkout/tax?slug=${encodeURIComponent(singleItem.slug)}`, {
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => null);
        if (response.ok) {
          setTaxInfo({
            gstLabel: payload?.gstLabel ?? 'Taxes',
            gstPercentage: Number(payload?.gstPercentage ?? 0),
          });
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Unable to load product tax information:', error);
        }
      }
    })();
    return () => controller.abort();
  }, [cartMode, singleItem.slug]);

  useEffect(() => {
    if (!cartMode || !resolvedCartItems.length) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const slugs = [...new Set(resolvedCartItems.map(({ product }) => product.slug))];
        const response = await fetch('/api/checkout/tax', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ slugs }),
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => null);
        if (response.ok) {
          setTaxMap(payload?.taxBySlug ?? {});
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Unable to load cart tax information:', error);
        }
      }
    })();
    return () => controller.abort();
  }, [cartMode, resolvedCartItems]);

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
          district: '',
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
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === CHECKOUT_STEPS.length - 1;
  const continueHref = getCollectionHref(searchParams.get('category'));

  const patchCustomerForm = (patch: Partial<CheckoutProfileForm>) => {
    setCustomerForm((current) => ({ ...current, ...patch }))
    setFieldErrors((current) => {
      const next = { ...current }
      let changed = false

      for (const key of Object.keys(patch) as Array<keyof CheckoutProfileForm>) {
        if (!current[key]) continue
        delete next[key]
        changed = true
      }

      if (!changed) return current
      return next
    })
  }

  const updateCustomerForm = (field: keyof CheckoutProfileForm, value: string) => {
    patchCustomerForm({ [field]: value })
  };

  const handlePostalAreaSelect = useCallback(
    (id: string) => {
      const postalCode = normalizePostalCodeValue(customerForm.postal_code)
      const area = postalAreaOptions.find((option) => option.id === id)
      if (area) applyPostalArea(area, postalCode)
    },
    [applyPostalArea, customerForm.postal_code, postalAreaOptions]
  )

  const validateCheckoutForm = () => {
    const nextErrors: Partial<Record<keyof CheckoutProfileForm, string>> = {}
    const trimmed = {
      first_name: customerForm.first_name.trim(),
      last_name: customerForm.last_name.trim(),
      email: customerForm.email.trim(),
      phone: customerForm.phone.trim(),
      country: customerForm.country.trim(),
      state: customerForm.state.trim(),
      district: customerForm.district.trim(),
      city: customerForm.city.trim(),
      postal_code: customerForm.postal_code.trim(),
      address_line_1: customerForm.address_line_1.trim(),
      address_line_2: customerForm.address_line_2.trim(),
    }

    if (!trimmed.first_name) nextErrors.first_name = 'First name is required.'
    if (!trimmed.last_name) nextErrors.last_name = 'Last name is required.'
    if (!trimmed.email) {
      nextErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    const digitsOnlyPhone = trimmed.phone.replace(/[^\d+]/g, '')
    if (!trimmed.phone) {
      nextErrors.phone = 'Mobile number is required.'
    } else if (!/^\+?[0-9][0-9\s\-()]{7,19}$/.test(trimmed.phone) || digitsOnlyPhone.replace(/\D/g, '').length < 8) {
      nextErrors.phone = 'Enter a valid mobile number with country code.'
    }

    if (!trimmed.country) nextErrors.country = 'Country is required.'
    if (!trimmed.state) nextErrors.state = 'State, province, or region is required.'
    if (!trimmed.city) nextErrors.city = 'City is required.'
    if (!trimmed.postal_code) {
      nextErrors.postal_code = 'Postal code or pincode is required.'
    } else if (!/^[A-Za-z0-9][A-Za-z0-9\s-]{2,11}$/.test(trimmed.postal_code)) {
      nextErrors.postal_code = 'Enter a valid postal code or pincode.'
    }
    if (!trimmed.address_line_1) nextErrors.address_line_1 = 'Address line 1 is required.'

    return nextErrors
  }

  const validateFieldsForStep = (stepIndex: number) => {
    const allErrors = validateCheckoutForm()
    const keysForStep: Array<keyof CheckoutProfileForm> =
      stepIndex === 0
        ? ['first_name', 'last_name', 'email', 'phone']
        : stepIndex === 1
          ? ['country', 'state', 'city', 'postal_code', 'address_line_1']
          : []

    const stepErrors = keysForStep.reduce<Partial<Record<keyof CheckoutProfileForm, string>>>((acc, key) => {
      if (allErrors[key]) acc[key] = allErrors[key]
      return acc
    }, {})

    setFieldErrors((current) => ({ ...current, ...stepErrors }))
    return stepErrors
  }

  const handleNextStep = () => {
    const stepErrors = validateFieldsForStep(currentStep)
    if (Object.keys(stepErrors).length > 0) {
      setErrorMessage('Please complete the required checkout details before continuing.')
      return
    }

    setErrorMessage('')
    setCurrentStep((step) => Math.min(CHECKOUT_STEPS.length - 1, step + 1))
  }

  const handlePayNow = async () => {
    const allErrors = validateCheckoutForm()
    setFieldErrors(allErrors)
    if (Object.keys(allErrors).length > 0) {
      setErrorMessage('Please complete all required customer and shipping details before continuing to payment.')
      return
    }

    if (unavailableCartItemCount > 0) {
      setErrorMessage('One or more cart items are no longer available. Return to your cart to remove or reconfigure them.')
      return
    }

    if (quoteStatus !== 'ready' || !chargeQuote || !authoritativePricing) {
      setErrorMessage(quoteError || 'Please wait while we confirm the latest price and availability.')
      return
    }

    if (!razorpayReady || !window.Razorpay) {
      setErrorMessage('Razorpay checkout is still loading. Please try again in a moment.')
      return
    }

    setProcessingPayment(true);
    setPaymentUiStage('starting')
    setErrorMessage('');
    let popupOpened = false
    try {
      const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;
        if (!accessToken) {
          setErrorMessage('Please sign in to continue checkout.');
          setPaymentUiStage('idle')
          setProcessingPayment(false)
          return;
        }

      const paymentSession =
        pendingPaymentSession ||
        (await (async () => {
          const idempotencyKey = checkoutAttemptKeyRef.current || window.crypto.randomUUID()
          checkoutAttemptKeyRef.current = idempotencyKey
          const response = await fetch('/api/checkout/place', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              idempotencyKey,
              item: cartMode ? null : buildCheckoutRequestItem(singleItem),
              items: cartMode ? checkoutItems.map(buildCheckoutRequestItem) : undefined,
              customer: customerForm,
              loveLetter: loveLetterDraft,
              currencyCode,
              coupon: appliedCoupon
                ? {
                    id: appliedCoupon.id,
                    code: appliedCoupon.code,
                  }
                : null,
            }),
          })
          const payload = await response.json().catch(() => null)

          if (!response.ok) {
            if (payload?.retryable) checkoutAttemptKeyRef.current = null
            setErrorMessage(payload?.error ?? 'Unable to start payment.')
            return null
          }

          const nextSession = payload as PendingPaymentSession
          setPendingPaymentSession(nextSession)
          return nextSession
        })())

        if (!paymentSession) {
        setPaymentUiStage('idle')
        setProcessingPayment(false)
          return
        }

        const razorpayInstance = new window.Razorpay({
        key: paymentSession.razorpay.keyId,
        order_id: paymentSession.razorpay.orderId,
        amount: paymentSession.razorpay.amount,
        currency: paymentSession.razorpay.currency,
        name: paymentSession.razorpay.name,
        description: paymentSession.razorpay.description,
        prefill: paymentSession.razorpay.prefill,
        theme: {
          color: '#101828',
        },
          modal: {
            ondismiss: () => {
              setPaymentUiStage('idle')
              setProcessingPayment(false)
              setErrorMessage('Payment popup closed. Your order is still pending payment and you can try again.')
            },
          },
          handler: async (paymentResponse) => {
            setPaymentUiStage('confirming')
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
              'content-type': 'application/json',
              authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              orderId: paymentSession.orderId,
              orderNumber: paymentSession.orderNumber,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            }),
          })

            const verifyPayload = await verifyResponse.json().catch(() => null)
            if (!verifyResponse.ok) {
              setPaymentUiStage('idle')
              setProcessingPayment(false)
              setErrorMessage(verifyPayload?.error ?? 'Payment verification failed. Please contact support if the amount was deducted.')
              return
            }

          if (cartMode) {
            clearCart()
            }
            setPendingPaymentSession(null)
            clearLoveLetterDraft()
            router.replace(`/checkout/success?order=${encodeURIComponent(verifyPayload.orderNumber || paymentSession.orderNumber)}`)
          },
        })

        razorpayInstance.on('payment.failed', (failure) => {
        setPaymentUiStage('idle')
        setProcessingPayment(false)
        setErrorMessage(failure.error?.description || 'Payment failed. You can try again from this checkout.')
        })

      popupOpened = true
      razorpayInstance.open()
      } catch (error) {
        console.error('Unable to start Razorpay checkout:', error)
        setPaymentUiStage('idle')
        setErrorMessage('Unable to open Razorpay checkout right now. Please try again.')
      } finally {
        if (!popupOpened) {
        setPaymentUiStage('idle')
          setProcessingPayment(false)
        }
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
          items: checkoutItems.map((item) => ({
            slug: item.slug,
            name: item.name,
            metalVariantId: item.metalVariantId,
            metal: item.metal,
            purity: item.purity,
            quantity: item.quantity,
          })),
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.coupon) {
        setAppliedCoupon(null)
        setErrorMessage(response.status >= 500 ? 'We could not validate that coupon right now. Please try again shortly.' : payload?.error ?? 'Unable to apply coupon.')
        return
      }

      setAppliedCoupon(payload.coupon)
      setCouponCodeInput(payload.coupon.code)
      if (cartMode) localStorage.setItem(APPLIED_COUPON_KEY, JSON.stringify(payload.coupon))
      setErrorMessage('')
    } catch {
      setErrorMessage('We could not validate that coupon. Check your connection and try again.')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCodeInput('')
    if (cartMode) localStorage.removeItem(APPLIED_COUPON_KEY)
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

  if (cartMode && cartItems.length > 0 && resolvedCartItems.length === 0) {
    return (
      <section className="min-h-[calc(100vh-111px)] bg-[#f7f8fa] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1240px] rounded-[24px] border border-[#e7ebf0] bg-white p-6 text-sm text-[#667085] shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
          Loading checkout...
        </div>
      </section>
    )
  }

  if (!checkoutItems.length) {
    return (
      <section className="min-h-[calc(100vh-111px)] bg-[#f7f8fa] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[720px] rounded-[24px] border border-[#e7ebf0] bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
          <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-[#101828]">Nothing ready for checkout</h1>
          <p className="mt-3 text-sm leading-7 text-[#667085]">Add a product to cart or start checkout from a product page first.</p>
          <div className="mt-6">
            <Link href="/shop" className="inline-flex h-11 items-center justify-center rounded-full bg-[#101828] px-6 text-sm font-medium text-white transition hover:bg-[#1d2939]">
              Explore Products
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-[calc(100vh-111px)] bg-[#f7f8fa] px-4 py-8 sm:px-6 lg:px-10">
      {paymentUiStage === 'confirming' ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[rgba(247,248,250,0.82)] px-4 backdrop-blur-sm">
          <div className="w-full max-w-[420px] rounded-[28px] border border-[#e7ebf0] bg-white px-6 py-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d0d5dd] bg-[#f8fafc]">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#d0d5dd] border-t-[#101828]" />
            </div>
            <div className="mt-5 text-[24px] font-semibold tracking-[-0.03em] text-[#101828]">Confirming your order</div>
            <p className="mt-2 text-sm leading-7 text-[#667085]">
              Your payment is done. We are now verifying Razorpay and preparing your order confirmation.
            </p>
          </div>
        </div>
      ) : null}
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-6">
          <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#98a2b3]">Checkout</div>
          <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.04em] text-[#101828]">Secure your piece</h1>
          <p className="mt-2 text-sm text-[#667085]">{cartMode ? 'Checkout synced to the products currently saved in your cart.' : 'Checkout preview for your selected product.'}</p>
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

            {quoteStatus === 'loading' ? (
              <div className="rounded-[24px] border border-[#d0d5dd] bg-white px-5 py-4 text-sm text-[#667085]">
                Confirming the latest price, tax, stock, and availability…
              </div>
            ) : null}

            {quoteStatus === 'error' && quoteError ? (
              <div className="rounded-[24px] border border-[rgba(217,119,6,0.22)] bg-[#fffaeb] px-5 py-4 text-sm text-[#b54708]">
                {quoteError} Payment remains unavailable until the checkout total is confirmed.
              </div>
            ) : null}

            {quoteStatus === 'ready' && hasAuthoritativePriceChange ? (
              <div className="rounded-[24px] border border-[#b2ddff] bg-[#eff8ff] px-5 py-4 text-sm text-[#175cd3]">
                One or more catalogue prices changed since this checkout was opened. The order summary now shows the latest confirmed price.
              </div>
            ) : null}

            {unavailableCartItemCount > 0 ? (
              <div className="rounded-[24px] border border-[rgba(217,119,6,0.22)] bg-[#fffaeb] px-5 py-4 text-sm text-[#b54708]">
                {unavailableCartItemCount} cart {unavailableCartItemCount === 1 ? 'item is' : 'items are'} no longer available.{' '}
                <Link href="/cart" className="font-medium underline underline-offset-2">Return to your cart</Link> to remove or reconfigure {unavailableCartItemCount === 1 ? 'it' : 'them'} before payment.
              </div>
            ) : null}

              <div className="animate-[fadeUp_0.35s_ease]">
                {currentStep === 0 ? <CheckoutCustomerStep form={customerForm} onChange={updateCustomerForm} errors={fieldErrors} /> : null}
               {currentStep === 1 ? (
                 <CheckoutShippingStep
                   form={customerForm}
                   onChange={updateCustomerForm}
                   errors={fieldErrors}
                   postalLookup={postalLookup}
                   onPostalBlur={handlePostalCodeBlur}
                   postalAreaOptions={postalAreaOptions}
                   onPostalAreaSelect={handlePostalAreaSelect}
                 />
               ) : null}
                {currentStep === 2 ? <CheckoutDeliveryStep /> : null}
                {currentStep === 3 ? <CheckoutPaymentStep totalAmount={totalPayable} chargeQuote={chargeQuote} /> : null}
                {currentStep === 4 ? <CheckoutReviewStep onPayNow={handlePayNow} isProcessingPayment={processingPayment} continueHref={continueHref} loveLetter={loveLetterDraft} totalAmount={totalPayable} chargeQuote={chargeQuote} isPaymentDisabled={quoteStatus !== 'ready' || unavailableCartItemCount > 0} paymentAvailabilityMessage={unavailableCartItemCount > 0 ? 'Resolve unavailable cart items before payment.' : quoteStatus === 'loading' ? 'Confirming the latest price and availability…' : quoteStatus === 'error' ? quoteError : undefined} /> : null}
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
                      onClick={handleNextStep}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[#101828] px-6 text-sm font-medium text-white transition hover:bg-[#1d2939]"
                    >
                    Next Step
                  </button>
                </div>
              </div>
            ) : (
              <div className="-mt-2 flex justify-start px-1">
                <button
                  type="button"
                  onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
                  className="inline-flex min-h-10 items-center text-sm font-medium text-[#667085] underline decoration-[#c7cbd1] underline-offset-4 transition hover:text-[#101828] focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8964e]"
                >
                  Back to payment details
                </button>
              </div>
            )}

            {!isLastStep ? (
              <div className="flex justify-start">
                <Link
                  href={continueHref}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-transparent px-2 text-sm font-medium text-[#667085] transition hover:text-[#101828]"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-[140px] lg:self-start">
            <div className="space-y-4">
              {(promotions[0] || (appliedCoupon ? { id: appliedCoupon.id, code: appliedCoupon.code, title: appliedCoupon.title, rewardType: appliedCoupon.rewardType || appliedCoupon.discountType, discountValue: appliedCoupon.discountValue, minimumOrderAmount: appliedCoupon.minimumOrderAmount || 0, bannerTitle: appliedCoupon.bannerTitle, bannerDescription: appliedCoupon.bannerDescription, bannerImageUrl: appliedCoupon.bannerImageUrl, gift: appliedCoupon.gift ? { name: appliedCoupon.gift.name, slug: appliedCoupon.gift.slug, sku: appliedCoupon.gift.sku, imageUrl: appliedCoupon.gift.imageUrl, variantLabel: String(appliedCoupon.gift.variantData?.label || '') } : null } : null)) ? <PromotionBanner promotion={(promotions.find((item) => item.id === appliedCoupon?.id) || promotions[0] || { id: appliedCoupon!.id, code: appliedCoupon!.code, title: appliedCoupon!.title, rewardType: appliedCoupon!.rewardType || appliedCoupon!.discountType, discountValue: appliedCoupon!.discountValue, minimumOrderAmount: appliedCoupon!.minimumOrderAmount || 0, bannerTitle: appliedCoupon!.bannerTitle, bannerDescription: appliedCoupon!.bannerDescription, bannerImageUrl: appliedCoupon!.bannerImageUrl, gift: appliedCoupon!.gift ? { name: appliedCoupon!.gift.name, slug: appliedCoupon!.gift.slug, sku: appliedCoupon!.gift.sku, imageUrl: appliedCoupon!.gift.imageUrl, variantLabel: String(appliedCoupon!.gift.variantData?.label || '') } : null }) as StorefrontPromotion} subtotal={subtotal} applied={Boolean(appliedCoupon)} /> : null}
              <div className="rounded-[24px] border border-[#e7ebf0] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-6">
                <div className="text-[18px] font-semibold tracking-[-0.02em] text-[#101828]">Coupon</div>
                <div className="mt-4 flex gap-2">
                  <input
                    value={couponCodeInput}
                    onChange={(event) => setCouponCodeInput(event.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="checkout-input h-11 flex-1 rounded-full border border-[#d0d5dd] px-4 text-sm text-[#101828] outline-none transition-colors focus:border-[#101828]"
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
                    {appliedCoupon.rewardType === 'free_gift' ? `${appliedCoupon.gift?.name || 'Complimentary gift'} added free.` : `${appliedCoupon.code} applied. You saved ${format(appliedCoupon.discountAmount)}.`}
                  </div>
                ) : null}
              </div>
              <CheckoutSummary
                summary={{
                  items: authoritativeCheckoutItems,
                  couponCode: appliedCoupon?.code,
                  couponDiscount,
                  loveLetter: loveLetterDraft,
                  chargeQuote,
                  gift: authoritativePricing?.gift || appliedCoupon?.gift || null,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
