import type { SupabaseClient } from '@supabase/supabase-js'
import { getRazorpayClient } from '@/lib/razorpay'

type RecoveryClaim = {
  action_id: string
  action_status: string
  should_attempt: boolean
}

export type PaymentRecoveryAction = {
  id: string
  order_id: string
  payment_id: string
  amount_subunits: number
  currency: string
  reason_code: string
  status: string
  provider_refund_id: string | null
  attempt_count: number
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 1000) : 'Unknown refund error.'
}

function retryAt(attemptCount: number) {
  const minutes = Math.min(360, 2 ** Math.min(Math.max(attemptCount, 1), 8))
  return new Date(Date.now() + minutes * 60_000).toISOString()
}

async function updateRecoveryAction(
  adminClient: SupabaseClient,
  actionId: string,
  values: Record<string, unknown>
) {
  return adminClient
    .from('payment_recovery_actions')
    .update({ ...values, leased_until: null, updated_at: new Date().toISOString() })
    .eq('id', actionId)
}

export async function recoverCapturedPayment({
  adminClient,
  orderId,
  paymentId,
  amountInSubunits,
  currency,
  reasonCode,
}: {
  adminClient: SupabaseClient
  orderId: string
  paymentId: string
  amountInSubunits: number
  currency: string
  reasonCode: string
}) {
  const { data, error } = await adminClient
    .rpc('claim_payment_recovery_action', {
      p_order_id: orderId,
      p_payment_id: paymentId,
      p_amount_subunits: amountInSubunits,
      p_currency: currency,
      p_reason_code: reasonCode,
    })
    .single()

  if (error || !data) {
    return { durable: false, error: error?.message || 'Unable to record payment recovery.' } as const
  }

  const claim = data as RecoveryClaim
  if (!claim.should_attempt) {
    return { durable: true, status: claim.action_status, duplicate: true } as const
  }

  try {
    const refund = await getRazorpayClient().payments.refund(paymentId, {
      amount: amountInSubunits,
      speed: 'normal',
      receipt: `recovery-${claim.action_id}`,
      notes: {
        order_id: orderId,
        recovery_action_id: claim.action_id,
        reason: reasonCode,
      },
    })
    const status = refund.status === 'processed' ? 'refunded' : 'refund_pending'
    const now = new Date().toISOString()
    const { error: updateError } = await adminClient
      .from('payment_recovery_actions')
      .update({
        status,
        provider_refund_id: refund.id,
        requested_at: now,
        completed_at: status === 'refunded' ? now : null,
        last_error: null,
        updated_at: now,
      })
      .eq('id', claim.action_id)

    if (updateError) {
      return { durable: true, status: 'processing', error: updateError.message } as const
    }

    return { durable: true, status, refundId: refund.id } as const
  } catch (refundError) {
    const message = errorMessage(refundError)
    await adminClient
      .from('payment_recovery_actions')
      .update({ status: 'failed', last_error: message, updated_at: new Date().toISOString() })
      .eq('id', claim.action_id)

    return { durable: true, status: 'failed', error: message } as const
  }
}

export async function reconcilePaymentRecoveryAction({
  adminClient,
  action,
}: {
  adminClient: SupabaseClient
  action: PaymentRecoveryAction
}) {
  const razorpay = getRazorpayClient()

  try {
    const payment = await razorpay.payments.fetch(action.payment_id)
    if (
      payment.status !== 'captured' ||
      Number(payment.amount) !== Number(action.amount_subunits) ||
      String(payment.currency || '').toUpperCase() !== action.currency.toUpperCase()
    ) {
      await updateRecoveryAction(adminClient, action.id, {
        status: 'manual_review',
        last_error: 'Gateway payment state, amount, or currency did not match the recovery action.',
      })
      return 'manual_review' as const
    }

    let refund = action.provider_refund_id
      ? await razorpay.payments.fetchRefund(action.payment_id, action.provider_refund_id)
      : null

    if (!refund) {
      const refunds = await razorpay.payments.fetchMultipleRefund(action.payment_id, { count: 100 })
      refund = refunds.items.find((candidate) => candidate.receipt === `recovery-${action.id}`) || null
    }

    if (!refund) {
      refund = await razorpay.payments.refund(action.payment_id, {
        amount: action.amount_subunits,
        speed: 'normal',
        receipt: `recovery-${action.id}`,
        notes: {
          order_id: action.order_id,
          recovery_action_id: action.id,
          reason: action.reason_code,
        },
      })
    }

    const status = refund.status === 'processed'
      ? 'refunded'
      : refund.status === 'failed'
        ? 'failed'
        : 'refund_pending'
    const now = new Date().toISOString()
    await updateRecoveryAction(adminClient, action.id, {
      status,
      provider_refund_id: refund.id,
      requested_at: now,
      completed_at: status === 'refunded' ? now : null,
      last_error: status === 'failed' ? 'Razorpay reported that the refund failed.' : null,
      next_attempt_at: status === 'refunded' ? now : retryAt(action.attempt_count),
    })
    return status
  } catch (error) {
    const status = action.attempt_count >= 8 ? 'manual_review' : 'failed'
    await updateRecoveryAction(adminClient, action.id, {
      status,
      last_error: errorMessage(error),
      next_attempt_at: retryAt(action.attempt_count),
    })
    return status
  }
}
