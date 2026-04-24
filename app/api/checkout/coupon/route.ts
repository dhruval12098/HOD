import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

type CouponPayload = {
  code?: string
  subtotal?: number
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase environment variables.' }, { status: 500 })
  }

  const body = (await request.json().catch(() => null)) as CouponPayload | null
  const code = body?.code?.trim().toUpperCase()
  const subtotal = Number(body?.subtotal ?? 0)

  if (!code || !Number.isFinite(subtotal) || subtotal <= 0) {
    return NextResponse.json({ error: 'Invalid coupon request.' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('id, code, title, discount_type, discount_value, usage_limit, usage_count, is_active')
    .eq('code', code)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!coupon || !coupon.is_active) {
    return NextResponse.json({ error: 'Coupon is invalid or inactive.' }, { status: 404 })
  }

  if (coupon.usage_limit != null && coupon.usage_count >= coupon.usage_limit) {
    return NextResponse.json({ error: 'Coupon usage limit has been reached.' }, { status: 400 })
  }

  const rawDiscount =
    coupon.discount_type === 'percentage'
      ? subtotal * (Number(coupon.discount_value || 0) / 100)
      : Number(coupon.discount_value || 0)

  const discountAmount = Math.max(0, Math.min(subtotal, Number(rawDiscount.toFixed(2))))

  return NextResponse.json({
    coupon: {
      id: coupon.id,
      code: coupon.code,
      title: coupon.title,
      discountType: coupon.discount_type,
      discountValue: Number(coupon.discount_value || 0),
      discountAmount,
    },
  })
}
