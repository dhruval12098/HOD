'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  CURRENCIES,
  FALLBACK_USD_RATES,
  formatMoney,
  getCurrencyOption,
  normalizeCurrency,
  type CurrencyOption,
  type SupportedCurrency,
} from '@/lib/currency'

type CurrencyRates = Partial<Record<SupportedCurrency, number>>

type CurrencyContextValue = {
  currencies: CurrencyOption[]
  selected: CurrencyOption
  currency: CurrencyOption
  currencyCode: SupportedCurrency
  rates: CurrencyRates
  exchangeRate: number
  isLoadingRate: boolean
  changeCurrency: (code: SupportedCurrency | string) => void
  setCurrencyCode: (code: SupportedCurrency | string) => void
  convert: (amountUsd: number | null | undefined) => number
  format: (amountUsd: number | null | undefined, options?: { maximumFractionDigits?: number }) => string
}

const STORAGE_KEY = 'selected_currency'
const RATE_TARGETS = CURRENCIES.filter((currency) => currency.code !== 'USD').map((currency) => currency.code).join(',')

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<CurrencyOption>(CURRENCIES[0])
  const [rates, setRates] = useState<CurrencyRates>({ USD: 1 })
  const [isLoadingRate, setIsLoadingRate] = useState(false)

  useEffect(() => {
    const storedCurrency = window.localStorage.getItem(STORAGE_KEY)
    if (storedCurrency) {
      setSelected(getCurrencyOption(storedCurrency))
    }

    const key = process.env.NEXT_PUBLIC_FASTFOREX_API_KEY
    if (!key) {
      setRates({ ...FALLBACK_USD_RATES })
      return
    }

    let ignore = false
    setIsLoadingRate(true)

    void (async () => {
      try {
        const response = await fetch(
          `https://api.fastforex.io/fetch-multi?from=USD&to=${RATE_TARGETS}&api_key=${encodeURIComponent(key)}`,
          { cache: 'no-store' }
        )
        const data = await response.json().catch(() => null)
        const results = data?.results || {}

        if (!ignore && response.ok && results && typeof results === 'object') {
          setRates({
            ...FALLBACK_USD_RATES,
            USD: 1,
            ...results,
          })
        }
      } catch {
        if (!ignore) setRates({ ...FALLBACK_USD_RATES })
      } finally {
        if (!ignore) setIsLoadingRate(false)
      }
    })()

    return () => {
      ignore = true
    }
  }, [])

  const changeCurrency = useCallback((code: SupportedCurrency | string) => {
    const nextCurrency = getCurrencyOption(code)
    setSelected(nextCurrency)
    window.localStorage.setItem(STORAGE_KEY, nextCurrency.code)
  }, [])

  const convert = useCallback(
    (amountUsd: number | null | undefined) => Number((Number(amountUsd || 0) * (rates[selected.code] ?? 1)).toFixed(2)),
    [rates, selected.code]
  )

  const format = useCallback(
    (amountUsd: number | null | undefined, options?: { maximumFractionDigits?: number }) =>
      formatMoney(convert(amountUsd), selected.code, options),
    [convert, selected.code]
  )

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currencies: CURRENCIES,
      selected,
      currency: selected,
      currencyCode: selected.code,
      rates,
      exchangeRate: rates[selected.code] ?? 1,
      isLoadingRate,
      changeCurrency,
      setCurrencyCode: changeCurrency,
      convert,
      format,
    }),
    [changeCurrency, convert, format, isLoadingRate, rates, selected]
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used inside CurrencyProvider')
  }
  return context
}
