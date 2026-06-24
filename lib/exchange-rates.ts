import { FALLBACK_USD_RATES, normalizeCurrency, type SupportedCurrency } from '@/lib/currency'

type ExchangeRateResult = {
  baseCurrency: 'USD'
  targetCurrency: SupportedCurrency
  rate: number
  source: 'fixer' | 'fallback'
  fetchedAt: string
}

type CachedExchangeRateResult = ExchangeRateResult & {
  expiresAt: number
}

const LIVE_CACHE_TTL_MS = 30 * 60 * 1000
const FALLBACK_CACHE_TTL_MS = 60 * 1000
const FIXER_API_KEY = process.env.APILAYER_FIXER_API_KEY || process.env.FIXER_API_KEY
const rateCache = new Map<string, CachedExchangeRateResult>()

function createExchangeRateResult(
  targetCurrency: SupportedCurrency,
  rate: number,
  source: 'fixer' | 'fallback'
): ExchangeRateResult {
  return {
    baseCurrency: 'USD',
    targetCurrency,
    rate,
    source,
    fetchedAt: new Date().toISOString(),
  }
}

function setRateCache(result: ExchangeRateResult) {
  rateCache.set(`USD:${result.targetCurrency}`, {
    ...result,
    expiresAt: Date.now() + (result.source === 'fixer' ? LIVE_CACHE_TTL_MS : FALLBACK_CACHE_TTL_MS),
  })
}

function getCachedRate(targetCurrency: SupportedCurrency) {
  const cached = rateCache.get(`USD:${targetCurrency}`)
  if (!cached) return null
  if (cached.expiresAt <= Date.now()) {
    rateCache.delete(`USD:${targetCurrency}`)
    return null
  }
  return cached
}

async function fetchFixerRates(targetCurrencies: SupportedCurrency[]) {
  if (!FIXER_API_KEY || targetCurrencies.length < 1) {
    return null
  }

  const targets = targetCurrencies.filter((currency) => currency !== 'USD')
  if (targets.length < 1) {
    return {}
  }

  const symbols = Array.from(new Set(['USD', ...targets]))

  const response = await fetch(
    `https://data.fixer.io/api/latest?access_key=${encodeURIComponent(FIXER_API_KEY)}&symbols=${encodeURIComponent(symbols.join(','))}`,
    {
      cache: 'no-store',
      headers: {
        accept: 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Fixer returned ${response.status}`)
  }

  const payload = await response.json().catch(() => null)
  const rates = payload?.rates
  if (!payload?.success || !rates || typeof rates !== 'object') {
    throw new Error(payload?.error?.info || 'Fixer response did not include usable rates.')
  }

  const usdPerEur = Number(rates.USD)
  if (!Number.isFinite(usdPerEur) || usdPerEur <= 0) {
    throw new Error('Fixer response did not include a usable USD rate.')
  }

  return Object.fromEntries(
    targets.map((currency) => {
      const eurBasedRate = Number(rates[currency])
      const usdBasedRate = eurBasedRate / usdPerEur
      return [currency, usdBasedRate]
    })
  ) as Partial<Record<SupportedCurrency, number>>
}

function getFallbackRate(targetCurrency: SupportedCurrency) {
  return FALLBACK_USD_RATES[targetCurrency] || 1
}

export function resolveCheckoutCurrency(input: {
  country?: string | null
  currencyCode?: string | null
}): SupportedCurrency {
  if (input.currencyCode) return normalizeCurrency(input.currencyCode)

  const normalizedCountry = input.country?.trim().toLowerCase() || ''
  if (normalizedCountry === 'india' || normalizedCountry === 'in') return 'INR'
  return 'USD'
}

export async function getUsdExchangeRate(targetCurrency: string | null | undefined): Promise<ExchangeRateResult> {
  const resolvedCurrency = normalizeCurrency(targetCurrency)

  if (resolvedCurrency === 'USD') {
    return createExchangeRateResult('USD', 1, 'fallback')
  }

  const cached = getCachedRate(resolvedCurrency)
  if (cached) {
    return cached
  }

  try {
    const fixerRates = await fetchFixerRates([resolvedCurrency])
    const fixerRate = Number(fixerRates?.[resolvedCurrency])

    if (Number.isFinite(fixerRate) && fixerRate > 0) {
      const result = createExchangeRateResult(resolvedCurrency, fixerRate, 'fixer')
      setRateCache(result)
      return result
    }
  } catch (error) {
    console.error(`Fixer lookup failed for ${resolvedCurrency}, using fallback rate:`, error)
  }

  const fallbackResult = createExchangeRateResult(resolvedCurrency, getFallbackRate(resolvedCurrency), 'fallback')
  setRateCache(fallbackResult)
  return fallbackResult
}

export async function getUsdExchangeRates(targetCurrencies: SupportedCurrency[]) {
  const uniqueCurrencies = Array.from(new Set(targetCurrencies.map((currency) => normalizeCurrency(currency))))
  const results = new Map<SupportedCurrency, ExchangeRateResult>()
  const missingCurrencies: SupportedCurrency[] = []

  for (const currency of uniqueCurrencies) {
    if (currency === 'USD') {
      results.set(currency, createExchangeRateResult('USD', 1, 'fallback'))
      continue
    }

    const cached = getCachedRate(currency)
    if (cached) {
      results.set(currency, cached)
      continue
    }

    missingCurrencies.push(currency)
  }

  if (missingCurrencies.length > 0) {
    try {
      const fixerRates = await fetchFixerRates(missingCurrencies)

      for (const currency of missingCurrencies) {
        const fixerRate = Number(fixerRates?.[currency])
        if (Number.isFinite(fixerRate) && fixerRate > 0) {
          const result = createExchangeRateResult(currency, fixerRate, 'fixer')
          setRateCache(result)
          results.set(currency, result)
        }
      }
    } catch (error) {
      console.error('Bulk Fixer lookup failed, using fallback rates:', error)
    }

    for (const currency of missingCurrencies) {
      if (results.has(currency)) continue
      const fallbackResult = createExchangeRateResult(currency, getFallbackRate(currency), 'fallback')
      setRateCache(fallbackResult)
      results.set(currency, fallbackResult)
    }
  }

  return Object.fromEntries(uniqueCurrencies.map((currency) => [currency, results.get(currency)!])) as Record<SupportedCurrency, ExchangeRateResult>
}

export async function buildCheckoutChargeQuote(input: {
  subtotalUsd: number
  gstUsd: number
  shippingUsd?: number
  couponDiscountUsd?: number
  country?: string | null
  currencyCode?: string | null
}) {
  const currency = resolveCheckoutCurrency({
    country: input.country,
    currencyCode: input.currencyCode,
  })
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
