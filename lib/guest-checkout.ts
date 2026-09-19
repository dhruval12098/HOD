import { createHash } from 'node:crypto'

export const GUEST_CHECKOUT_HEADER = 'x-guest-checkout-token'

export function hashGuestCheckoutToken(rawToken: string | null | undefined) {
  const normalized = rawToken?.trim().toLowerCase() || ''
  if (!/^[0-9a-f]{64}$/.test(normalized)) return null
  return createHash('sha256').update(normalized, 'utf8').digest('hex')
}

export function getGuestCheckoutTokenHash(request: Request) {
  return hashGuestCheckoutToken(request.headers.get(GUEST_CHECKOUT_HEADER))
}
