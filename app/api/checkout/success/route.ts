import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { enforceRateLimit } from '@/lib/rate-limit'
import { getGuestCheckoutTokenHash } from '@/lib/guest-checkout'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = process.env.SUPABASE_COLLECTION_BUCKET ?? 'hod'

type ResultState = 'success' | 'pending' | 'failed' | 'error'

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
  let query = adminClient.from('orders').select('id, order_number, created_at, customer_email, customer_first_name, customer_last_name, customer_phone, shipping_country, shipping_state, shipping_district, shipping_city, shipping_postal_code, shipping_address_line_1, shipping_address_line_2, subtotal_amount, gst_amount, shipping_amount, total_amount, status, payment_status, payment_gateway, payment_currency, payment_amount, razorpay_payment_method, gateway_order_status, gateway_payment_status').eq('order_number', orderNumber)
  query = userId ? query.eq('user_id', userId) : query.eq('guest_token_hash', guestTokenHash!)
  const { data: order, error: orderError } = await query.maybeSingle()
  if (orderError) {
    console.error('Order result lookup failed:', orderError)
    return NextResponse.json({ error: 'Unable to confirm this order right now.' }, { status: 500 })
  }
  if (!order) return NextResponse.json({ error: 'Order confirmation not found.' }, { status: 404 })

  const state = resultState(order.payment_status ?? order.gateway_payment_status)
  const [itemsResult, pageResult, stateResult, contactResult, categoriesResult] = await Promise.all([
    adminClient.from('order_items').select('product_name, product_slug, quantity, unit_price, line_total, image_url, selected_metal, selected_purity, selected_size_or_fit, selected_gemstone, selected_carat, item_type').eq('order_id', order.id).order('created_at', { ascending: true }),
    adminClient.from('checkout_result_page').select('main_banner_image_path, main_banner_image_alt, secondary_banner_image_path, secondary_banner_image_alt, secondary_eyebrow, secondary_heading, secondary_paragraph, is_enabled').eq('id', 1).eq('is_enabled', true).maybeSingle(),
    adminClient.from('checkout_result_states').select('state, eyebrow, heading, paragraph, order_button_label, is_enabled').eq('state', state).eq('is_enabled', true).maybeSingle(),
    adminClient.from('contact_info').select('id, sort_order, label, value, note, href, icon_path').order('sort_order', { ascending: true }),
    adminClient.from('categories').select('name, slug, display_order').eq('status', 'active').order('display_order', { ascending: true }).limit(3),
  ])

  if (itemsResult.error) {
    console.error('Order result items lookup failed:', itemsResult.error)
    return NextResponse.json({ error: 'Unable to load the order details right now.' }, { status: 500 })
  }
  if (pageResult.error) console.warn('Checkout result CMS page unavailable:', pageResult.error.message)
  if (stateResult.error) console.warn('Checkout result CMS state unavailable:', stateResult.error.message)
  if (contactResult.error) console.warn('Checkout result contact information unavailable:', contactResult.error.message)
  if (categoriesResult.error) console.warn('Checkout result categories unavailable:', categoriesResult.error.message)

  const cmsPage = pageResult.data
  return NextResponse.json({
    state,
    order: { ...order, items: itemsResult.data ?? [] },
    cms: {
      page: cmsPage ? { ...cmsPage, main_banner_image_url: publicImageUrl(adminClient, cmsPage.main_banner_image_path), secondary_banner_image_url: publicImageUrl(adminClient, cmsPage.secondary_banner_image_path) } : null,
      state: stateResult.data ?? null,
    },
    contact: contactResult.data ?? [],
    categories: categoriesResult.data ?? [],
  })
}
