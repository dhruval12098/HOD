import type { User } from '@supabase/supabase-js'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { buildCheckoutChargeQuote } from '@/lib/exchange-rates'

export type CheckoutPayload = {
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
    discountAmount?: number
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
  imageUrl?: string
  priceFrom: number
  metal?: string
  purity?: string
  sizeOrFit?: string
  gemstone?: string
  carat?: string
  quantity: number
  gstLabel?: string
  gstPercentage?: number
}

type PreparedItem = {
  entry: CheckoutPayloadItem
  product: {
    id: string
    slug: string
    sku: string | null
    gst_slab_id: string | null
  } | null
  quantity: number
  unitPrice: number
  subtotalAmount: number
  gstPercentage: number
  gstLabel: string
  gstAmount: number
  gstSlabId: string | null
}

type ProductRow = {
  id: string
  slug: string
  sku: string | null
  gst_slab_id: string | null
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

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidPhone(value: string) {
  const trimmed = value.trim()
  const digitsOnly = trimmed.replace(/\D/g, '')
  return /^\+?[0-9][0-9\s\-()]{7,19}$/.test(trimmed) && digitsOnly.length >= 8
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
      coupon: input.payload.coupon || null,
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
  adminClient: any
  payload: CheckoutPayload | null
  user: User
}) {
  const checkoutItems = (payload?.items?.length ? payload.items : payload?.item ? [payload.item] : []).filter(Boolean) as CheckoutPayloadItem[]

  if (!checkoutItems.length || checkoutItems.some((entry) => !entry?.name || !entry.slug || !entry.priceFrom)) {
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

  const slugs = checkoutItems.map((entry) => entry.slug)
  const { data: productRows, error: productRowsError } = await adminClient
    .from('products')
    .select('id, slug, sku, gst_slab_id')
    .in('slug', slugs)

  if (productRowsError) {
    return { error: productRowsError.message, status: 500 as const }
  }

  const { data: settingsRow } = await adminClient
    .from('site_settings')
    .select('*')
    .eq('settings_key', 'global_site_settings')
    .maybeSingle()

  const productBySlug = new Map<string, ProductRow>((productRows || []).map((product: any) => [product.slug, product as ProductRow]))
  const defaultGstSlabId = settingsRow?.default_gst_slab_id ?? null
  const gstSlabIds = Array.from(
    new Set(
      [
        ...(productRows || []).map((product: any) => product.gst_slab_id).filter(Boolean),
        defaultGstSlabId,
      ].filter(Boolean)
    )
  )

  const { data: gstSlabs, error: gstSlabsError } = gstSlabIds.length
    ? await adminClient.from('catalog_gst_slabs').select('id, name, percentage').in('id', gstSlabIds)
    : { data: [], error: null as { message?: string } | null }

  if (gstSlabsError) {
    return { error: gstSlabsError.message || 'Unable to load tax slabs.', status: 500 as const }
  }

  const fallbackGstSlabResponse =
    gstSlabs && gstSlabs.length > 0
      ? null
      : await adminClient
          .from('catalog_gst_slabs')
          .select('id, name, percentage')
          .neq('status', 'hidden')
          .order('display_order', { ascending: true })
          .limit(1)
          .maybeSingle()

  if (fallbackGstSlabResponse?.error) {
    return { error: fallbackGstSlabResponse.error.message, status: 500 as const }
  }

  const gstById = new Map((gstSlabs || []).map((slab: any) => [slab.id, slab]))
  const fallbackGstSlab = (gstSlabs || [])[0] ?? fallbackGstSlabResponse?.data ?? null

  let normalizedItems: PreparedItem[] = checkoutItems.map((entry) => {
    const product = (productBySlug.get(entry.slug) || null) as ProductRow | null
    const gstSlab =
      (product?.gst_slab_id ? gstById.get(product.gst_slab_id) : null) ||
      (defaultGstSlabId ? gstById.get(defaultGstSlabId) : null) ||
      fallbackGstSlab
    const quantity = entry.quantity || 1
    const unitPrice = Number(entry.priceFrom || 0)
    const subtotalAmount = Number((unitPrice * quantity).toFixed(2))
    const gstPercentage = Number(gstSlab?.percentage ?? entry.gstPercentage ?? 0)
    const gstLabel = gstSlab?.name || entry.gstLabel || 'Taxes'

    return {
      entry,
      product,
      quantity,
      unitPrice,
      subtotalAmount,
      gstPercentage,
      gstLabel,
      gstAmount: 0,
      gstSlabId: product?.gst_slab_id ?? null,
    }
  })

  const subtotalAmount = Number(normalizedItems.reduce((sum, entry) => sum + entry.subtotalAmount, 0).toFixed(2))
  const gstLabel = normalizedItems.length === 1 ? normalizedItems[0]?.gstLabel || 'Taxes' : 'Taxes'

  let couponId: number | null = null
  let couponCode: string | null = null
  let couponDiscountAmount = 0
  const couponPayload = payload?.coupon ?? null

  if (couponPayload?.id && couponPayload?.code) {
    const { data: coupon, error: couponError } = await adminClient
      .from('coupons')
      .select('id, code, discount_type, discount_value, usage_limit, usage_count, is_active')
      .eq('id', couponPayload.id)
      .eq('code', couponPayload.code.trim().toUpperCase())
      .maybeSingle()

    if (couponError) {
      return { error: couponError.message, status: 500 as const }
    }

    if (!coupon || !coupon.is_active) {
      return { error: 'Selected coupon is no longer valid.', status: 400 as const }
    }

    if (coupon.usage_limit != null && coupon.usage_count >= coupon.usage_limit) {
      return { error: 'Coupon usage limit has been reached.', status: 400 as const }
    }

    const calculatedDiscount =
      coupon.discount_type === 'percentage'
        ? subtotalAmount * (Number(coupon.discount_value || 0) / 100)
        : Number(coupon.discount_value || 0)

    couponDiscountAmount = Math.max(0, Math.min(subtotalAmount, Number(calculatedDiscount.toFixed(2))))
    couponId = coupon.id
    couponCode = coupon.code
  }

  normalizedItems = normalizedItems.map((item) => {
    const discountShare = subtotalAmount > 0 ? couponDiscountAmount * (item.subtotalAmount / subtotalAmount) : 0
    const taxableAmount = Math.max(0, item.subtotalAmount - discountShare)
    return {
      ...item,
      gstAmount: Number((taxableAmount * (item.gstPercentage / 100)).toFixed(2)),
    }
  })

  const gstAmount = Number(normalizedItems.reduce((sum, entry) => sum + entry.gstAmount, 0).toFixed(2))
  const totalAmount = Math.max(0, subtotalAmount - couponDiscountAmount) + gstAmount
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

  const gstPercentage =
    normalizedItems.length === 1
      ? normalizedItems[0]?.gstPercentage ?? 0
      : normalizedItems.reduce((highest, item) => Math.max(highest, item.gstPercentage), 0)

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
  adminClient: any
  userId: string
  payload: CheckoutPayload
  prepared: PreparedCheckout
  razorpayOrderId: string
}) {
  const gatewayPayload = buildGatewayPayload({ payload, prepared, razorpayOrderId })
  const notes = [
    'Created from Razorpay checkout flow.',
    prepared.couponCode ? `Coupon selected: ${prepared.couponCode} (-${prepared.couponDiscountAmount}).` : null,
  ]
    .filter(Boolean)
    .join(' ')

  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .insert({
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
    })
    .select('id, order_number, customer_email, customer_first_name, customer_last_name, total_amount, created_at')
    .single()

  if (orderError || !order) {
    return { error: orderError?.message || 'Unable to create order.' }
  }

  if (prepared.loveLetter) {
    const { error: loveLetterError } = await adminClient.from('order_love_letters').insert({
      order_id: order.id,
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
    })

    if (loveLetterError) {
      return { error: loveLetterError.message }
    }
  }

  const { error: itemError } = await adminClient.from('order_items').insert(
    prepared.normalizedItems.map(({ entry, product, quantity, unitPrice, subtotalAmount, gstSlabId, gstPercentage, gstAmount }) => ({
      order_id: order.id,
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
    }))
  )

  if (itemError) {
    return { error: itemError.message }
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
  adminClient: any
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
  rawEvent,
}: {
  adminClient: any
  orderId?: string | null
  paymentId: string
  razorpayOrderId: string
  signature?: string | null
  paymentMethod?: string | null
  paymentContact?: string | null
  paymentEmail?: string | null
  gatewayPaymentStatus?: string | null
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

  const gatewayPayload = {
    ...(order.gateway_payload || {}),
    payment: {
      ...((order.gateway_payload as any)?.payment || {}),
      razorpayOrderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature || null,
      paymentMethod: paymentMethod || null,
      paymentEmail: paymentEmail || null,
      paymentContact: paymentContact || null,
      eventType: gatewayPaymentStatus || null,
    },
    rawEvent: rawEvent || ((order.gateway_payload as any)?.rawEvent ?? null),
  }

  const alreadyPaid = order.payment_status === 'paid'
  const paidAt = new Date().toISOString()

  const { error: updateError } = await adminClient
    .from('orders')
    .update({
      payment_status: 'paid',
      gateway_payment_status: gatewayPaymentStatus || 'captured',
      gateway_order_status: 'paid',
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature || null,
      razorpay_payment_method: paymentMethod || null,
      razorpay_payment_contact: paymentContact || null,
      razorpay_payment_email: paymentEmail || null,
      payment_verified_at: paidAt,
      payment_captured_at: paidAt,
      gateway_payload: gatewayPayload,
    })
    .eq('id', order.id)

  if (updateError) {
    return { error: updateError.message }
  }

  const coupon = (order.gateway_payload as any)?.checkout?.coupon
  if (coupon?.id && coupon?.code) {
    const { data: existingRedemption } = await adminClient
      .from('coupon_redemptions')
      .select('id')
      .eq('order_id', order.id)
      .maybeSingle()

    if (!existingRedemption) {
      const discountAmount = Number(coupon.discountAmount || 0)
      await adminClient.from('coupon_redemptions').insert({
        coupon_id: coupon.id,
        coupon_code: coupon.code,
        user_id: order.user_id,
        order_id: order.id,
        order_number: order.order_number,
        discount_amount: discountAmount,
      })

      const { data: couponSnapshot } = await adminClient
        .from('coupons')
        .select('usage_count')
        .eq('id', coupon.id)
        .single()

      await adminClient
        .from('coupons')
        .update({ usage_count: Number(couponSnapshot?.usage_count ?? 0) + 1 })
        .eq('id', coupon.id)
    }
  }

  if (!alreadyPaid) {
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
        subtotalAmount: Number(((order.gateway_payload as any)?.totals?.chargedSubtotal ?? order.subtotal_amount) || 0),
        gstAmount: Number(((order.gateway_payload as any)?.totals?.chargedGst ?? order.gst_amount) || 0),
        gstLabel: (order.gateway_payload as any)?.totals?.gstLabel || 'Taxes',
        gstPercentage: Number((order.gateway_payload as any)?.totals?.gstPercentage || 0),
        shippingAmount: Number(((order.gateway_payload as any)?.totals?.shippingCharged ?? order.shipping_amount) || 0),
        couponCode: coupon?.code || null,
        couponDiscountAmount: Number((((order.gateway_payload as any)?.totals?.chargedCouponDiscount ?? coupon?.discountAmount) || 0)),
        totalAmount: Number(order.payment_amount || order.total_amount || 0),
        currency: (order.payment_currency as string | null) || 'USD',
        items: (items || []).map((item: any) => ({
          product_name: item.product_name,
          quantity: Number(item.quantity || 0),
          line_total: Number(item.line_total || 0) * Number((order.gateway_payload as any)?.totals?.exchangeRate || 1),
        })),
      })
    } catch (emailError) {
      console.error('Order confirmation email failed after payment verification:', emailError)
    }
  }

  return {
    data: {
      orderId: order.id as string,
      orderNumber: order.order_number as string,
      totalAmount: Number(order.total_amount || 0),
    },
  } as const
}
