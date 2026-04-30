import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { finalizePaidOrder, markOrderPaymentFailed } from '@/lib/checkout-order'
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

type RazorpayWebhookPayload = {
  event?: string
  payload?: {
    payment?: {
      entity?: {
        id?: string
        order_id?: string
        status?: string
        method?: string
        contact?: string
        email?: string
        error_code?: string
        error_description?: string
        error_source?: string
        error_step?: string
        error_reason?: string
      }
    }
    order?: {
      entity?: {
        id?: string
        status?: string
      }
    }
  }
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase environment variables.' }, { status: 500 })
  }

  const signature = request.headers.get('x-razorpay-signature')
  const eventId = request.headers.get('x-razorpay-event-id')
  const rawBody = await request.text()

  if (!signature) {
    return NextResponse.json({ error: 'Missing webhook signature.' }, { status: 400 })
  }

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 })
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey)
  const payload = JSON.parse(rawBody) as RazorpayWebhookPayload
  const eventType = payload.event || 'unknown'
  const paymentEntity = payload.payload?.payment?.entity
  const orderEntity = payload.payload?.order?.entity
  const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id || null
  const razorpayPaymentId = paymentEntity?.id || null

  if (eventId) {
    const { data: existingEvent } = await adminClient
      .from('payment_webhook_events')
      .select('id, processed')
      .eq('provider', 'razorpay')
      .eq('event_id', eventId)
      .maybeSingle()

    if (existingEvent?.processed) {
      return NextResponse.json({ ok: true, duplicate: true })
    }

    if (!existingEvent) {
      await adminClient.from('payment_webhook_events').insert({
        provider: 'razorpay',
        event_id: eventId,
        event_type: eventType,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        payload,
        processed: false,
      })
    }
  }

  try {
    if ((eventType === 'payment.captured' || eventType === 'order.paid') && razorpayOrderId && razorpayPaymentId) {
      await finalizePaidOrder({
        adminClient,
        razorpayOrderId,
        paymentId: razorpayPaymentId,
        paymentMethod: paymentEntity?.method || null,
        paymentContact: paymentEntity?.contact || null,
        paymentEmail: paymentEntity?.email || null,
        gatewayPaymentStatus: paymentEntity?.status || eventType,
        rawEvent: payload,
      })
    }

    if (eventType === 'payment.failed') {
      await markOrderPaymentFailed({
        adminClient,
        razorpayOrderId,
        paymentId: razorpayPaymentId,
        error: {
          code: paymentEntity?.error_code || null,
          description: paymentEntity?.error_description || null,
          source: paymentEntity?.error_source || null,
          step: paymentEntity?.error_step || null,
          reason: paymentEntity?.error_reason || null,
          metadata: {
            order_id: razorpayOrderId,
            payment_id: razorpayPaymentId,
          },
        },
        rawEvent: payload,
      })
    }

    if (eventId) {
      await adminClient
        .from('payment_webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq('provider', 'razorpay')
        .eq('event_id', eventId)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Razorpay webhook handling failed:', error)
    return NextResponse.json({ error: 'Webhook handling failed.' }, { status: 500 })
  }
}
