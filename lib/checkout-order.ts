import type { SupabaseClient, User } from '@supabase/supabase-js'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { buildCheckoutChargeQuote } from '@/lib/exchange-rates'
import { resolveAuthoritativeCheckoutPricing } from '@/lib/checkout-pricing'
import { isValidEmail, isValidPhone } from '@/lib/validation'

export type CheckoutPayload = {
  idempotencyKey?: string
  item?: CheckoutPayloadItem | null
  items?: CheckoutPayloadItem[]
  customer?: {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    country?: string
    state?: string
    city?: string
    postal_code?: string
    address_line_1?: string
    address_line_2?: string
  }
  coupon?: {
    id?: number
    code?: string
  } | null
  currencyCode?: string | null
  loveLetter?: {
    wantsLetter?: boolean
    letterType?: 'generate_for_me' | 'write_myself' | 'no_letter'
    recipientName?: string
    senderName?: string
    occasionKey?: 'proposal' | 'anniversary' | 'birthday' | 'justbecause' | 'apology' | 'mother' | 'newchapter' | null
    aboutHerText?: string
    customLetterText?: string
    finalLetterText?: string
    finalLetterHtml?: string
  } | null
}

export type CheckoutPayloadItem = {
  name: string
  slug: string
  metalVariantId?: string
  imageUrl?: string
  priceFrom?: number
  metal?: string
  purity?: string
  sizeOrFit?: string
  gemstone?: string
  carat?: string
  quantity: number
  gstLabel?: string
  gstPercentage?: number
  customSelections?: { dropdownId: string; optionId: string; label?: string; optionLabel?: string }[]
}

type PreparedItem = {
  entry: CheckoutPayloadItem
  product: {
    id: string
    slug: string
    sku: string | null
    gst_slab_id: string | null
    base_price: number | null
    default_purity_price_id: string | null
    stock_quantity: number | null
    allow_checkout: boolean | null
    status: string | null
  } | null
  quantity: number
  unitPrice: number
  subtotalAmount: number
  gstPercentage: number
  gstLabel: string
  gstAmount: number
  gstSlabId: string | null
  selectedCustomDropdowns: { dropdown_id: string; name: string; label: string; option_id: string; option_label: string; option_value: string }[]
}

type ProductRow = {
  id: string
  slug: string
  sku: string | null
  gst_slab_id: string | null
  base_price: number | null
  default_purity_price_id: string | null
  stock_quantity: number | null
  allow_checkout: boolean | null
  status: string | null
  custom_dropdowns_enabled?: boolean | null
}

type MetalVariantRow = {
  id: string
  product_id: string
  price: number | null
}

type PurityPriceRow = {
  id: string
  product_id: string
  purity_label: string | null
  price: number | null
  sort_order: number | null
}

type CustomDropdownGroupRow = {
  id: string
  product_id: string
  name: string
  label: string
  is_required: boolean | null
}

type CustomDropdownOptionRow = {
  id: string
  dropdown_id: string
  label: string
  value: string
}

type OrderEmailItemRow = {
  product_name: string
  quantity: number | null
  line_total: number | null
}

type StockFinalizationResult = {
  ok: boolean
  message?: string | null
  already_paid?: boolean | null
  order_id: string
  order_number: string
  total_amount: number | null
}

type StoredGatewayPayload = {
  checkout?: {
    coupon?: {
      code?: string | null
      discountAmount?: number | null
    } | null
  } | null
  totals?: {
    chargedSubtotal?: number | null
    chargedGst?: number | null
    gstLabel?: string | null
    gstPercentage?: number | null
    shippingCharged?: number | null
    chargedCouponDiscount?: number | null
    exchangeRate?: number | null
  } | null
}

type PreparedCheckout = {
  normalizedItems: PreparedItem[]
  subtotalAmount: number
  gstAmount: number
  gstLabel: string
  gstPercentage: number
  couponId: number | null
  couponCode: string | null
  couponDiscountAmount: number
  couponRewardType: 'percentage' | 'fixed' | 'free_gift' | null
  gift: { productId: string; name: string; slug: string; sku: string | null; imageUrl: string; originalUnitPrice: number; variantData: Record<string, unknown> } | null
  totalAmount: number
  loveLetter: CheckoutPayload['loveLetter'] | null
  chargeQuote: Awaited<ReturnType<typeof buildCheckoutChargeQuote>>
  resolvedCustomer: {
    first_name: string
    last_name: string
    email: string
    phone: string
    country: string
    state: string
    city: string
    postal_code: string
    address_line_1: string
    address_line_2: string
  }
}

type PendingOrderRecord = {
  id: string
  order_number: string
  customer_email: string | null
  customer_first_name: string | null
  customer_last_name: string | null
  total_amount: number | null
  created_at: string | null
}

function isValidPostalCode(value: string) {
  return /^[A-Za-z0-9][A-Za-z0-9\s-]{2,11}$/.test(value.trim())
}

function buildSelectionLabel(metal?: string | null, purity?: string | null) {
  const normalizedMetal = metal?.trim() || ''
  const normalizedPurity = purity?.trim() || ''
  if (!normalizedMetal) return normalizedPurity
  if (!normalizedPurity || normalizedMetal.toLowerCase().includes(normalizedPurity.toLowerCase())) return normalizedMetal
  return `${normalizedPurity} ${normalizedMetal}`.trim()
}

function buildGatewayPayload(input: {
  payload: CheckoutPayload
  prepared: PreparedCheckout
  razorpayOrderId?: string | null
  paymentId?: string | null
  signature?: string | null
  paymentMethod?: string | null
  paymentEmail?: string | null
  paymentContact?: string | null
  eventType?: string | null
  rawEvent?: unknown
}) {
  return {
    checkout: {
      customer: input.prepared.resolvedCustomer,
      items: input.prepared.normalizedItems.map(({ entry, quantity, unitPrice, subtotalAmount, gstAmount, gstPercentage, gstLabel }) => ({
        ...entry,
        quantity,
        unitPrice,
        subtotalAmount,
        gstAmount,
        gstPercentage,
        gstLabel,
      })),
      coupon: input.prepared.couponId && input.prepared.couponCode
        ? {
            id: input.prepared.couponId,
            code: input.prepared.couponCode,
            discountAmount: input.prepared.couponDiscountAmount,
            rewardType: input.prepared.couponRewardType,
            gift: input.prepared.gift,
          }
        : null,
      loveLetter: input.payload.loveLetter || null,
    },
    totals: {
      subtotalAmount: input.prepared.subtotalAmount,
      gstAmount: input.prepared.gstAmount,
      gstLabel: input.prepared.gstLabel,
      gstPercentage: input.prepared.gstPercentage,
      couponDiscountAmount: input.prepared.couponDiscountAmount,
      totalAmount: input.prepared.totalAmount,
      price_usd: input.prepared.totalAmount,
      price_local: input.prepared.chargeQuote.totalCharged,
      currency_charged: input.prepared.chargeQuote.chargeCurrency,
      baseCurrency: 'USD',
      chargeCurrency: input.prepared.chargeQuote.chargeCurrency,
      exchangeRate: input.prepared.chargeQuote.exchangeRate,
      exchangeRateSource: input.prepared.chargeQuote.exchangeRateSource,
      exchangeRateFetchedAt: input.prepared.chargeQuote.exchangeRateFetchedAt,
      chargedSubtotal: input.prepared.chargeQuote.subtotalCharged,
      chargedGst: input.prepared.chargeQuote.gstCharged,
      chargedCouponDiscount: input.prepared.chargeQuote.couponDiscountCharged,
      chargedTotal: input.prepared.chargeQuote.totalCharged,
    },
    payment: {
      razorpayOrderId: input.razorpayOrderId || null,
      razorpayPaymentId: input.paymentId || null,
      razorpaySignature: input.signature || null,
      paymentMethod: input.paymentMethod || null,
      paymentEmail: input.paymentEmail || null,
      paymentContact: input.paymentContact || null,
      eventType: input.eventType || null,
    },
    rawEvent: input.rawEvent || null,
  }
}

export async function prepareCheckoutPayload({
  adminClient,
  payload,
  user,
}: {
  adminClient: SupabaseClient
  payload: CheckoutPayload | null
  user: User
}) {
  const checkoutItems = (payload?.items?.length ? payload.items : payload?.item ? [payload.item] : []).filter(Boolean) as CheckoutPayloadItem[]

  if (!checkoutItems.length || checkoutItems.some((entry) => !entry?.name || !entry.slug)) {
    return { error: 'Invalid checkout payload.', status: 400 as const }
  }

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('email, first_name, last_name, phone, country, state, city, postal_code, address_line_1, address_line_2')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return { error: profileError.message, status: 500 as const }
  }

  const pricingResult = await resolveAuthoritativeCheckoutPricing({
    adminClient,
    items: checkoutItems,
    coupon: payload?.coupon ?? null,
  })
  if ('error' in pricingResult) {
    return { error: pricingResult.error, status: pricingResult.status }
  }
  const pricing = pricingResult.data
  const productRows = pricing.lines.map((line) => line.product)
  const productIds = productRows.map((product) => product.id)
  const groupsResult = productIds.length ? await adminClient.from('product_custom_dropdowns').select('id, product_id, name, label, is_required').in('product_id', productIds).eq('is_enabled', true) : { data: [], error: null }
  if (groupsResult.error) return { error: groupsResult.error.message, status: 500 as const }
  const dropdownGroups = (groupsResult.data || []) as CustomDropdownGroupRow[]
  const groupIds = dropdownGroups.map((group) => group.id)
  const optionsResult = groupIds.length ? await adminClient.from('product_custom_dropdown_options').select('id, dropdown_id, label, value').in('dropdown_id', groupIds).eq('is_enabled', true) : { data: [], error: null }
  if (optionsResult.error) return { error: optionsResult.error.message, status: 500 as const }
  const dropdownOptions = (optionsResult.data || []) as CustomDropdownOptionRow[]
  let selectionError = ''
  const normalizedItems: PreparedItem[] = pricing.lines.map((line) => {
    const entry = checkoutItems.find((item) => item.slug === line.entry.slug && item.metalVariantId === line.entry.metalVariantId) || (line.entry as CheckoutPayloadItem)
    const groups = line.product.custom_dropdowns_enabled ? dropdownGroups.filter((group) => group.product_id === line.product.id) : []
    const requested = new Map((entry.customSelections || []).map((selection) => [selection.dropdownId, selection.optionId]))
    if (requested.size !== (entry.customSelections || []).length || [...requested.keys()].some((groupId) => !groups.some((group) => group.id === groupId))) {
      selectionError = 'One or more custom product selections are invalid.'
    }
    const selectedCustomDropdowns = groups.flatMap((group) => {
      const optionId = requested.get(group.id)
      if (!optionId) { if (group.is_required) selectionError = `Please select ${group.label}.`; return [] }
      const option = dropdownOptions.find((candidate) => candidate.dropdown_id === group.id && candidate.id === optionId)
      if (!option) { selectionError = `Invalid selection for ${group.label}.`; return [] }
      return [{ dropdown_id: group.id, name: group.name, label: group.label, option_id: option.id, option_label: option.label, option_value: option.value }]
    })

    return {
      entry,
      product: line.product,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      subtotalAmount: line.subtotalAmount,
      gstPercentage: line.gstPercentage,
      gstLabel: line.gstLabel,
      gstAmount: line.gstAmount,
      gstSlabId: line.gstSlabId,
      selectedCustomDropdowns,
    }
  })
  if (selectionError) return { error: selectionError, status: 400 as const }

  const { subtotalAmount, gstAmount, gstLabel, gstPercentage, couponId, couponCode, couponDiscountAmount, couponRewardType, gift, totalAmount } = pricing
  const loveLetter = payload?.loveLetter ?? null
  const customer = payload?.customer ?? {}
  const resolvedCustomer = {
    first_name: (customer.first_name || profile?.first_name || user.user_metadata?.first_name || '').trim(),
    last_name: (customer.last_name || profile?.last_name || user.user_metadata?.last_name || '').trim(),
    email: (customer.email || profile?.email || user.email || '').trim(),
    phone: (customer.phone || profile?.phone || user.user_metadata?.phone || '').trim(),
    country: (customer.country || profile?.country || '').trim(),
    state: (customer.state || profile?.state || '').trim(),
    city: (customer.city || profile?.city || '').trim(),
    postal_code: (customer.postal_code || profile?.postal_code || '').trim(),
    address_line_1: (customer.address_line_1 || profile?.address_line_1 || '').trim(),
    address_line_2: (customer.address_line_2 || profile?.address_line_2 || '').trim(),
  }

  if (!resolvedCustomer.first_name) return { error: 'First name is required.', status: 400 as const }
  if (!resolvedCustomer.last_name) return { error: 'Last name is required.', status: 400 as const }
  if (resolvedCustomer.first_name.length > 80) return { error: 'First name must be 80 characters or fewer.', status: 400 as const }
  if (resolvedCustomer.last_name.length > 80) return { error: 'Last name must be 80 characters or fewer.', status: 400 as const }
  if (!resolvedCustomer.email || !isValidEmail(resolvedCustomer.email)) {
    return { error: 'A valid email address is required.', status: 400 as const }
  }
  if (!resolvedCustomer.phone || !isValidPhone(resolvedCustomer.phone)) {
    return { error: 'A valid mobile number with country code is required.', status: 400 as const }
  }
  if (!resolvedCustomer.country) return { error: 'Country is required.', status: 400 as const }
  if (!resolvedCustomer.state) return { error: 'State, province, or region is required.', status: 400 as const }
  if (!resolvedCustomer.city) return { error: 'City is required.', status: 400 as const }
  if (!resolvedCustomer.postal_code || !isValidPostalCode(resolvedCustomer.postal_code)) {
    return { error: 'A valid postal code or pincode is required.', status: 400 as const }
  }
  if (!resolvedCustomer.address_line_1) {
    return { error: 'Address line 1 is required.', status: 400 as const }
  }

  const chargeQuote = await buildCheckoutChargeQuote({
    subtotalUsd: subtotalAmount,
    gstUsd: gstAmount,
    couponDiscountUsd: couponDiscountAmount,
    country: resolvedCustomer.country,
    currencyCode: payload?.currencyCode || null,
  })

  return {
    data: {
      normalizedItems,
      subtotalAmount,
      gstAmount,
      gstLabel,
      gstPercentage,
      couponId,
      couponCode,
      couponDiscountAmount,
      couponRewardType,
      gift,
      totalAmount,
      loveLetter,
      chargeQuote,
      resolvedCustomer,
    } satisfies PreparedCheckout,
  } as const
}

export async function createPendingOrder({
  adminClient,
  userId,
  payload,
  prepared,
  razorpayOrderId,
}: {
  adminClient: SupabaseClient
  userId: string
  payload: CheckoutPayload
  prepared: PreparedCheckout
  razorpayOrderId: string
}) {
  const gatewayPayload = buildGatewayPayload({ payload, prepared, razorpayOrderId })
  const notes = [
    'Created from Razorpay checkout flow.',
    prepared.couponCode ? (prepared.couponRewardType === 'free_gift' ? `Gift coupon selected: ${prepared.couponCode}.` : `Coupon selected: ${prepared.couponCode} (-${prepared.couponDiscountAmount}).`) : null,
  ]
    .filter(Boolean)
    .join(' ')

  const orderInput = {
      user_id: userId,
      customer_email: prepared.resolvedCustomer.email,
      customer_first_name: prepared.resolvedCustomer.first_name || 'Customer',
      customer_last_name: prepared.resolvedCustomer.last_name,
      customer_phone: prepared.resolvedCustomer.phone,
      shipping_country: prepared.resolvedCustomer.country,
      shipping_state: prepared.resolvedCustomer.state,
      shipping_city: prepared.resolvedCustomer.city,
      shipping_postal_code: prepared.resolvedCustomer.postal_code,
      shipping_address_line_1: prepared.resolvedCustomer.address_line_1,
      shipping_address_line_2: prepared.resolvedCustomer.address_line_2,
      subtotal_amount: prepared.subtotalAmount,
      gst_amount: prepared.gstAmount,
      shipping_amount: 0,
      total_amount: prepared.totalAmount,
      love_letter_included: Boolean(prepared.loveLetter?.wantsLetter),
      love_letter_type: prepared.loveLetter?.letterType || 'no_letter',
      status: 'pending',
      payment_status: 'pending',
      payment_gateway: 'razorpay',
      payment_currency: prepared.chargeQuote.chargeCurrency,
      payment_amount: prepared.chargeQuote.totalCharged,
      razorpay_order_id: razorpayOrderId,
      gateway_order_status: 'created',
      gateway_payment_status: 'pending',
      gateway_payload: gatewayPayload,
      notes,
  }
  const loveLetterInput = prepared.loveLetter
    ? {
      wants_letter: Boolean(prepared.loveLetter.wantsLetter),
      letter_type: prepared.loveLetter.letterType || 'no_letter',
      recipient_name: prepared.loveLetter.recipientName?.trim() || null,
      sender_name: prepared.loveLetter.senderName?.trim() || null,
      occasion_key: prepared.loveLetter.occasionKey || null,
      about_her_text: prepared.loveLetter.aboutHerText?.trim() || null,
      custom_letter_text: prepared.loveLetter.customLetterText?.trim() || null,
      final_letter_text: prepared.loveLetter.finalLetterText?.trim() || null,
      final_letter_html: prepared.loveLetter.finalLetterHtml?.trim() || null,
      print_status: prepared.loveLetter.wantsLetter ? 'pending' : 'skipped',
    }
    : null
  const itemInputs: Array<Record<string, unknown>> = prepared.normalizedItems.map(({ entry, product, quantity, unitPrice, subtotalAmount, gstSlabId, gstPercentage, gstAmount, selectedCustomDropdowns }) => ({
      product_id: product?.id || null,
      product_name: entry.name,
      product_slug: entry.slug,
      sku: product?.sku || null,
      quantity,
      unit_price: unitPrice,
      line_total: subtotalAmount,
      selected_metal: buildSelectionLabel(entry.metal, entry.purity) || null,
      selected_purity: null,
      selected_size_or_fit: entry.sizeOrFit || null,
      selected_gemstone: entry.gemstone || null,
      selected_carat: entry.carat || null,
      gst_slab_id: gstSlabId,
      gst_percentage: gstPercentage,
      gst_amount: gstAmount,
      image_url: entry.imageUrl || null,
      selected_custom_dropdowns: selectedCustomDropdowns,
      item_type: 'regular',
      promotion_coupon_id: null,
      original_unit_price: null,
      promotion_metadata: {},
    }))
  if (prepared.gift && prepared.couponId && prepared.couponCode) {
    itemInputs.push({
      product_id: prepared.gift.productId,
      product_name: prepared.gift.name,
      product_slug: prepared.gift.slug,
      sku: prepared.gift.sku,
      quantity: 1,
      unit_price: 0,
      line_total: 0,
      selected_metal: typeof prepared.gift.variantData.label === 'string' ? prepared.gift.variantData.label : null,
      selected_purity: null,
      selected_size_or_fit: null,
      selected_gemstone: null,
      selected_carat: null,
      gst_slab_id: null,
      gst_percentage: 0,
      gst_amount: 0,
      image_url: prepared.gift.imageUrl || null,
      selected_custom_dropdowns: [],
      item_type: 'free_gift',
      promotion_coupon_id: prepared.couponId,
      original_unit_price: prepared.gift.originalUnitPrice,
      promotion_metadata: { coupon_code: prepared.couponCode, reward_type: 'free_gift', variant: prepared.gift.variantData },
    })
  }

  const { data: order, error: orderError } = await adminClient
    .rpc('create_pending_order_atomic', {
      p_user_id: userId,
      p_order: orderInput,
      p_items: itemInputs,
      p_love_letter: loveLetterInput,
    })
    .single()

  if (orderError || !order) {
    return { error: orderError?.message || 'Unable to create order.' }
  }

  return {
    data: {
      order: order as PendingOrderRecord,
      gatewayPayload,
    },
  } as const
}

export async function markOrderPaymentFailed({
  adminClient,
  orderId,
  razorpayOrderId,
  paymentId,
  error,
  rawEvent,
}: {
  adminClient: SupabaseClient
  orderId?: string | null
  razorpayOrderId?: string | null
  paymentId?: string | null
  error?: {
    code?: string | null
    description?: string | null
    source?: string | null
    step?: string | null
    reason?: string | null
    metadata?: {
      order_id?: string | null
      payment_id?: string | null
    } | null
  } | null
  rawEvent?: unknown
}) {
  let query = adminClient.from('orders').select('id, gateway_payload').limit(1)

  if (orderId) {
    query = query.eq('id', orderId)
  } else if (razorpayOrderId) {
    query = query.eq('razorpay_order_id', razorpayOrderId)
  } else {
    return null
  }

  const { data: order, error: orderError } = await query.maybeSingle()
  if (orderError || !order) return null

  await adminClient
    .from('orders')
    .update({
      payment_status: 'failed',
      gateway_payment_status: 'failed',
      razorpay_order_id: razorpayOrderId || error?.metadata?.order_id || null,
      razorpay_payment_id: paymentId || error?.metadata?.payment_id || null,
      razorpay_error_code: error?.code || null,
      razorpay_error_description: error?.description || null,
      razorpay_error_source: error?.source || null,
      razorpay_error_step: error?.step || null,
      razorpay_error_reason: error?.reason || null,
      payment_failed_at: new Date().toISOString(),
      gateway_payload: {
        ...(order.gateway_payload || {}),
        failure: {
          error: error || null,
          rawEvent: rawEvent || null,
        },
      },
    })
    .eq('id', order.id)

  return order.id as string
}

export async function finalizePaidOrder({
  adminClient,
  orderId,
  paymentId,
  razorpayOrderId,
  signature,
  paymentMethod,
  paymentContact,
  paymentEmail,
  gatewayPaymentStatus,
  paymentAmountInSubunits,
  paymentCurrency,
  rawEvent,
}: {
  adminClient: SupabaseClient
  orderId?: string | null
  paymentId: string
  razorpayOrderId: string
  signature?: string | null
  paymentMethod?: string | null
  paymentContact?: string | null
  paymentEmail?: string | null
  gatewayPaymentStatus?: string | null
  paymentAmountInSubunits: number
  paymentCurrency: string
  rawEvent?: unknown
}) {
  let query = adminClient.from('orders').select('*').limit(1)
  if (orderId) {
    query = query.eq('id', orderId)
  } else {
    query = query.eq('razorpay_order_id', razorpayOrderId)
  }

  const { data: order, error: orderError } = await query.maybeSingle()
  if (orderError || !order) {
    return { error: orderError?.message || 'Order not found.' }
  }

  const { data: stockFinalization, error: stockFinalizationError } = await adminClient
    .rpc('finalize_paid_order_with_coupon_secure', {
      p_order_id: order.id,
      p_razorpay_order_id: razorpayOrderId,
      p_payment_id: paymentId,
      p_signature: signature || null,
      p_payment_method: paymentMethod || null,
      p_payment_contact: paymentContact || null,
      p_payment_email: paymentEmail || null,
      p_gateway_payment_status: gatewayPaymentStatus || 'captured',
      p_payment_amount_subunits: paymentAmountInSubunits,
      p_payment_currency: paymentCurrency,
      p_raw_event: rawEvent ?? null,
    })
    .single()

  if (stockFinalizationError) {
    return { error: stockFinalizationError.message }
  }

  const finalization = stockFinalization as StockFinalizationResult | null
  if (!finalization?.ok) {
    return {
      error:
        finalization?.message ||
        'Payment was verified, but stock could not be allocated. Please contact support.',
    }
  }

  const storedGatewayPayload = order.gateway_payload as StoredGatewayPayload | null
  const coupon = storedGatewayPayload?.checkout?.coupon

  if (!finalization.already_paid) {
    const { data: items } = await adminClient
      .from('order_items')
      .select('product_name, quantity, line_total')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true })

    try {
      await sendOrderConfirmationEmail({
        customerEmail: order.customer_email || '',
        customerName: [order.customer_first_name, order.customer_last_name].filter(Boolean).join(' ') || 'Client',
        orderNumber: order.order_number,
        orderDate: order.created_at,
        subtotalAmount: Number((storedGatewayPayload?.totals?.chargedSubtotal ?? order.subtotal_amount) || 0),
        gstAmount: Number((storedGatewayPayload?.totals?.chargedGst ?? order.gst_amount) || 0),
        gstLabel: storedGatewayPayload?.totals?.gstLabel || 'Taxes',
        gstPercentage: Number(storedGatewayPayload?.totals?.gstPercentage || 0),
        shippingAmount: Number((storedGatewayPayload?.totals?.shippingCharged ?? order.shipping_amount) || 0),
        couponCode: coupon?.code || null,
        couponDiscountAmount: Number((storedGatewayPayload?.totals?.chargedCouponDiscount ?? coupon?.discountAmount) || 0),
        totalAmount: Number(order.payment_amount || order.total_amount || 0),
        currency: (order.payment_currency as string | null) || 'USD',
        items: ((items || []) as OrderEmailItemRow[]).map((item) => ({
          product_name: item.product_name,
          quantity: Number(item.quantity || 0),
          line_total: Number(item.line_total || 0) * Number(storedGatewayPayload?.totals?.exchangeRate || 1),
        })),
      })
    } catch (emailError) {
      console.error('Order confirmation email failed after payment verification:', emailError)
    }
  }

  return {
    data: {
      orderId: finalization.order_id,
      orderNumber: finalization.order_number,
      totalAmount: Number(finalization.total_amount || 0),
    },
  } as const
}
