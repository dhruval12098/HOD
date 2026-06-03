export type SupportedCurrency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'AUD' | 'SGD' | 'JPY' | 'CNY'

export type CurrencyOption = {
  code: SupportedCurrency
  symbol: string
  countryCode: string
  countryName: string
  label: string
  locale: string
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', countryCode: 'US', countryName: 'United States', label: 'United States', locale: 'en-US' },
  { code: 'INR', symbol: '₹', countryCode: 'IN', countryName: 'India', label: 'India', locale: 'en-IN' },
  { code: 'AED', symbol: 'د.إ', countryCode: 'AE', countryName: 'UAE', label: 'UAE', locale: 'en-AE' },
  { code: 'GBP', symbol: '£', countryCode: 'GB', countryName: 'United Kingdom', label: 'United Kingdom', locale: 'en-GB' },
  { code: 'EUR', symbol: '€', countryCode: 'EU', countryName: 'Europe', label: 'Europe', locale: 'de-DE' },
  { code: 'AUD', symbol: 'A$', countryCode: 'AU', countryName: 'Australia', label: 'Australia', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', countryCode: 'CA', countryName: 'Canada', label: 'Canada', locale: 'en-CA' },
  { code: 'SGD', symbol: 'S$', countryCode: 'SG', countryName: 'Singapore', label: 'Singapore', locale: 'en-SG' },
  { code: 'JPY', symbol: '¥', countryCode: 'JP', countryName: 'Japan', label: 'Japan', locale: 'ja-JP' },
  { code: 'CNY', symbol: '¥', countryCode: 'CN', countryName: 'China', label: 'China', locale: 'zh-CN' },
]

export const FALLBACK_USD_RATES: Record<SupportedCurrency, number> = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  CAD: 1.36,
  AUD: 1.52,
  SGD: 1.35,
  JPY: 155,
  CNY: 7.24,
}

export function normalizeCurrency(value: string | null | undefined): SupportedCurrency {
  const upperValue = value?.toUpperCase()
  return CURRENCIES.some((currency) => currency.code === upperValue) ? (upperValue as SupportedCurrency) : 'USD'
}

export function getCurrencyOption(value: string | null | undefined) {
  const code = normalizeCurrency(value)
  return CURRENCIES.find((currency) => currency.code === code) || CURRENCIES[0]
}

export function formatMoney(
  amount: number | null | undefined,
  currency: string | null | undefined = 'USD',
  options?: { maximumFractionDigits?: number }
) {
  const resolvedCurrency = normalizeCurrency(currency)

  return new Intl.NumberFormat(getCurrencyOption(resolvedCurrency).locale, {
    style: 'currency',
    currency: resolvedCurrency,
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(Number(amount || 0))
}

export function formatMoneyNumber(
  amount: number | null | undefined,
  currency: string | null | undefined = 'USD',
  options?: { maximumFractionDigits?: number }
) {
  const resolvedCurrency = normalizeCurrency(currency)

  return new Intl.NumberFormat(getCurrencyOption(resolvedCurrency).locale, {
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(Number(amount || 0))
}

export function getCurrencySymbol(currency: string | null | undefined = 'USD') {
  const resolvedCurrency = normalizeCurrency(currency)
  return new Intl.NumberFormat(getCurrencyOption(resolvedCurrency).locale, {
    style: 'currency',
    currency: resolvedCurrency,
    maximumFractionDigits: 0,
  })
    .formatToParts(0)
    .find((part) => part.type === 'currency')?.value || '$'
}
