export function formatUsd(amount: number | null | undefined, options?: { maximumFractionDigits?: number }) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(Number(amount || 0))
}

export function formatUsdNumber(amount: number | null | undefined) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))
}
