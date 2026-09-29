export const LEGACY_HIPHOP_PATH = '/hiphop'
export const LEGACY_HIPHOP_REPLACEMENT_PATH = '/shop'

export function resolveLegacyHipHopHref(value: string | null | undefined) {
  const href = value?.trim()
  return !href || href === LEGACY_HIPHOP_PATH ? LEGACY_HIPHOP_REPLACEMENT_PATH : href
}
