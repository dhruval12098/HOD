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
import { getProductKey } from '@/lib/product-keys';
import type { StorefrontProduct } from '@/lib/catalog-products';
import { clearLoveLetterDraft, readLoveLetterDraft, type LoveLetterDraft } from '@/lib/love-letter';

type RazorpayCheckoutSuccess = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
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

type GoogleAddressComponent = {
  long_name: string
  short_name: string
  types: string[]
}

type GoogleGeocodeResult = {
  formatted_address?: string
  place_id?: string
  address_components?: GoogleAddressComponent[]
}

type GoogleGeocodeResponse = {
  status?: string
  results?: GoogleGeocodeResult[]
  error_message?: string
}

const POSTAL_CODE_LOOKUP_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s-]{2,11}$/

function normalizePostalCodeValue(value: string) {
  return value.trim().replace(/\s+/g, ' ').slice(0, 12)
}

function isLookupReadyAfterTyping(postalCode: string) {
  return POSTAL_CODE_LOOKUP_PATTERN.test(normalizePostalCodeValue(postalCode))
}

function getAddressPart(components: GoogleAddressComponent[] = [], types: string[]) {
  return components.find((component) => types.some((type) => component.types.includes(type)))?.long_name?.trim() || ''
}

function mapGoogleResultToPostalArea(result: GoogleGeocodeResult, index: number) {
  const components = result.address_components ?? []
  const city =
    getAddressPart(components, ['locality']) ||
    getAddressPart(components, ['administrative_area_level_2'])
  const district = getAddressPart(components, ['administrative_area_level_2'])
  const state = getAddressPart(components, ['administrative_area_level_1'])
  const country = getAddressPart(components, ['country'])
  const area =
    getAddressPart(components, ['sublocality_level_1', 'sublocality', 'neighborhood', 'premise']) ||
    result.formatted_address?.split(',')[0]?.trim() ||
    city ||
    district ||
    `Area ${index + 1}`

  return {
    id: result.place_id || `${area}-${index}`,
    label: [area, district || city, state].filter(Boolean).join(', '),
    city,
    district,
    state,
    country,
  }
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
  const { items: cartItems, clearCart } = useCart();
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
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [pendingPaymentSession, setPendingPaymentSession] = useState<PendingPaymentSession | null>(null)
  const [chargeQuote, setChargeQuote] = useState<CheckoutChargeQuote | null>(null)
  const [postalLookup, setPostalLookup] = useState<CheckoutPostalLookupState | null>(null)
  const [postalAreaOptions, setPostalAreaOptions] = useState<CheckoutPostalAreaOption[]>([])
  const [cartProducts, setCartProducts] = useState<Array<Pick<StorefrontProduct, 'id' | 'dbId' | 'slug' | 'name' | 'imageUrl' | 'priceFrom'>>>([]);
  const [taxMap, setTaxMap] = useState<Record<string, { gstLabel: string; gstPercentage: number }>>({});
  const lastPostalAutofillRef = useRef<{
    country: string
    postalCode: string
    city: string
    district: string
    state: string
  } | null>(null)
  const postalLookupAbortRef = useRef<AbortController | null>(null)
  const lastPostalLookupKeyRef = useRef<string>('')
  const cartMode = searchParams.get('mode') === 'cart';

  const singleItem = useMemo<CheckoutDisplayItem>(() => ({
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
  }), [searchParams, taxInfo]);

  useEffect(() => {
    if (!cartMode) return;
    let ignore = false;
    void (async () => {
      const response = await fetch('/api/public/products', { cache: 'no-store' });
      const payload = await response.json().catch(() => null);
      if (!ignore && response.ok && Array.isArray(payload?.items)) {
        setCartProducts(payload.items);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [cartMode]);

  const resolvedCartItems = useMemo(() => {
    if (!cartMode) return [];
    return cartItems
      .map((entry) => {
        const product = cartProducts.find((candidate) => getProductKey(candidate) === entry.productKey || candidate.slug === entry.productSlug);
        if (!product) return null;
        return { entry, product };
      })
      .filter(Boolean) as Array<{ entry: typeof cartItems[number]; product: typeof cartProducts[number] }>;
  }, [cartItems, cartMode, cartProducts]);

  const cartCheckoutItems = useMemo<CheckoutDisplayItem[]>(() => {
    if (!cartMode) return [];
    return resolvedCartItems
      .map(({ entry, product }) => {
        const tax = taxMap[product.slug];
        return {
          name: product.name,
          slug: product.slug,
          imageUrl: entry.selection.resolvedImageUrl || product.imageUrl || undefined,
          priceFrom: entry.selection.resolvedPrice ?? product.priceFrom,
          metal: entry.selection.metal ?? '',
          purity: entry.selection.purity ?? '',
          sizeOrFit: entry.selection.ringSize || entry.selection.sizeOrFit || '',
          gemstone: entry.selection.gemstone ?? '',
          carat: entry.selection.hiphopCarat ?? '',
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

  const subtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + (item.priceFrom * item.quantity), 0),
    [checkoutItems]
  );
  const couponDiscount = appliedCoupon?.discountAmount ?? 0
  const gstTotal = useMemo(
    () => checkoutItems.reduce((sum, item) => {
      const lineSubtotal = item.priceFrom * item.quantity
      const discountShare = subtotal > 0 ? couponDiscount * (lineSubtotal / subtotal) : 0
      const taxableLineAmount = Math.max(0, lineSubtotal - discountShare)
      return sum + (taxableLineAmount * ((item.gstPercentage ?? 0) / 100))
    }, 0),
    [checkoutItems, couponDiscount, subtotal]
  )
  const totalPayable = Math.max(0, subtotal - couponDiscount) + gstTotal

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
  }, [paymentSessionSignature])

  useEffect(() => {
    let ignore = false
    if (!checkoutItems.length) return
    if (!customerForm.country.trim()) {
      setChargeQuote(null)
      return
    }

    void (async () => {
      try {
        const response = await fetch('/api/checkout/quote', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            country: customerForm.country,
            currencyCode,
            couponDiscountAmount: couponDiscount,
            items: checkoutItems.map((item) => ({
              priceFrom: item.priceFrom,
              quantity: item.quantity,
              gstPercentage: item.gstPercentage ?? 0,
            })),
          }),
        })
        const payload = await response.json().catch(() => null)
        if (!ignore && response.ok) {
          setChargeQuote(payload?.quote ?? null)
        }
      } catch {}
    })()

    return () => {
      ignore = true
    }
  }, [checkoutItems, couponDiscount, currencyCode, customerForm.country])

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
      const lookupKey = normalizedPostalCode.toUpperCase()

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
        country: '',
      }))
      setPostalCodeFieldError()

      try {
        const key = process.env.NEXT_PUBLIC_GOOGLE_GEOCODING_KEY
        if (!key) {
          throw new Error('Missing Google Geocoding key')
        }

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:${encodeURIComponent(normalizedPostalCode)}&key=${encodeURIComponent(key)}`,
          {
          cache: 'no-store',
          signal: controller.signal,
          method: 'GET',
          headers: { accept: 'application/json' },
          }
        )
        const payload = (await response.json().catch(() => null)) as GoogleGeocodeResponse | null

        if (!response.ok) {
          throw new Error('Network error')
        }

        if (payload?.status && payload.status !== 'OK' && payload.status !== 'ZERO_RESULTS') {
          throw new Error(payload.error_message || payload.status)
        }

        const results = payload?.status === 'OK' && Array.isArray(payload.results) ? payload.results : []
        const areas = results
          .map(mapGoogleResultToPostalArea)
          .filter((area) => area.city || area.district || area.state || area.country)

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
        lastPostalLookupKeyRef.current = lookupKey
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('Postal lookup failed:', error)
        const message = 'Could not fetch location, try again'
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
    [applyPostalArea, setPostalCodeFieldError]
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
    void (async () => {
      const response = await fetch(`/api/checkout/tax?slug=${encodeURIComponent(singleItem.slug)}`);
      const payload = await response.json().catch(() => null);
      if (response.ok) {
        setTaxInfo({
          gstLabel: payload?.gstLabel ?? 'Taxes',
          gstPercentage: Number(payload?.gstPercentage ?? 0),
        });
      }
    })();
  }, [cartMode, singleItem.slug]);

  useEffect(() => {
    if (!cartMode || !resolvedCartItems.length) return;
    let ignore = false;
    void (async () => {
      const entries = await Promise.all(
        resolvedCartItems.map(async ({ product }) => {
          const response = await fetch(`/api/checkout/tax?slug=${encodeURIComponent(product.slug)}`);
          const payload = await response.json().catch(() => null);
          return [
            product.slug,
            {
              gstLabel: payload?.gstLabel ?? 'Taxes',
              gstPercentage: Number(payload?.gstPercentage ?? 0),
            },
          ] as const;
        })
      );
      if (!ignore) {
        setTaxMap(Object.fromEntries(entries));
      }
    })();
    return () => {
      ignore = true;
    };
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
          const response = await fetch('/api/checkout/place', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              item: cartMode ? null : singleItem,
              items: cartMode ? checkoutItems : undefined,
              customer: customerForm,
              loveLetter: loveLetterDraft,
              currencyCode,
              coupon: appliedCoupon
                ? {
                    id: appliedCoupon.id,
                    code: appliedCoupon.code,
                    discountAmount: appliedCoupon.discountAmount,
                  }
                : null,
            }),
          })
          const payload = await response.json().catch(() => null)

          if (!response.ok) {
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

  const paymentButtonLabel =
    paymentUiStage === 'confirming'
      ? 'Confirming Order...'
      : paymentUiStage === 'starting'
        ? 'Starting Payment...'
        : 'Starting Payment...'

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
          subtotal,
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
                {currentStep === 4 ? <CheckoutReviewStep onPayNow={handlePayNow} isProcessingPayment={processingPayment} paymentButtonLabel={paymentButtonLabel} continueHref={continueHref} loveLetter={loveLetterDraft} totalAmount={totalPayable} chargeQuote={chargeQuote} /> : null}
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
                    {appliedCoupon.code} applied. You saved {format(appliedCoupon.discountAmount)}.
                  </div>
                ) : null}
              </div>
              <CheckoutSummary
                summary={{
                  items: checkoutItems,
                  couponCode: appliedCoupon?.code,
                  couponDiscount: appliedCoupon?.discountAmount ?? 0,
                  loveLetter: loveLetterDraft,
                  chargeQuote,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
