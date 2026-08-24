import type { SupportedCurrency } from '@/lib/currency'

const EURO_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES',
])

const COUNTRY_CURRENCIES: Readonly<Record<string, SupportedCurrency>> = {
  US: 'USD',
  IN: 'INR',
  AE: 'AED',
  GB: 'GBP',
  AU: 'AUD',
  CA: 'CAD',
  SG: 'SGD',
  JP: 'JPY',
  CN: 'CNY',
}

export function normalizeCountryCode(value: string | null | undefined) {
  const countryCode = value?.trim().toUpperCase() || ''
  return /^[A-Z]{2}$/.test(countryCode) ? countryCode : ''
}

export function currencyForCountry(value: string | null | undefined): SupportedCurrency {
  const countryCode = normalizeCountryCode(value)
  if (EURO_COUNTRIES.has(countryCode)) return 'EUR'
  return COUNTRY_CURRENCIES[countryCode] || 'USD'
}
