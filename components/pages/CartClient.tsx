'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/hooks/useCart'
import { getProductKey } from '@/lib/product-keys'
import type { StorefrontProduct } from '@/lib/catalog-products'

type SearchProduct = Pick<StorefrontProduct, 'id' | 'dbId' | 'slug' | 'name' | 'shortMeta' | 'imageUrl' | 'priceFrom'>

export default function CartClient() {
  const { items, updateQuantity, removeItem, clearCart } = useCart()
  const [products, setProducts] = useState<SearchProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      const response = await fetch('/api/public/products', { cache: 'no-store' })
      const payload = await response.json().catch(() => null)
      if (!ignore && response.ok && Array.isArray(payload?.items)) setProducts(payload.items)
      if (!ignore) setIsLoading(false)
    }
    void load()
    return () => {
      ignore = true
    }
  }, [])

  const resolvedItems = useMemo(
    () =>
      items
        .map((item) => ({
          item,
          product: products.find((product) => getProductKey(product) === item.productKey || product.slug === item.productSlug),
        }))
        .filter((entry): entry is { item: typeof items[number]; product: SearchProduct } => Boolean(entry.product)),
    [items, products]
  )

  const total = resolvedItems.reduce((sum, entry) => sum + ((entry.product?.priceFrom || 0) * entry.item.quantity), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-16 sm:px-7 lg:px-[52px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[clamp(34px,5vw,58px)] font-light text-[#0A1628]">Cart</h1>
          <p className="mt-3 text-[13px] text-[#6A6A6A]">Review the pieces you&apos;re preparing to purchase.</p>
        </div>
        {resolvedItems.length ? (
          <button onClick={clearCart} className="rounded-full border border-[#0A1628] px-5 py-3 text-[10px] uppercase tracking-[0.24em] text-[#0A1628]">
            Clear Cart
          </button>
        ) : null}
      </div>
      {isLoading && items.length ? (
        <div className="mt-10 rounded-[24px] border border-[rgba(10,22,40,0.08)] bg-white px-6 py-12 text-center">
          <p className="text-[14px] text-[#6A6A6A]">Loading your cart items...</p>
        </div>
      ) : resolvedItems.length ? (
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            {resolvedItems.map(({ item, product }) => (
              <article key={item.key} className="flex flex-col gap-4 rounded-[24px] border border-[rgba(10,22,40,0.08)] bg-white p-4 shadow-[0_16px_42px_rgba(10,22,40,0.04)] sm:flex-row sm:items-start">
                <div className="h-28 w-full overflow-hidden rounded-[18px] bg-[#F7F3EB] sm:w-28 sm:min-w-28">{(item.selection.resolvedImageUrl || product?.imageUrl) ? <img src={item.selection.resolvedImageUrl || product?.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : null}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] uppercase tracking-[0.22em] text-[#8B94A5]">{product?.shortMeta}</div>
                  <Link
                    href={`/shop/${product?.slug}`}
                    className="mt-2 block text-[#0A1628]"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "20px",
                      fontWeight: 400,
                      letterSpacing: ".02em",
                      lineHeight: 1.2,
                    }}
                  >
                    {product?.name}
                  </Link>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(10,22,40,0.08)] pt-4">
                    <div>
                      <span className="block text-[8px] uppercase tracking-[0.24em] text-[#7F8898]">Price</span>
                      <span className="mt-1 block text-[18px] font-medium text-[#0A1628]">${(item.selection.resolvedPrice ?? product?.priceFrom ?? 0).toLocaleString('en-US')}</span>
                      <span className="mt-2 block text-[8px] uppercase tracking-[0.24em] text-[#7F8898]">Love Letter</span>
                      <span className="mt-1 block text-[12px] text-[#6A6A6A]">
                        {item.selection.loveLetter?.wantsLetter
                          ? `Included${item.selection.loveLetter.recipientName ? ` for ${item.selection.loveLetter.recipientName}` : ''}`
                          : 'No letter'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="h-9 w-9 rounded-full border border-[rgba(10,22,40,0.12)] text-[#0A1628] transition-colors hover:bg-[#0A1628] hover:text-white">-</button>
                      <span className="min-w-6 text-center text-[14px] text-[#0A1628]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="h-9 w-9 rounded-full border border-[rgba(10,22,40,0.12)] text-[#0A1628] transition-colors hover:bg-[#0A1628] hover:text-white">+</button>
                    </div>
                    <button onClick={() => removeItem(item.key)} className="text-[10px] uppercase tracking-[0.2em] text-[#8B94A5] transition-colors hover:text-[#0A1628]">Remove</button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-[24px] border border-[rgba(10,22,40,0.08)] bg-white p-6 shadow-[0_16px_42px_rgba(10,22,40,0.04)] lg:sticky lg:top-28">
            <div className="text-[11px] uppercase tracking-[0.24em] text-[#8B94A5]">Order Summary</div>
            <div className="mt-4 flex items-center justify-between text-[15px] text-[#253246]">
              <span>Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[15px] text-[#253246]">
              <span>Pieces</span>
              <span>{resolvedItems.length}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[22px] font-medium text-[#0A1628]">
              <span>Total</span>
              <span>${total.toLocaleString('en-US')}</span>
            </div>
            {resolvedItems.length ? (
              <Link href="/checkout?mode=cart" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#0A1628] px-6 py-4 text-[10px] uppercase tracking-[0.24em] text-white">
                Checkout Cart
              </Link>
            ) : null}
          </aside>
        </div>
      ) : (
        <div className="mt-10 rounded-[24px] border border-[rgba(10,22,40,0.08)] bg-white px-6 py-12 text-center">
          <p className="text-[14px] text-[#6A6A6A]">Your cart is empty.</p>
          <Link href="/shop" className="mt-5 inline-flex rounded-full bg-[#0A1628] px-6 py-3 text-[10px] uppercase tracking-[0.24em] text-white">
            Explore Products
          </Link>
        </div>
      )}
    </section>
  )
}
