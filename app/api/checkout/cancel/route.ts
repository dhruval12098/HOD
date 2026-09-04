import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { enforceRateLimit } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase configuration.' }, { status: 500 })
  }

  const rateLimit = await enforceRateLimit(request, { key: 'checkout-cancel', limit: 20, windowSeconds: 60 })
  if (!rateLimit.ok && rateLimit.response) return rateLimit.response

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData, error: userError } = await authClient.auth.getUser()
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const payload = await request.json().catch(() => null) as { orderId?: string } | null
  if (!payload?.orderId) {
    return NextResponse.json({ error: 'Missing order.' }, { status: 400 })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  const { data: cancelled, error } = await adminClient.rpc('cancel_pending_checkout', {
    p_order_id: payload.orderId,
    p_user_id: userData.user.id,
  })
  if (error) {
    console.error('Pending checkout cancellation failed:', error)
    return NextResponse.json({ error: 'Unable to release checkout.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, released: Boolean(cancelled) })
}

