import type { StorefrontProduct } from '@/lib/catalog-products'
import type { LoveLetterDraft } from '@/lib/love-letter'

export function getProductKey(product: { dbId?: string | null; id?: string | number | null; slug?: string | null }) {
  return product.dbId || product.slug || String(product.id ?? '')
}

export type CartItemSelection = {
  metalVariantId?: string
  metal?: string
  metalSlug?: string
  purity?: string
  resolvedPrice?: number
  resolvedImageUrl?: string
  sizeOrFit?: string
  ringSize?: string
  ringCategoryId?: string
  gemstone?: string
  shape?: string
  hiphopCarat?: string
  engravingMode?: string
  engravingText?: string
  loveLetter?: LoveLetterDraft | null
}

export type StoredCartItem = {
  key: string
  productKey: string
  productSlug: string
  quantity: number
  selection: CartItemSelection
  addedAt: number
}

export function buildCartItemKey(product: { dbId?: string | null; id?: string | number | null; slug?: string | null }, selection: CartItemSelection) {
  return JSON.stringify({
    productKey: getProductKey(product),
    productSlug: product.slug || '',
    metalVariantId: selection.metalVariantId || '',
    metal: selection.metal || '',
    metalSlug: selection.metalSlug || '',
    purity: selection.purity || '',
    sizeOrFit: selection.sizeOrFit || '',
    ringSize: selection.ringSize || '',
    ringCategoryId: selection.ringCategoryId || '',
    gemstone: selection.gemstone || '',
    shape: selection.shape || '',
    hiphopCarat: selection.hiphopCarat || '',
    engravingMode: selection.engravingMode || '',
    engravingText: selection.engravingText || '',
    loveLetter: selection.loveLetter
      ? {
          wantsLetter: Boolean(selection.loveLetter.wantsLetter),
          letterType: selection.loveLetter.letterType || 'no_letter',
          recipientName: selection.loveLetter.recipientName || '',
          senderName: selection.loveLetter.senderName || '',
          occasionKey: selection.loveLetter.occasionKey || '',
          aboutHerText: selection.loveLetter.aboutHerText || '',
          customLetterText: selection.loveLetter.customLetterText || '',
          finalLetterText: selection.loveLetter.finalLetterText || '',
        }
      : null,
  })
}

export function buildCheckoutHrefFromCartItem(product: StorefrontProduct, item: StoredCartItem) {
  const params = new URLSearchParams()
  params.set('slug', product.slug)
  params.set('name', product.name)
  params.set('price', String(item.selection.resolvedPrice ?? product.priceFrom))
  if (item.selection.resolvedImageUrl || product.imageUrl) params.set('image', item.selection.resolvedImageUrl || product.imageUrl || '')
  if (item.selection.metalVariantId) params.set('variant', item.selection.metalVariantId)
  if (item.selection.metal) params.set('metal', item.selection.metal)
  if (item.selection.hiphopCarat) params.set('carat', item.selection.hiphopCarat)
  if (item.selection.sizeOrFit) params.set('size', item.selection.sizeOrFit)
  if (item.selection.ringSize) params.set('ring_size', item.selection.ringSize)
  if (item.selection.gemstone) params.set('gemstone', item.selection.gemstone)
  if (item.selection.shape) params.set('shape', item.selection.shape)
  return `/checkout?${params.toString()}`
}
