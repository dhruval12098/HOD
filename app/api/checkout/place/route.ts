import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendOrderConfirmationEmail } from '@/lib/email'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

type CheckoutPayload = {
  item: {
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
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase environment variables.' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization token.' }, { status: 401 })
  }

  const accessToken = authHeader.slice('Bearer '.length)
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey)

  const { data: userData, error: userError } = await authClient.auth.getUser()
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const payload = (await request.json().catch(() => null)) as CheckoutPayload | null
  if (!payload?.item?.name || !payload.item.slug || !payload.item.priceFrom) {
    return NextResponse.json({ error: 'Invalid checkout payload.' }, { status: 400 })
  }

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('email, first_name, last_name, phone, country, state, city, postal_code, address_line_1, address_line_2')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const { data: product } = await adminClient
    .from('products')
    .select('id, sku, gst_slab_id')
    .eq('slug', payload.item.slug)
    .maybeSingle()

  const quantity = payload.item.quantity || 1
  const unitPrice = Number(payload.item.priceFrom || 0)
  const subtotalAmount = unitPrice * quantity
  let gstPercentage = Number(payload.item.gstPercentage || 0)
  let gstLabel = payload.item.gstLabel || 'Taxes'
  let gstSlabId: string | null = product?.gst_slab_id ?? null

  if (product?.gst_slab_id) {
    const { data: gstSlab } = await adminClient
      .from('catalog_gst_slabs')
      .select('id, name, percentage')
      .eq('id', product.gst_slab_id)
      .maybeSingle()

    if (gstSlab) {
      gstPercentage = Number(gstSlab.percentage || 0)
      gstLabel = gstSlab.name || gstLabel
      gstSlabId = gstSlab.id
    }
  }

  const gstAmount = Number((subtotalAmount * (gstPercentage / 100)).toFixed(2))
  let couponId: number | null = null
  let couponCode: string | null = null
  let couponDiscountAmount = 0

  if (payload.coupon?.id && payload.coupon?.code) {
    const { data: coupon, error: couponError } = await adminClient
      .from('coupons')
      .select('id, code, discount_type, discount_value, usage_limit, usage_count, is_active')
      .eq('id', payload.coupon.id)
      .eq('code', payload.coupon.code.trim().toUpperCase())
      .maybeSingle()

    if (couponError) {
      return NextResponse.json({ error: couponError.message }, { status: 500 })
    }

    if (!coupon || !coupon.is_active) {
      return NextResponse.json({ error: 'Selected coupon is no longer valid.' }, { status: 400 })
    }

    if (coupon.usage_limit != null && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json({ error: 'Coupon usage limit has been reached.' }, { status: 400 })
    }

    const calculatedDiscount =
      coupon.discount_type === 'percentage'
        ? subtotalAmount * (Number(coupon.discount_value || 0) / 100)
        : Number(coupon.discount_value || 0)

    couponDiscountAmount = Math.max(0, Math.min(subtotalAmount, Number(calculatedDiscount.toFixed(2))))
    couponId = coupon.id
    couponCode = coupon.code
  }

  const totalAmount = subtotalAmount + gstAmount - couponDiscountAmount
  const customer = payload.customer ?? {}

  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .insert({
      user_id: userData.user.id,
      customer_email: customer.email || profile?.email || userData.user.email || '',
      customer_first_name: customer.first_name || profile?.first_name || userData.user.user_metadata?.first_name || 'Customer',
      customer_last_name: customer.last_name || profile?.last_name || userData.user.user_metadata?.last_name || '',
      customer_phone: customer.phone || profile?.phone || userData.user.user_metadata?.phone || '',
      shipping_country: customer.country || profile?.country || '',
      shipping_state: customer.state || profile?.state || '',
      shipping_city: customer.city || profile?.city || '',
      shipping_postal_code: customer.postal_code || profile?.postal_code || '',
      shipping_address_line_1: customer.address_line_1 || profile?.address_line_1 || '',
      shipping_address_line_2: customer.address_line_2 || profile?.address_line_2 || '',
      subtotal_amount: subtotalAmount,
      gst_amount: gstAmount,
      shipping_amount: 0,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending',
      notes: couponCode
        ? `Created from dummy checkout flow before payment gateway integration. Coupon applied: ${couponCode} (-${couponDiscountAmount}).`
        : 'Created from dummy checkout flow before payment gateway integration.',
    })
    .select('id, order_number, customer_email, customer_first_name, customer_last_name, total_amount, created_at')
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message || 'Unable to create order.' }, { status: 500 })
  }

  const { error: itemError } = await adminClient.from('order_items').insert({
    order_id: order.id,
    product_id: product?.id || null,
    product_name: payload.item.name,
    product_slug: payload.item.slug,
    sku: product?.sku || null,
    quantity,
    unit_price: unitPrice,
    line_total: subtotalAmount,
    selected_metal: payload.item.metal || null,
    selected_purity: payload.item.purity || null,
    selected_size_or_fit: payload.item.sizeOrFit || null,
    selected_gemstone: payload.item.gemstone || null,
    selected_carat: payload.item.carat || null,
    gst_slab_id: gstSlabId,
    gst_percentage: gstPercentage,
    gst_amount: gstAmount,
    image_url: payload.item.imageUrl || null,
  })

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 })
  }

  if (couponId && couponCode) {
    const { error: redemptionError } = await adminClient.from('coupon_redemptions').insert({
      coupon_id: couponId,
      coupon_code: couponCode,
      user_id: userData.user.id,
      order_id: order.id,
      order_number: order.order_number,
      discount_amount: couponDiscountAmount,
    })

    if (redemptionError) {
      return NextResponse.json({ error: redemptionError.message }, { status: 500 })
    }

    const { data: couponSnapshot, error: couponSnapshotError } = await adminClient
      .from('coupons')
      .select('usage_count')
      .eq('id', couponId)
      .single()

    if (couponSnapshotError) {
      return NextResponse.json({ error: couponSnapshotError.message }, { status: 500 })
    }

    const { error: couponUpdateError } = await adminClient
      .from('coupons')
      .update({ usage_count: Number(couponSnapshot?.usage_count ?? 0) + 1 })
      .eq('id', couponId)

    if (couponUpdateError) {
      return NextResponse.json({ error: couponUpdateError.message }, { status: 500 })
    }
  }

  try {
    await sendOrderConfirmationEmail({
      customerEmail: order.customer_email || userData.user.email || '',
      customerName: [order.customer_first_name, order.customer_last_name].filter(Boolean).join(' ') || 'Client',
      orderNumber: order.order_number,
      orderDate: order.created_at,
      subtotalAmount,
      gstAmount,
      gstLabel,
      gstPercentage,
      shippingAmount: 0,
      couponCode,
      couponDiscountAmount,
      totalAmount: Number(order.total_amount || totalAmount),
      items: [
        {
          product_name: payload.item.name,
          quantity,
          line_total: subtotalAmount,
        },
      ],
    })
  } catch (emailError) {
    console.error('Order confirmation email failed:', emailError)
  }

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.order_number,
  })
}
