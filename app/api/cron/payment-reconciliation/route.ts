import { createClient } from '@supabase/supabase-js'
import { reconcilePaymentRecoveryAction, type PaymentRecoveryAction } from '@/lib/payment-recovery'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: 'Missing Supabase configuration.' }, { status: 500 })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  const { data: expiredReservations, error: expirationError } = await adminClient
    .rpc('expire_inventory_reservations', { p_limit: 1000 })
  if (expirationError) {
    console.error('Inventory reservation expiration failed:', expirationError)
  }
  const { data, error } = await adminClient
    .rpc('claim_due_payment_recovery_actions', { p_limit: 20 })

  if (error) {
    console.error('Payment reconciliation claim failed:', error)
    return Response.json({ error: 'Unable to claim payment recovery actions.' }, { status: 500 })
  }

  const actions = (data || []) as PaymentRecoveryAction[]
  const results = await Promise.all(
    actions.map(async (action) => ({
      id: action.id,
      status: await reconcilePaymentRecoveryAction({ adminClient, action }),
    }))
  )
  const manualReview = results.filter((result) => result.status === 'manual_review').length
  const failed = results.filter((result) => result.status === 'failed').length
  if (manualReview || failed) {
    console.error('Payment reconciliation requires attention:', {
      processed: results.length,
      manualReview,
      failed,
    })
  }

  return Response.json({
    ok: true,
    processed: results.length,
    manualReview,
    failed,
    expiredReservations: expirationError ? null : Number(expiredReservations || 0),
  })
}
