const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9][0-9\s\-()]{7,19}$/

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value)
}

export function isValidPhone(value: string) {
  const trimmed = value.trim()
  const digitsOnly = trimmed.replace(/\D/g, '')
  return PHONE_PATTERN.test(trimmed) && digitsOnly.length >= 8
}
