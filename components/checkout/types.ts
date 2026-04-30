import type { LoveLetterDraft } from '@/lib/love-letter'

export type CheckoutDisplayItem = {
  name: string
  slug: string
  imageUrl?: string
  priceFrom: number
  metal?: string
  purity?: string
  sizeOrFit?: string
  gemstone?: string
  carat?: string
  quantity: number
  gstLabel?: string
  gstPercentage?: number
}

export type CheckoutSummaryData = {
  items: CheckoutDisplayItem[]
  couponCode?: string
  couponDiscount?: number
  loveLetter?: LoveLetterDraft | null
}

export type CheckoutProfileForm = {
  first_name: string
  last_name: string
  email: string
  phone: string
  country: string
  state: string
  city: string
  postal_code: string
  address_line_1: string
  address_line_2: string
}
