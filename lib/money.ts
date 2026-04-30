import { formatMoney, formatMoneyNumber } from '@/lib/currency'

export function formatUsd(amount: number | null | undefined, options?: { maximumFractionDigits?: number }) {
  return formatMoney(amount, 'USD', options)
}

export function formatUsdNumber(amount: number | null | undefined) {
  return formatMoneyNumber(amount, 'USD')
}
