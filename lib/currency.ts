export type SupportedCurrency = 'USD' | 'INR'

export function normalizeCurrency(value: string | null | undefined): SupportedCurrency {
  return value?.toUpperCase() === 'INR' ? 'INR' : 'USD'
}

export function formatMoney(
  amount: number | null | undefined,
  currency: string | null | undefined = 'USD',
  options?: { maximumFractionDigits?: number }
) {
  const resolvedCurrency = normalizeCurrency(currency)
  const locale = resolvedCurrency === 'INR' ? 'en-IN' : 'en-US'

  return new Intl.NumberFormat(locale, {
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
  const locale = resolvedCurrency === 'INR' ? 'en-IN' : 'en-US'

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(Number(amount || 0))
}

export function getCurrencySymbol(currency: string | null | undefined = 'USD') {
  return normalizeCurrency(currency) === 'INR' ? '₹' : '$'
}
