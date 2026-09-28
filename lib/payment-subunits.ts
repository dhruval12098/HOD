type SupportedPaymentCurrency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'AUD' | 'SGD' | 'JPY' | 'CNY'

const SUPPORTED_PAYMENT_CURRENCIES = new Set<SupportedPaymentCurrency>([
  'USD', 'INR', 'EUR', 'GBP', 'AED', 'CAD', 'AUD', 'SGD', 'JPY', 'CNY',
])
const ZERO_DECIMAL_CURRENCIES = new Set<SupportedPaymentCurrency>(['JPY'])

function requireSupportedCurrency(value: string): SupportedPaymentCurrency {
  const currency = value.trim().toUpperCase()
  if (!SUPPORTED_PAYMENT_CURRENCIES.has(currency as SupportedPaymentCurrency)) {
    throw new Error('Unsupported payment currency.')
  }
  return currency as SupportedPaymentCurrency
}

export function paymentSubunitFactor(currency: string) {
  return ZERO_DECIMAL_CURRENCIES.has(requireSupportedCurrency(currency)) ? 1 : 100
}

export function roundChargeAmount(amount: number, currency: string) {
  if (!Number.isFinite(amount)) throw new Error('Payment amount must be finite.')
  const factor = paymentSubunitFactor(currency)
  return Math.round(amount * factor) / factor
}

export function toRazorpayAmountInSubunits(amount: number, currency: string) {
  const factor = paymentSubunitFactor(currency)
  const subunits = Math.round(roundChargeAmount(amount, currency) * factor)
  if (!Number.isSafeInteger(subunits) || subunits <= 0) {
    throw new Error('Payment amount must be a positive integer in currency subunits.')
  }
  return subunits
}
