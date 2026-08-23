import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/server-supabase'
import { enforceRateLimit } from '@/lib/rate-limit'
import { isValidEmail } from '@/lib/validation'

export async function POST(request: Request) {
  const rateLimit = await enforceRateLimit(request, { key: 'promotion-popup-submit', limit: 5, windowSeconds: 60 })
  if (!rateLimit.ok && rateLimit.response) return rateLimit.response

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email || email.length > 254 || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Promotion email collection is not configured.' }, { status: 503 })
  }

  const supabase = createSupabaseServerClient()
  const { data: promotion, error: promotionError } = await supabase
    .from('promotion_popup')
    .select('cta_action, cta_link, selected_coupon_id, is_active')
    .eq('section_key', 'global_promotion_popup')
    .maybeSingle()

  if (promotionError || !promotion?.is_active) {
    return NextResponse.json({ error: 'This promotion is no longer available.' }, { status: 410 })
  }

  const actionType = promotion.cta_action === 'reveal_coupon' ? 'reveal_coupon' : 'redirect'
  let coupon: { id: number; code: string; title: string | null } | null = null

  if (actionType === 'reveal_coupon') {
    if (promotion.selected_coupon_id == null) {
      return NextResponse.json({ error: 'This coupon is no longer available.' }, { status: 410 })
    }

    const { data, error } = await supabase
      .from('coupons')
      .select('id, code, title, usage_limit, usage_count, is_active')
      .eq('id', promotion.selected_coupon_id)
      .maybeSingle()

    if (error || !data?.is_active || (data.usage_limit != null && Number(data.usage_count ?? 0) >= Number(data.usage_limit))) {
      return NextResponse.json({ error: 'This coupon is no longer available.' }, { status: 410 })
    }
    coupon = { id: Number(data.id), code: data.code, title: data.title }
  }

  const { error: submissionError } = await supabase.from('promotion_popup_submissions').insert({
    email,
    action_type: actionType,
    coupon_id: coupon?.id ?? null,
  })

  if (submissionError) {
    return NextResponse.json({ error: 'Unable to save your email. Please try again.' }, { status: 500 })
  }

  if (actionType === 'reveal_coupon' && coupon) {
    return NextResponse.json({ ok: true, action: actionType, coupon: { code: coupon.code, title: coupon.title } })
  }

  return NextResponse.json({ ok: true, action: 'redirect', redirectUrl: promotion.cta_link || '/' })
}
