import { NextResponse } from 'next/server'
import { getUsdExchangeRate } from '@/lib/exchange-rates'
import { normalizeCurrency } from '@/lib/currency'
import { getRazorpayClient, getRazorpayKeyId, isRazorpayConfigured } from '@/lib/razorpay'

type CreateOrderPayload = {
  priceUSD?: number
  currencyCode?: string
}

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: 'Razorpay is not configured yet.' }, { status: 500 })
  }

  const payload = (await request.json().catch(() => null)) as CreateOrderPayload | null
  const priceUsd = Number(payload?.priceUSD || 0)

  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    return NextResponse.json({ error: 'A valid USD price is required.' }, { status: 400 })
  }

  const currencyCode = normalizeCurrency(payload?.currencyCode)
  const exchange = await getUsdExchangeRate(currencyCode)
  const localAmount = Number((priceUsd * exchange.rate).toFixed(2))
  const razorpay = getRazorpayClient()
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(localAmount * 100),
    currency: currencyCode,
    receipt: `hod-direct-${Date.now()}`,
    notes: {
      price_usd: String(priceUsd),
      price_local: String(localAmount),
      currency_charged: currencyCode,
      exchange_rate: String(exchange.rate),
      exchange_rate_source: exchange.source,
    },
  })

  return NextResponse.json({
    orderId: razorpayOrder.id,
    keyId: getRazorpayKeyId(),
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    priceUSD: priceUsd,
    priceLocal: localAmount,
    currencyCharged: currencyCode,
    exchangeRate: exchange.rate,
    exchangeRateSource: exchange.source,
    exchangeRateFetchedAt: exchange.fetchedAt,
  })
}
