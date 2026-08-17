import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { finalizePaidOrder, markOrderPaymentFailed } from '@/lib/checkout-order'
import { getRazorpayClient, verifyRazorpayPaymentSignature } from '@/lib/razorpay'
import { enforceRateLimit } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

type VerifyPayload = {
  orderId?: string
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase environment variables.' }, { status: 500 })
  }

  const rateLimit = await enforceRateLimit(request, { key: 'payment-verify', limit: 20, windowSeconds: 60 })
  if (!rateLimit.ok && rateLimit.response) return rateLimit.response

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

  const payload = (await request.json().catch(() => null)) as VerifyPayload | null
  if (!payload?.orderId || !payload.razorpay_order_id || !payload.razorpay_payment_id || !payload.razorpay_signature) {
    return NextResponse.json({ error: 'Incomplete payment verification payload.' }, { status: 400 })
  }

  const { data: ownedOrder } = await adminClient
    .from('orders')
    .select('id, user_id, razorpay_order_id, payment_amount, payment_currency')
    .eq('id', payload.orderId)
    .maybeSingle()

  if (!ownedOrder || ownedOrder.user_id !== userData.user.id) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }

  if (!ownedOrder.razorpay_order_id || ownedOrder.razorpay_order_id !== payload.razorpay_order_id) {
    return NextResponse.json({ error: 'Payment does not match this order.' }, { status: 400 })
  }

  const isValidSignature = verifyRazorpayPaymentSignature({
    orderId: payload.razorpay_order_id,
    paymentId: payload.razorpay_payment_id,
    signature: payload.razorpay_signature,
  })

  if (!isValidSignature) {
    await markOrderPaymentFailed({
      adminClient,
      orderId: payload.orderId,
      razorpayOrderId: payload.razorpay_order_id,
      paymentId: payload.razorpay_payment_id,
      error: {
        code: 'signature_verification_failed',
        description: 'Razorpay signature verification failed.',
      },
    })
    return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 })
  }

  try {
    const razorpay = getRazorpayClient()
    const payment = await razorpay.payments.fetch(payload.razorpay_payment_id)
    const expectedAmountInSubunits = Math.round(Number(ownedOrder.payment_amount || 0) * 100)
    const expectedCurrency = String(ownedOrder.payment_currency || '').toUpperCase()
    const paymentCurrency = String(payment.currency || '').toUpperCase()

    if (payment.order_id !== ownedOrder.razorpay_order_id || payment.order_id !== payload.razorpay_order_id) {
      return NextResponse.json({ error: 'Payment does not match this order.' }, { status: 400 })
    }

    if (Number(payment.amount) !== expectedAmountInSubunits || paymentCurrency !== expectedCurrency) {
      return NextResponse.json({ error: 'Payment amount or currency does not match this order.' }, { status: 400 })
    }

    if (payment.status !== 'captured') {
      return NextResponse.json({ error: 'Payment has not been captured.' }, { status: 400 })
    }

    const finalized = await finalizePaidOrder({
      adminClient,
      orderId: payload.orderId,
      paymentId: payload.razorpay_payment_id,
      razorpayOrderId: payload.razorpay_order_id,
      signature: payload.razorpay_signature,
      paymentMethod: payment.method || null,
      paymentContact: payment.contact != null ? String(payment.contact) : null,
      paymentEmail: payment.email || null,
      gatewayPaymentStatus: payment.status || 'captured',
      paymentAmountInSubunits: Number(payment.amount),
      paymentCurrency,
      rawEvent: payment,
    })

    if ('error' in finalized) {
      return NextResponse.json({ error: finalized.error }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      orderId: finalized.data.orderId,
      orderNumber: finalized.data.orderNumber,
    })
  } catch (error) {
    console.error('Razorpay payment verification failed:', error)
    return NextResponse.json({ error: 'Unable to verify payment right now.' }, { status: 500 })
  }
}
