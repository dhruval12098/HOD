import { normalizeCurrency, type SupportedCurrency } from '@/lib/currency'

type ExchangeRateResult = {
  baseCurrency: 'USD'
  targetCurrency: SupportedCurrency
  rate: number
  source: 'currencyapi' | 'fallback'
  fetchedAt: string
}

const DEFAULT_USD_TO_INR_RATE = Number(process.env.USD_TO_INR_FALLBACK_RATE || 83.5)
const CURRENCY_API_KEY = process.env.CURRENCY_API_KEY
const CACHE_TTL_MS = 30 * 60 * 1000

const rateCache = new Map<string, ExchangeRateResult>()

function getFallbackRate(targetCurrency: SupportedCurrency) {
  if (targetCurrency === 'INR') return DEFAULT_USD_TO_INR_RATE
  return 1
}

export function resolveCheckoutCurrency(country: string | null | undefined): SupportedCurrency {
  const normalizedCountry = country?.trim().toLowerCase() || ''
  return normalizedCountry === 'india' || normalizedCountry === 'in' ? 'INR' : 'USD'
}

export async function getUsdExchangeRate(targetCurrency: string | null | undefined): Promise<ExchangeRateResult> {
  const resolvedCurrency = normalizeCurrency(targetCurrency)

  if (resolvedCurrency === 'USD') {
    return {
      baseCurrency: 'USD',
      targetCurrency: 'USD',
      rate: 1,
      source: 'fallback',
      fetchedAt: new Date().toISOString(),
    }
  }

  const cacheKey = `USD:${resolvedCurrency}`
  const cached = rateCache.get(cacheKey)
  if (cached && Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS) {
    return cached
  }

  if (CURRENCY_API_KEY) {
    try {
      const response = await fetch(
        `https://api.currencyapi.com/v3/latest?apikey=${encodeURIComponent(CURRENCY_API_KEY)}&base_currency=USD&currencies=${resolvedCurrency}`,
        { next: { revalidate: 1800 } }
      )
      const payload = await response.json().catch(() => null)
      const liveRate = Number(payload?.data?.[resolvedCurrency]?.value)

      if (response.ok && Number.isFinite(liveRate) && liveRate > 0) {
        const result: ExchangeRateResult = {
          baseCurrency: 'USD',
          targetCurrency: resolvedCurrency,
          rate: liveRate,
          source: 'currencyapi',
          fetchedAt: new Date().toISOString(),
        }
        rateCache.set(cacheKey, result)
        return result
      }
    } catch (error) {
      console.error('Live FX lookup failed, using fallback rate:', error)
    }
  }

  const fallbackResult: ExchangeRateResult = {
    baseCurrency: 'USD',
    targetCurrency: resolvedCurrency,
    rate: getFallbackRate(resolvedCurrency),
    source: 'fallback',
    fetchedAt: new Date().toISOString(),
  }
  rateCache.set(cacheKey, fallbackResult)
  return fallbackResult
}

export async function buildCheckoutChargeQuote(input: {
  subtotalUsd: number
  gstUsd: number
  shippingUsd?: number
  couponDiscountUsd?: number
  country: string | null | undefined
}) {
  const currency = resolveCheckoutCurrency(input.country)
  const exchange = await getUsdExchangeRate(currency)

  const subtotalCharged = Number((input.subtotalUsd * exchange.rate).toFixed(2))
  const gstCharged = Number((input.gstUsd * exchange.rate).toFixed(2))
  const shippingCharged = Number(((input.shippingUsd || 0) * exchange.rate).toFixed(2))
  const couponDiscountCharged = Number(((input.couponDiscountUsd || 0) * exchange.rate).toFixed(2))
  const totalCharged = Number((subtotalCharged + gstCharged + shippingCharged - couponDiscountCharged).toFixed(2))

  return {
    baseCurrency: 'USD' as const,
    chargeCurrency: currency,
    exchangeRate: exchange.rate,
    exchangeRateSource: exchange.source,
    exchangeRateFetchedAt: exchange.fetchedAt,
    subtotalUsd: Number(input.subtotalUsd.toFixed(2)),
    gstUsd: Number(input.gstUsd.toFixed(2)),
    shippingUsd: Number((input.shippingUsd || 0).toFixed(2)),
    couponDiscountUsd: Number((input.couponDiscountUsd || 0).toFixed(2)),
    totalUsd: Number((input.subtotalUsd + input.gstUsd + (input.shippingUsd || 0) - (input.couponDiscountUsd || 0)).toFixed(2)),
    subtotalCharged,
    gstCharged,
    shippingCharged,
    couponDiscountCharged,
    totalCharged,
  }
}
