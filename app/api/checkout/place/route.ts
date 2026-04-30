import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createPendingOrder, type CheckoutPayload, prepareCheckoutPayload } from '@/lib/checkout-order'
import { getRazorpayClient, getRazorpayKeyId, isRazorpayConfigured } from '@/lib/razorpay'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase environment variables.' }, { status: 500 })
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: 'Razorpay is not configured yet.' }, { status: 500 })
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
  const preparedResult = await prepareCheckoutPayload({
    adminClient,
    payload,
    user: userData.user,
  })

  if ('error' in preparedResult) {
    return NextResponse.json({ error: preparedResult.error }, { status: preparedResult.status })
  }

  try {
    const prepared = preparedResult.data
    const razorpay = getRazorpayClient()
    const amountInSubunits = Math.round(prepared.chargeQuote.totalCharged * 100)

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInSubunits,
      currency: prepared.chargeQuote.chargeCurrency,
      receipt: `hod-${Date.now()}`,
      notes: {
        customer_email: prepared.resolvedCustomer.email,
        customer_name: `${prepared.resolvedCustomer.first_name} ${prepared.resolvedCustomer.last_name}`.trim(),
        item_count: String(prepared.normalizedItems.length),
      },
    })

    const orderResult = await createPendingOrder({
      adminClient,
      userId: userData.user.id,
      payload: payload || {},
      prepared,
      razorpayOrderId: razorpayOrder.id,
    })

    if ('error' in orderResult) {
      return NextResponse.json({ error: orderResult.error }, { status: 500 })
    }

    return NextResponse.json({
      orderId: orderResult.data.order.id,
      orderNumber: orderResult.data.order.order_number,
      razorpay: {
        keyId: getRazorpayKeyId(),
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'House of Diams',
        description: 'Secure jewellery checkout',
        prefill: {
          name: `${prepared.resolvedCustomer.first_name} ${prepared.resolvedCustomer.last_name}`.trim(),
          email: prepared.resolvedCustomer.email,
          contact: prepared.resolvedCustomer.phone,
        },
        baseCurrency: prepared.chargeQuote.baseCurrency,
        baseAmount: prepared.chargeQuote.totalUsd,
        exchangeRate: prepared.chargeQuote.exchangeRate,
        exchangeRateSource: prepared.chargeQuote.exchangeRateSource,
      },
    })
  } catch (error) {
    console.error('Razorpay order creation failed:', error)
    return NextResponse.json({ error: 'Unable to start Razorpay checkout right now.' }, { status: 500 })
  }
}
