import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createPendingOrder, type CheckoutPayload, prepareCheckoutPayload } from '@/lib/checkout-order'
import { getRazorpayClient, getRazorpayKeyId, isRazorpayConfigured } from '@/lib/razorpay'
import { enforceRateLimit } from '@/lib/rate-limit'

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

  const rateLimit = await enforceRateLimit(request, { key: 'checkout-place', limit: 8, windowSeconds: 60 })
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

  const payload = (await request.json().catch(() => null)) as CheckoutPayload | null
  const idempotencyKey = payload?.idempotencyKey?.trim() || ''
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(idempotencyKey)) {
    return NextResponse.json({ error: 'Invalid checkout attempt.' }, { status: 400 })
  }
  const preparedResult = await prepareCheckoutPayload({
    adminClient,
    payload,
    user: userData.user,
  })

  if ('error' in preparedResult) {
    return NextResponse.json({ error: preparedResult.error }, { status: preparedResult.status })
  }

  const prepared = preparedResult.data
  const { data: attempt, error: attemptError } = await adminClient
    .from('checkout_attempts')
    .insert({ user_id: userData.user.id, idempotency_key: idempotencyKey, status: 'processing' })
    .select('id')
    .single()

  if (attemptError) {
    if (attemptError.code !== '23505') {
      return NextResponse.json({ error: 'Unable to reserve this checkout attempt.' }, { status: 500 })
    }

    const { data: existingAttempt } = await adminClient
      .from('checkout_attempts')
      .select('status, order_id, razorpay_order_id')
      .eq('user_id', userData.user.id)
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()

    if (existingAttempt?.status === 'completed' && existingAttempt.order_id && existingAttempt.razorpay_order_id) {
      const { data: existingOrder } = await adminClient
        .from('orders')
        .select('id, order_number, payment_amount, payment_currency, customer_first_name, customer_last_name, customer_email, customer_phone, gateway_payload')
        .eq('id', existingAttempt.order_id)
        .eq('user_id', userData.user.id)
        .maybeSingle()

      if (existingOrder) {
        const totals = (existingOrder.gateway_payload as { totals?: Record<string, unknown> } | null)?.totals || {}
        return NextResponse.json({
          orderId: existingOrder.id,
          orderNumber: existingOrder.order_number,
          razorpay: {
            keyId: getRazorpayKeyId(),
            orderId: existingAttempt.razorpay_order_id,
            amount: Math.round(Number(existingOrder.payment_amount || 0) * 100),
            currency: existingOrder.payment_currency,
            name: 'House of Diams',
            description: 'Secure jewellery checkout',
            prefill: {
              name: `${existingOrder.customer_first_name || ''} ${existingOrder.customer_last_name || ''}`.trim(),
              email: existingOrder.customer_email || '',
              contact: existingOrder.customer_phone || '',
            },
            baseCurrency: totals.baseCurrency || 'USD',
            baseAmount: totals.totalAmount || 0,
            exchangeRate: totals.exchangeRate || 1,
            exchangeRateSource: totals.exchangeRateSource || 'fallback',
          },
        })
      }
    }

    if (existingAttempt?.status === 'failed') {
      return NextResponse.json(
        { error: 'The previous checkout attempt failed. Please try again.', retryable: true },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: 'This checkout attempt is already being processed.' }, { status: 409 })
  }

  try {
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
      await adminClient
        .from('checkout_attempts')
        .update({ status: 'failed', razorpay_order_id: razorpayOrder.id, failure_reason: orderResult.error, updated_at: new Date().toISOString() })
        .eq('id', attempt.id)
      return NextResponse.json({ error: orderResult.error, retryable: true }, { status: 500 })
    }

    const { error: completionError } = await adminClient
      .from('checkout_attempts')
      .update({
        status: 'completed',
        order_id: orderResult.data.order.id,
        razorpay_order_id: razorpayOrder.id,
        failure_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', attempt.id)
    if (completionError) {
      console.error('Checkout attempt completion could not be recorded:', completionError)
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
    await adminClient
      .from('checkout_attempts')
      .update({ status: 'failed', failure_reason: error instanceof Error ? error.message : 'Checkout creation failed.', updated_at: new Date().toISOString() })
      .eq('id', attempt.id)
    console.error('Razorpay order creation failed:', error)
    return NextResponse.json({ error: 'Unable to start Razorpay checkout right now.', retryable: true }, { status: 500 })
  }
}
