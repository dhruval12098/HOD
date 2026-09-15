import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/server-supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ offer: null })

  const supabase = createSupabaseServerClient()
  const { data: promotion, error: promotionError } = await supabase
    .from('promotion_popup')
    .select('cta_action, selected_coupon_id, is_active, description')
    .eq('section_key', 'global_promotion_popup')
    .maybeSingle()

  if (promotionError || !promotion?.is_active || promotion.cta_action !== 'reveal_coupon' || promotion.selected_coupon_id == null) {
    return NextResponse.json({ offer: null })
  }

  // Never select or expose `code` here. The submit endpoint is the sole reveal path.
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('discount_type, discount_value, reward_type, minimum_order_amount, is_active, starts_at, ends_at, usage_limit, usage_count')
    .eq('id', promotion.selected_coupon_id)
    .maybeSingle()

  const now = Date.now()
  const type = coupon?.discount_type
  const amount = Number(coupon?.discount_value)
  const valid = !error && coupon?.is_active && (type === 'percentage' || type === 'fixed') &&
    Number.isFinite(amount) && amount > 0 && coupon.reward_type !== 'free_gift' &&
    (!coupon.starts_at || Date.parse(coupon.starts_at) <= now) &&
    (!coupon.ends_at || Date.parse(coupon.ends_at) > now) &&
    (coupon.usage_limit == null || Number(coupon.usage_count ?? 0) < Number(coupon.usage_limit))

  if (!valid) return NextResponse.json({ offer: null })

  return NextResponse.json({ offer: {
    discountType: type,
    discountValue: amount,
    description: promotion.description || null,
    minimumOrderAmount: coupon.minimum_order_amount == null ? null : Number(coupon.minimum_order_amount),
  } }, { headers: { 'Cache-Control': 'no-store' } })
}
