import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { finalizePaidOrder, markOrderPaymentFailed } from '@/lib/checkout-order'
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay'
import { recoverCapturedPayment } from '@/lib/payment-recovery'

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
        amount?: number
        currency?: string
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
    refund?: {
      entity?: {
        id?: string
        payment_id?: string
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

  let payload: RazorpayWebhookPayload
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload
  } catch (error) {
    console.error('Razorpay webhook payload was not valid JSON:', error)
    return NextResponse.json({ error: 'Malformed webhook payload.' }, { status: 400 })
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey)
  const eventType = payload.event || 'unknown'
  const paymentEntity = payload.payload?.payment?.entity
  const orderEntity = payload.payload?.order?.entity
  const refundEntity = payload.payload?.refund?.entity
  const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id || null
  const razorpayPaymentId = paymentEntity?.id || null

  if (eventId) {
    const { data: claimed, error: claimError } = await adminClient
      .rpc('claim_payment_webhook_event', {
        p_provider: 'razorpay',
        p_event_id: eventId,
        p_event_type: eventType,
        p_razorpay_order_id: razorpayOrderId,
        p_razorpay_payment_id: razorpayPaymentId || refundEntity?.payment_id || null,
        p_payload: payload,
      })
    if (claimError) throw new Error('Unable to claim webhook event.')
    if (!claimed) return NextResponse.json({ ok: true, duplicate: true })
  }

  try {
    if ((eventType === 'refund.processed' || eventType === 'refund.failed') && refundEntity?.id) {
      const status = eventType === 'refund.processed' ? 'refunded' : 'failed'
      const now = new Date().toISOString()
      let recoveryUpdate = adminClient
        .from('payment_recovery_actions')
        .update({
          status,
          provider_refund_id: refundEntity.id,
          completed_at: status === 'refunded' ? now : null,
          last_error: status === 'failed' ? 'Razorpay reported that the refund failed.' : null,
          leased_until: null,
          updated_at: now,
        })
      recoveryUpdate = refundEntity.payment_id
        ? recoveryUpdate.eq('payment_id', refundEntity.payment_id)
        : recoveryUpdate.eq('provider_refund_id', refundEntity.id)
      const { error: recoveryError } = await recoveryUpdate
      if (recoveryError) throw recoveryError
    }

    if ((eventType === 'payment.captured' || eventType === 'order.paid') && razorpayOrderId && razorpayPaymentId) {
      if (paymentEntity?.status !== 'captured' || !Number.isFinite(Number(paymentEntity.amount)) || !paymentEntity?.currency) {
        throw new Error('Captured payment details are incomplete.')
      }
      const finalized = await finalizePaidOrder({
        adminClient,
        razorpayOrderId,
        paymentId: razorpayPaymentId,
        paymentMethod: paymentEntity?.method || null,
        paymentContact: paymentEntity?.contact || null,
        paymentEmail: paymentEntity?.email || null,
        gatewayPaymentStatus: paymentEntity?.status || eventType,
        paymentAmountInSubunits: Number(paymentEntity.amount),
        paymentCurrency: paymentEntity.currency,
        rawEvent: payload,
      })

      if ('error' in finalized) {
        const refundableInventoryErrors = new Set([
          'insufficient_stock',
          'missing_product_reference',
          'product_not_found',
        ])
        if (finalized.errorCode && refundableInventoryErrors.has(finalized.errorCode)) {
          const recovery = await recoverCapturedPayment({
            adminClient,
            orderId: finalized.orderId,
            paymentId: razorpayPaymentId,
            amountInSubunits: Number(paymentEntity.amount),
            currency: paymentEntity.currency,
            reasonCode: finalized.errorCode,
          })
          if (!recovery.durable) throw new Error('Captured payment recovery could not be recorded.')
        } else {
          throw new Error(finalized.error)
        }
      }
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
          processing_started_at: null,
        })
        .eq('provider', 'razorpay')
        .eq('event_id', eventId)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Razorpay webhook handling failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook handling failed.' },
      { status: 500 }
    )
  }
}
