import { NextResponse } from 'next/server'
import { buildCheckoutChargeQuote } from '@/lib/exchange-rates'

type QuotePayload = {
  country?: string | null
  items?: Array<{
    priceFrom: number
    quantity: number
    gstPercentage?: number
  }>
  couponDiscountAmount?: number | null
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as QuotePayload | null
  const items = payload?.items ?? []

  if (!items.length) {
    return NextResponse.json({ error: 'Missing checkout items.' }, { status: 400 })
  }

  const subtotalUsd = items.reduce((sum, item) => sum + Number(item.priceFrom || 0) * Number(item.quantity || 0), 0)
  const couponDiscountUsd = Math.max(0, Math.min(subtotalUsd, Number(payload?.couponDiscountAmount || 0)))
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
  })

  return NextResponse.json({ quote })
}
