import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { enforceRateLimit } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase environment variables.' }, { status: 500 })
  }

  const rateLimit = await enforceRateLimit(request, { key: 'checkout-success', limit: 30, windowSeconds: 60 })
  if (!rateLimit.ok && rateLimit.response) return rateLimit.response

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const orderNumber = new URL(request.url).searchParams.get('order')?.trim()
  if (!orderNumber || orderNumber.length > 100) {
    return NextResponse.json({ error: 'Order confirmation not found.' }, { status: 404 })
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

  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .select('order_number, payment_status')
    .eq('user_id', userData.user.id)
    .eq('order_number', orderNumber)
    .eq('payment_status', 'paid')
    .maybeSingle()

  if (orderError) {
    console.error('Order confirmation lookup failed:', orderError)
    return NextResponse.json({ error: 'Unable to confirm this order right now.' }, { status: 500 })
  }

  if (!order) {
    return NextResponse.json({ error: 'Order confirmation not found.' }, { status: 404 })
  }

  return NextResponse.json({ orderNumber: order.order_number })
}
