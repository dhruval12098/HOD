import { NextResponse } from 'next/server'
import { buildCheckoutChargeQuote } from '@/lib/exchange-rates'
import { enforceRateLimit } from '@/lib/rate-limit'

type QuotePayload = {
  country?: string | null
  currencyCode?: string | null
  items?: Array<{
    priceFrom: number
    quantity: number
    gstPercentage?: number
  }>
  couponDiscountAmount?: number | null
}

export async function POST(request: Request) {
  const rateLimit = await enforceRateLimit(request, { key: 'checkout-quote', limit: 30, windowSeconds: 60 })
  if (!rateLimit.ok && rateLimit.response) return rateLimit.response

  const payload = (await request.json().catch(() => null)) as QuotePayload | null
  const items = payload?.items ?? []

  if (!items.length || items.length > 50) {
    return NextResponse.json({ error: 'Missing checkout items.' }, { status: 400 })
  }

  const hasInvalidItem = items.some((item) => {
    const priceFrom = Number(item?.priceFrom)
    const quantity = Number(item?.quantity)
    const gstPercentage = Number(item?.gstPercentage ?? 0)

    return (
      !Number.isFinite(priceFrom) ||
      priceFrom <= 0 ||
      priceFrom > 1000000 ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > 100 ||
      !Number.isFinite(gstPercentage) ||
      gstPercentage < 0 ||
      gstPercentage > 100
    )
  })

  if (hasInvalidItem) {
    return NextResponse.json({ error: 'One or more checkout items are invalid.' }, { status: 400 })
  }

  const requestedCouponDiscount = Number(payload?.couponDiscountAmount ?? 0)
  if (!Number.isFinite(requestedCouponDiscount) || requestedCouponDiscount < 0 || requestedCouponDiscount > 1000000) {
    return NextResponse.json({ error: 'Invalid coupon discount amount.' }, { status: 400 })
  }

  const subtotalUsd = items.reduce((sum, item) => sum + Number(item.priceFrom || 0) * Number(item.quantity || 0), 0)
  const couponDiscountUsd = Math.max(0, Math.min(subtotalUsd, requestedCouponDiscount))
  const gstUsd = items.reduce((sum, item) => {
    const lineSubtotal = Number(item.priceFrom || 0) * Number(item.quantity || 0)
    const discountShare = subtotalUsd > 0 ? couponDiscountUsd * (lineSubtotal / subtotalUsd) : 0
    const taxableLineAmount = Math.max(0, lineSubtotal - discountShare)
    return sum + taxableLineAmount * (Number(item.gstPercentage || 0) / 100)
  }, 0)
  const quote = await buildCheckoutChargeQuote({
    subtotalUsd,
    gstUsd,
    couponDiscountUsd,
    country: payload?.country || null,
    currencyCode: payload?.currencyCode || null,
  })

  return NextResponse.json({ quote })
}
