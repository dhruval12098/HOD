import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveAuthoritativeCheckoutPricing, type AuthoritativePricingItem } from '@/lib/checkout-pricing'
import { enforceRateLimit } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

type CouponPayload = {
  code?: string
  items?: AuthoritativePricingItem[]
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase environment variables.' }, { status: 500 })
  }

  const rateLimit = await enforceRateLimit(request, { key: 'checkout-coupon', limit: 12, windowSeconds: 60 })
  if (!rateLimit.ok && rateLimit.response) return rateLimit.response

  const body = (await request.json().catch(() => null)) as CouponPayload | null
  const code = body?.code?.trim().toUpperCase()
  const items = body?.items ?? []

  if (!code || code.length > 64 || !/^[A-Z0-9_-]+$/.test(code) || !items.length || items.length > 50) {
    return NextResponse.json({ error: 'Invalid coupon request.' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('id, code, title, discount_type, discount_value, reward_type, minimum_order_amount, gift_product_id, gift_variant_data, gift_banner_image_url, banner_title, banner_description, usage_limit, usage_count, is_active')
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

  const pricingResult = await resolveAuthoritativeCheckoutPricing({
    adminClient: supabase,
    items,
    coupon: { id: coupon.id, code: coupon.code },
  })
  if ('error' in pricingResult) {
    return NextResponse.json({ error: pricingResult.error }, { status: pricingResult.status })
  }

  return NextResponse.json({
    coupon: {
      id: coupon.id,
      code: coupon.code,
      title: coupon.title,
      discountType: coupon.discount_type,
      discountValue: Number(coupon.discount_value || 0),
      discountAmount: pricingResult.data.couponDiscountAmount,
      rewardType: pricingResult.data.couponRewardType,
      minimumOrderAmount: Number(coupon.minimum_order_amount ?? 0),
      gift: pricingResult.data.gift,
      bannerTitle: coupon.banner_title,
      bannerDescription: coupon.banner_description,
      bannerImageUrl: coupon.gift_banner_image_url || pricingResult.data.gift?.imageUrl || '',
    },
  })
}
