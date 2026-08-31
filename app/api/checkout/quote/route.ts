import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveAuthoritativeCheckoutPricing } from '@/lib/checkout-pricing'
import { buildCheckoutChargeQuote } from '@/lib/exchange-rates'
import { enforceRateLimit } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

type QuotePayload = {
  country?: string | null
  currencyCode?: string | null
  items?: Array<{
    slug: string
    name?: string
    metalVariantId?: string
    metal?: string
    purity?: string
    quantity: number
  }>
  coupon?: { id?: number; code?: string } | null
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase environment variables.' }, { status: 500 })
  }
  const rateLimit = await enforceRateLimit(request, { key: 'checkout-quote', limit: 30, windowSeconds: 60 })
  if (!rateLimit.ok && rateLimit.response) return rateLimit.response

  const payload = (await request.json().catch(() => null)) as QuotePayload | null
  const items = payload?.items ?? []

  if (!items.length || items.length > 50) {
    return NextResponse.json({ error: 'Missing checkout items.' }, { status: 400 })
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey)
  const pricingResult = await resolveAuthoritativeCheckoutPricing({ adminClient, items, coupon: payload?.coupon })
  if ('error' in pricingResult) {
    return NextResponse.json({ error: pricingResult.error }, { status: pricingResult.status })
  }
  const pricing = pricingResult.data
  const quote = await buildCheckoutChargeQuote({
    subtotalUsd: pricing.subtotalAmount,
    gstUsd: pricing.gstAmount,
    couponDiscountUsd: pricing.couponDiscountAmount,
    country: payload?.country || null,
    currencyCode: payload?.currencyCode || null,
  })

  return NextResponse.json({
    quote,
    pricing: {
      subtotalAmount: pricing.subtotalAmount,
      gstAmount: pricing.gstAmount,
      couponDiscountAmount: pricing.couponDiscountAmount,
      totalAmount: pricing.totalAmount,
      lines: pricing.lines.map((line) => ({ slug: line.product.slug, unitPrice: line.unitPrice, quantity: line.quantity })),
      gift: pricing.gift,
    },
  })
}
