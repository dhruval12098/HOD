import type { StorefrontProduct } from '@/lib/catalog-products'

export function getProductKey(product: { dbId?: string | null; id?: string | number | null; slug?: string | null }) {
  return product.dbId || product.slug || String(product.id ?? '')
}

export type CartItemSelection = {
  metal?: string
  purity?: string
  sizeOrFit?: string
  ringSize?: string
  ringCategoryId?: string
  gemstone?: string
  shape?: string
  hiphopCarat?: string
  engravingMode?: string
  engravingText?: string
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
    metal: selection.metal || '',
    purity: selection.purity || '',
    sizeOrFit: selection.sizeOrFit || '',
    ringSize: selection.ringSize || '',
    ringCategoryId: selection.ringCategoryId || '',
    gemstone: selection.gemstone || '',
    shape: selection.shape || '',
    hiphopCarat: selection.hiphopCarat || '',
    engravingMode: selection.engravingMode || '',
    engravingText: selection.engravingText || '',
  })
}

export function buildCheckoutHrefFromCartItem(product: StorefrontProduct, item: StoredCartItem) {
  const params = new URLSearchParams()
  params.set('slug', product.slug)
  params.set('name', product.name)
  params.set('price', String(product.priceFrom))
  if (product.imageUrl) params.set('image', product.imageUrl)
  if (item.selection.metal) params.set('metal', item.selection.metal)
  if (item.selection.purity) params.set('purity', item.selection.purity)
  if (item.selection.hiphopCarat) params.set('carat', item.selection.hiphopCarat)
  if (item.selection.sizeOrFit) params.set('size', item.selection.sizeOrFit)
  if (item.selection.ringSize) params.set('ring_size', item.selection.ringSize)
  if (item.selection.gemstone) params.set('gemstone', item.selection.gemstone)
  if (item.selection.shape) params.set('shape', item.selection.shape)
  return `/checkout?${params.toString()}`
}
