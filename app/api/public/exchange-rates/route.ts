import { NextResponse } from 'next/server'
import { FALLBACK_USD_RATES, normalizeCurrency, type SupportedCurrency } from '@/lib/currency'
import { getUsdExchangeRates } from '@/lib/exchange-rates'

export async function GET() {
  try {
    const supportedCurrencies = Object.keys(FALLBACK_USD_RATES).map((currencyCode) => normalizeCurrency(currencyCode)) as SupportedCurrency[]
    const exchanges = await getUsdExchangeRates(supportedCurrencies)
    const sources = Object.fromEntries(
      supportedCurrencies.map((currencyCode) => [currencyCode, exchanges[currencyCode]?.source || 'fallback'])
    )

    return NextResponse.json({
      rates: Object.fromEntries(
        supportedCurrencies.map((currencyCode) => [currencyCode, exchanges[currencyCode]?.rate || FALLBACK_USD_RATES[currencyCode]])
      ),
      sources,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Public exchange rates lookup failed:', error)
    return NextResponse.json(
      {
        rates: FALLBACK_USD_RATES,
        fetchedAt: new Date().toISOString(),
        source: 'fallback',
      },
      { status: 200 }
    )
  }
}
