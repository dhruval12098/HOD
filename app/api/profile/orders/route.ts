import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const pageSize = Math.min(10, Math.max(1, Number(searchParams.get('pageSize') || 5)))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data: orders, error: ordersError, count } = await adminClient
    .from('orders')
    .select(
      'id, order_number, status, payment_status, subtotal_amount, gst_amount, shipping_amount, total_amount, created_at',
      { count: 'exact' }
    )
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 })
  }

  const orderIds = (orders ?? []).map((order) => order.id)
  let itemMap = new Map<string, Array<Record<string, unknown>>>()

  if (orderIds.length > 0) {
    const { data: items, error: itemsError } = await adminClient
      .from('order_items')
      .select('order_id, product_name, quantity, unit_price, line_total, image_url')
      .in('order_id', orderIds)

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    itemMap = (items ?? []).reduce((map, item) => {
      const bucket = map.get(String(item.order_id)) ?? []
      bucket.push(item)
      map.set(String(item.order_id), bucket)
      return map
    }, new Map<string, Array<Record<string, unknown>>>())
  }

  return NextResponse.json({
    orders: (orders ?? []).map((order) => ({
      ...order,
      items: itemMap.get(String(order.id)) ?? [],
    })),
    pagination: {
      page,
      pageSize,
      total: count ?? 0,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    },
  })
}
