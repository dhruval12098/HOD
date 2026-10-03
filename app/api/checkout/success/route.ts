import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { enforceRateLimit } from '@/lib/rate-limit'
import { getGuestCheckoutTokenHash } from '@/lib/guest-checkout'
import { finalizePaidOrder } from '@/lib/checkout-order'
import { ensureRazorpayPaymentCaptured, findCapturedOrAuthorizedPayment } from '@/lib/razorpay'
import { toRazorpayAmountInSubunits } from '@/lib/payment-subunits'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = process.env.SUPABASE_COLLECTION_BUCKET ?? 'hod'

type ResultState = 'success' | 'pending' | 'failed' | 'error'

type CheckoutTotalsSnapshot = {
  chargedSubtotal?: unknown
  chargedGst?: unknown
  shippingCharged?: unknown
  exchangeRate?: unknown
}

function finiteAmount(value: unknown, fallback: number) {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : fallback
}

function resultState(paymentStatus: unknown): ResultState {
  const value = String(paymentStatus ?? '').toLowerCase()
  if (value === 'paid' || value === 'captured' || value === 'success') return 'success'
  if (value === 'failed' || value === 'cancelled' || value === 'canceled') return 'failed'
  return 'pending'
}

function publicImageUrl(client: SupabaseClient, path: unknown) {
  const value = typeof path === 'string' ? path.trim() : ''
  if (!value) return ''
  if (/^https?:\/\//i.test(value) || value.startsWith('/')) return value
  return client.storage.from(bucket).getPublicUrl(value).data.publicUrl
}

export async function GET(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) return NextResponse.json({ error: 'Missing Supabase environment variables.' }, { status: 500 })

  const rateLimit = await enforceRateLimit(request, { key: 'checkout-success', limit: 30, windowSeconds: 60 })
  if (!rateLimit.ok && rateLimit.response) return rateLimit.response

  const authHeader = request.headers.get('authorization')
  const guestTokenHash = getGuestCheckoutTokenHash(request)
  let userId: string | null = null
  if (authHeader?.startsWith('Bearer ')) {
    const authClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } })
    const { data, error } = await authClient.auth.getUser()
    if (error || !data.user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    userId = data.user.id
  } else if (!guestTokenHash) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const orderNumber = new URL(request.url).searchParams.get('order')?.trim()
  if (!orderNumber || orderNumber.length > 100) return NextResponse.json({ error: 'Order confirmation not found.' }, { status: 404 })

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey)
  let query = adminClient.from('orders').select('id, order_number, created_at, customer_email, customer_first_name, customer_last_name, customer_phone, customer_birth_date, customer_anniversary_date, shipping_country, shipping_state, shipping_district, shipping_city, shipping_postal_code, shipping_address_line_1, shipping_address_line_2, subtotal_amount, gst_amount, shipping_amount, total_amount, status, payment_status, payment_gateway, payment_currency, payment_amount, razorpay_order_id, razorpay_payment_id, razorpay_payment_method, gateway_order_status, gateway_payment_status, gateway_payload').eq('order_number', orderNumber)
  query = userId ? query.eq('user_id', userId) : query.eq('guest_token_hash', guestTokenHash!)
  const { data: order, error: orderError } = await query.maybeSingle()
  if (orderError) {
    console.error('Order result lookup failed:', orderError)
    return NextResponse.json({ error: 'Unable to confirm this order right now.' }, { status: 500 })
  }
  if (!order) return NextResponse.json({ error: 'Order confirmation not found.' }, { status: 404 })

  let state = resultState(order.payment_status ?? order.gateway_payment_status)
  if (state === 'pending' && order.razorpay_order_id) {
    try {
      const candidate = await findCapturedOrAuthorizedPayment(order.razorpay_order_id)
      if (candidate?.id) {
        const payment = await ensureRazorpayPaymentCaptured({
          paymentId: candidate.id,
          orderId: order.razorpay_order_id,
          amountInSubunits: toRazorpayAmountInSubunits(Number(order.payment_amount || 0), String(order.payment_currency || '')),
          currency: String(order.payment_currency || '').toUpperCase(),
        })
        const finalized = await finalizePaidOrder({
          adminClient,
          orderId: order.id,
          razorpayOrderId: order.razorpay_order_id,
          paymentId: payment.id,
          paymentMethod: payment.method || null,
          paymentContact: payment.contact != null ? String(payment.contact) : null,
          paymentEmail: payment.email || null,
          gatewayPaymentStatus: payment.status || 'captured',
          paymentAmountInSubunits: Number(payment.amount),
          paymentCurrency: String(payment.currency || order.payment_currency),
          rawEvent: payment,
        })
        if (!('error' in finalized)) {
          state = 'success'
          order.payment_status = 'paid'
          order.gateway_payment_status = 'captured'
          order.gateway_order_status = 'paid'
          order.razorpay_payment_id = payment.id
          order.razorpay_payment_method = payment.method || null
        } else {
          console.error('Order status self-reconciliation finalization failed:', finalized.error)
        }
      }
    } catch (error) {
      // Keep the page pending and allow polling/webhook retries; never misreport a payment as failed.
      console.error('Order status self-reconciliation failed:', error)
    }
  }
  const [itemsResult, pageResult, stateResult, contactResult, categoriesResult, statusHistoryResult] = await Promise.all([
    adminClient.from('order_items').select('product_name, product_slug, quantity, unit_price, line_total, image_url, selected_metal, selected_purity, selected_size_or_fit, selected_gemstone, selected_carat, item_type').eq('order_id', order.id).order('created_at', { ascending: true }),
    adminClient.from('checkout_result_page').select('main_banner_image_path, main_banner_image_alt, secondary_banner_image_path, secondary_banner_image_alt, secondary_eyebrow, secondary_heading, secondary_paragraph, is_enabled').eq('id', 1).eq('is_enabled', true).maybeSingle(),
    adminClient.from('checkout_result_states').select('state, eyebrow, heading, paragraph, order_button_label, is_enabled').eq('state', state).eq('is_enabled', true).maybeSingle(),
    adminClient.from('contact_info').select('id, sort_order, label, value, note, href, icon_path').order('sort_order', { ascending: true }),
    adminClient.from('categories').select('name, slug, display_order').eq('status', 'active').order('display_order', { ascending: true }).limit(3),
    adminClient.from('order_status_history').select('status, created_at').eq('order_id', order.id).order('created_at', { ascending: true }),
  ])

  if (itemsResult.error) {
    console.error('Order result items lookup failed:', itemsResult.error)
    return NextResponse.json({ error: 'Unable to load the order details right now.' }, { status: 500 })
  }
  if (pageResult.error) console.warn('Checkout result CMS page unavailable:', pageResult.error.message)
  if (stateResult.error) console.warn('Checkout result CMS state unavailable:', stateResult.error.message)
  if (contactResult.error) console.warn('Checkout result contact information unavailable:', contactResult.error.message)
  if (categoriesResult.error) console.warn('Checkout result categories unavailable:', categoriesResult.error.message)
  if (statusHistoryResult.error) console.warn('Order status history unavailable:', statusHistoryResult.error.message)

  // Catalog prices can change or products can be removed after checkout. Use the
  // immutable, currency-converted totals captured with this order instead.
  const totals = (order.gateway_payload as { totals?: CheckoutTotalsSnapshot } | null)?.totals
  const exchangeRate = finiteAmount(totals?.exchangeRate, 1)
  const displayOrder = {
    ...order,
    subtotal_amount: finiteAmount(totals?.chargedSubtotal, Number(order.subtotal_amount || 0)),
    gst_amount: finiteAmount(totals?.chargedGst, Number(order.gst_amount || 0)),
    shipping_amount: finiteAmount(totals?.shippingCharged, Number(order.shipping_amount || 0)),
    items: (itemsResult.data ?? []).map((item) => ({
      ...item,
      line_total: Number((Number(item.line_total || 0) * exchangeRate).toFixed(2)),
    })),
  }
  const cmsPage = pageResult.data
  return NextResponse.json({
    state,
    order: displayOrder,
    statusEvents: statusHistoryResult.data ?? [],
    cms: {
      page: cmsPage ? { ...cmsPage, main_banner_image_url: publicImageUrl(adminClient, cmsPage.main_banner_image_path), secondary_banner_image_url: publicImageUrl(adminClient, cmsPage.secondary_banner_image_path) } : null,
      state: stateResult.data ?? null,
    },
    contact: contactResult.data ?? [],
    categories: categoriesResult.data ?? [],
  })
}
