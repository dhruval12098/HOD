'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Minus, Plus } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { useCurrency } from '@/context/CurrencyContext'
import { getProductKey, type CartItemSelection, type CartProductSnapshot } from '@/lib/product-keys'
import { PromotionBanner, type StorefrontPromotion } from '@/components/commerce/PromotionBanner'

const APPLIED_COUPON_KEY = 'hod_applied_coupon'

type SearchProduct = CartProductSnapshot

type AppliedCoupon = {
  id: number
  code: string
  rewardType: string
  minimumOrderAmount?: number
  discountAmount?: number
  gift?: {
    name: string
    imageUrl?: string
    originalUnitPrice?: number
    variantData?: { label?: string }
  }
}

function selectedDetails(selection: CartItemSelection) {
  return [
    selection.metal,
    selection.purity,
    selection.sizeOrFit || selection.ringSize,
    selection.gemstone,
    selection.shape,
    selection.hiphopCarat ? `${selection.hiphopCarat} ct` : '',
  ].filter(Boolean).join(', ')
}

export default function CartClient() {
  const { items, updateQuantity, removeItem, clearCart, isHydrated } = useCart()
  const { format } = useCurrency()
  const [products, setProducts] = useState<SearchProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [promotions, setPromotions] = useState<StorefrontPromotion[]>([])
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [couponMessage, setCouponMessage] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const legacyLookupKey = useMemo(
    () => JSON.stringify(items.filter((item) => !item.snapshot).map((item) => [item.productKey, item.productSlug]).sort()),
    [items]
  )

  useEffect(() => {
    if (!isHydrated) return
    const legacy = items.filter((item) => !item.snapshot)
    if (!legacy.length) { setProducts([]); setIsLoading(false); return }
    let ignore = false
    const load = async () => {
      setIsLoading(true)
      const response = await fetch('/api/public/products/cart', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slugs: legacy.map((item) => item.productSlug).filter(Boolean), ids: legacy.map((item) => item.productKey).filter(Boolean) }) })
      const payload = await response.json().catch(() => null)
      if (!ignore && response.ok && Array.isArray(payload?.items)) setProducts(payload.items)
      if (!ignore) setIsLoading(false)
    }
    void load()
    return () => { ignore = true }
  }, [isHydrated, legacyLookupKey])

  useEffect(() => {
    void fetch('/api/public/promotions').then((response) => response.json()).then((payload) => setPromotions(Array.isArray(payload?.items) ? payload.items : [])).catch(() => {})
    try { const stored = localStorage.getItem(APPLIED_COUPON_KEY); if (stored) { const parsed = JSON.parse(stored); setAppliedCoupon(parsed); setCouponCode(parsed.code || '') } } catch {}
  }, [])

  const resolvedItems = useMemo(
    () => items.map((item) => ({ item, product: item.snapshot || products.find((product) => getProductKey(product) === item.productKey || product.slug === item.productSlug) })).filter((entry): entry is { item: typeof items[number]; product: SearchProduct } => Boolean(entry.product)),
    [items, products]
  )

  const total = resolvedItems.reduce((sum, entry) => sum + ((entry.item.selection.resolvedPrice ?? entry.product?.priceFrom ?? 0) * entry.item.quantity), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const featuredPromotion = promotions[0] || null

  useEffect(() => {
    if (!appliedCoupon || total >= Number(appliedCoupon.minimumOrderAmount ?? 0)) return
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponMessage(`Add ${format(Number(appliedCoupon.minimumOrderAmount) - total)} more to claim this offer.`)
    localStorage.removeItem(APPLIED_COUPON_KEY)
  }, [appliedCoupon, format, total])

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) return
    setCouponLoading(true); setCouponMessage('')
    try {
      const response = await fetch('/api/checkout/coupon', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code, items: resolvedItems.map(({ item, product }) => ({ slug: product.slug, name: product.name, metalVariantId: item.selection.metalVariantId, metal: item.selection.metal, purity: item.selection.purity, quantity: item.quantity })) }) })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.coupon) { setAppliedCoupon(null); localStorage.removeItem(APPLIED_COUPON_KEY); setCouponMessage(payload?.error || 'Unable to apply coupon.'); return }
      setAppliedCoupon(payload.coupon); setCouponCode(payload.coupon.code); localStorage.setItem(APPLIED_COUPON_KEY, JSON.stringify(payload.coupon)); setCouponMessage(payload.coupon.rewardType === 'free_gift' ? `${payload.coupon.gift?.name || 'Free gift'} unlocked.` : `Coupon applied. You saved ${format(payload.coupon.discountAmount)}.`)
    } catch { setCouponMessage('Unable to validate the coupon right now.') } finally { setCouponLoading(false) }
  }

  return (
    <main className="min-h-screen bg-white px-5 pb-20 pt-10 text-[var(--color-brand-primary,#000000)] sm:px-8 sm:pt-14 lg:px-[52px] xl:px-[72px]">
      <header className="flex items-end justify-between gap-5 border-b border-black/15 pb-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-[family-name:var(--font-family-primary)] text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-none">My Bag</h1>
          <span className="font-[family-name:var(--font-family-secondary)] text-[14px] text-black/55">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
        </div>
        {resolvedItems.length ? <button type="button" onClick={clearCart} className="border-0 bg-transparent font-[family-name:var(--font-family-secondary)] text-[11px] text-black/55 underline underline-offset-4 transition hover:text-black">Clear bag</button> : null}
      </header>

      {!isHydrated ? (
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]"><div className="space-y-0 divide-y divide-black/10 border-y border-black/10"><div className="h-48 animate-pulse bg-[var(--color-brand-secondary,#f9f9f9)]"/><div className="h-48 animate-pulse bg-[var(--color-brand-secondary,#f9f9f9)]"/></div><div className="h-80 animate-pulse bg-[var(--color-brand-secondary,#f9f9f9)]"/></div>
      ) : resolvedItems.length || (isLoading && items.length) ? (
        <div className="grid items-start gap-12 pt-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-20 xl:grid-cols-[minmax(0,1fr)_400px]">
          <section aria-label="Bag items" className="min-w-0">
            <div className="divide-y divide-black/10 border-y border-black/10">
              {resolvedItems.map(({ item, product }) => {
                const unitPrice = Number(item.selection.resolvedPrice ?? product.priceFrom ?? 0)
                const details = selectedDetails(item.selection)
                const imageUrl = item.selection.resolvedImageUrl || product.imageUrl
                return (
                  <article key={item.key} className="grid gap-5 py-6 sm:grid-cols-[124px_minmax(0,1fr)_auto] sm:gap-6 lg:grid-cols-[142px_minmax(0,1fr)_auto] lg:py-7">
                    <Link href={`/shop/${product.slug}`} className="relative block aspect-[4/5] w-[124px] overflow-hidden bg-[var(--color-brand-secondary,#f9f9f9)] sm:w-full">
                      {imageUrl ? <img src={imageUrl} alt={product.name} className="absolute inset-0 h-full w-full object-cover" /> : null}
                    </Link>

                    <div className="flex min-w-0 flex-col">
                      <p className="font-[family-name:var(--font-family-secondary)] text-[10px] uppercase tracking-[0.1em] text-black/45">{product.shortMeta}</p>
                      <Link href={`/shop/${product.slug}`} className="mt-2 font-[family-name:var(--font-family-primary)] text-[16px] font-semibold leading-[1.4] text-black no-underline sm:text-[18px]">{product.name}</Link>
                      {details ? <p className="mt-2 font-[family-name:var(--font-family-secondary)] text-[12px] leading-5 text-black/60">{details}</p> : null}
                      <p className="mt-1 font-[family-name:var(--font-family-secondary)] text-[11px] leading-5 text-black/50">{item.selection.loveLetter?.wantsLetter ? `Love letter included${item.selection.loveLetter.recipientName ? ` for ${item.selection.loveLetter.recipientName}` : ''}` : 'No love letter'}</p>

                      <div className="mt-auto flex flex-wrap items-end gap-x-6 gap-y-3 pt-5">
                        <div className="grid h-9 grid-cols-[34px_38px_34px] border border-black/25" aria-label={`Quantity for ${product.name}`}>
                          <button type="button" onClick={() => updateQuantity(item.key, item.quantity - 1)} aria-label="Decrease quantity" className="flex items-center justify-center border-0 bg-white text-black transition hover:bg-black hover:text-white"><Minus size={13} strokeWidth={1.5}/></button>
                          <span className="flex items-center justify-center border-x border-black/15 font-[family-name:var(--font-family-secondary)] text-[12px]">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.key, item.quantity + 1)} aria-label="Increase quantity" className="flex items-center justify-center border-0 bg-white text-black transition hover:bg-black hover:text-white"><Plus size={13} strokeWidth={1.5}/></button>
                        </div>
                        <button type="button" onClick={() => removeItem(item.key)} className="mb-2 border-0 bg-transparent p-0 font-[family-name:var(--font-family-secondary)] text-[11px] text-black/55 underline underline-offset-4 transition hover:text-black">Remove</button>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-4 sm:block sm:min-w-[110px] sm:text-right">
                      <span className="font-[family-name:var(--font-family-secondary)] text-[13px] font-semibold text-black sm:text-[14px]">{format(unitPrice * item.quantity)}</span>
                      {item.quantity > 1 ? <span className="mt-1 block font-[family-name:var(--font-family-secondary)] text-[10px] text-black/45">{format(unitPrice)} each</span> : null}
                    </div>
                  </article>
                )
              })}

              {isLoading && items.filter((item) => !item.snapshot).map((item) => <div key={`legacy-${item.key}`} className="grid grid-cols-[124px_1fr] gap-5 py-6" aria-label="Refreshing saved cart item"><div className="aspect-[4/5] animate-pulse bg-[var(--color-brand-secondary,#f9f9f9)]"/><div className="space-y-3 py-2"><div className="h-3 w-24 animate-pulse bg-black/5"/><div className="h-5 w-1/2 animate-pulse bg-black/5"/><div className="h-4 w-28 animate-pulse bg-black/5"/></div></div>)}
            </div>


            {featuredPromotion ? <div className="mt-6"><PromotionBanner promotion={featuredPromotion} subtotal={total} applied={appliedCoupon?.id === featuredPromotion.id} mode="cart" /></div> : null}
          </section>

          <aside className="h-fit border border-black/10 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.07)] sm:p-6 lg:sticky lg:top-28">
            {appliedCoupon?.rewardType === 'free_gift' && appliedCoupon.gift && total >= Number(appliedCoupon.minimumOrderAmount ?? 0) ? (
              <section className="mb-7 border border-black/15 bg-white p-3" aria-label="Complimentary gift added">
                <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3">
                  <div className="relative aspect-square overflow-hidden border border-black/10 bg-[var(--color-brand-secondary,#f9f9f9)]">
                    {appliedCoupon.gift.imageUrl ? <img src={appliedCoupon.gift.imageUrl} alt={appliedCoupon.gift.name} className="absolute inset-0 h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 py-0.5">
                    <span className="font-[family-name:var(--font-family-secondary)] text-[9px] font-semibold uppercase tracking-[0.1em] text-black/50">Also yours with this order</span>
                    <h3 className="mt-1 font-[family-name:var(--font-family-primary)] text-[14px] font-semibold leading-5 text-black">{appliedCoupon.gift.name}</h3>
                    {appliedCoupon.gift.variantData?.label ? <p className="mt-0.5 font-[family-name:var(--font-family-secondary)] text-[10px] text-black/50">{String(appliedCoupon.gift.variantData.label)}</p> : null}
                    <div className="mt-1.5 flex items-center gap-2 font-[family-name:var(--font-family-secondary)] text-[11px]"><span className="text-black/40 line-through">{format(Number(appliedCoupon.gift.originalUnitPrice || 0))}</span><strong className="font-semibold uppercase text-black">Free</strong></div>
                  </div>
                </div>
                <div className="mt-3 flex min-h-11 w-full items-center justify-center border border-black bg-black px-4 font-[family-name:var(--font-family-button)] text-[11px] font-semibold text-white" role="status">My free gift is added</div>
              </section>
            ) : null}

            <h2 className="font-[family-name:var(--font-family-primary)] text-[24px] font-medium leading-none text-black">Order Summary</h2>
            <div className="mt-7 space-y-4 font-[family-name:var(--font-family-secondary)] text-[13px] text-black/70">
              <div className="flex items-center justify-between"><span>Items</span><span className="text-black">{totalItems}</span></div>
              <div className="flex items-center justify-between"><span>Products</span><span className="text-black">{resolvedItems.length}</span></div>
              <div className="flex items-center justify-between"><span>Shipping</span><span className="text-black">Complimentary</span></div>
            </div>

            <div className="mt-6 border-y border-black/15 py-5">
              <label htmlFor="cart-coupon" className="font-[family-name:var(--font-family-secondary)] text-[11px] font-medium text-black">Promo code</label>
              <div className="mt-2 flex h-11">
                <input id="cart-coupon" value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} disabled={Boolean(appliedCoupon)} placeholder="Enter code" className="min-w-0 flex-1 border border-r-0 border-black/25 bg-white px-3 font-[family-name:var(--font-family-secondary)] text-[12px] text-black outline-none placeholder:text-black/35 focus:border-black" />
                <button type="button" disabled={couponLoading} onClick={() => { if (appliedCoupon) { setAppliedCoupon(null); setCouponCode(''); setCouponMessage(''); localStorage.removeItem(APPLIED_COUPON_KEY) } else void applyCoupon() }} className="min-w-[84px] border border-black bg-white px-4 font-[family-name:var(--font-family-button)] text-[10px] font-semibold uppercase tracking-[0.08em] text-black transition hover:bg-black hover:text-white disabled:opacity-50">{appliedCoupon ? 'Remove' : couponLoading ? 'Checking' : 'Apply'}</button>
              </div>
              {couponMessage ? <p className="mt-2 font-[family-name:var(--font-family-secondary)] text-xs text-black/60">{couponMessage}</p> : null}
            </div>

            <div className="flex items-end justify-between gap-4 py-6">
              <div><span className="block font-[family-name:var(--font-family-primary)] text-[17px] font-semibold text-black">Estimated Total</span><span className="mt-1 block font-[family-name:var(--font-family-secondary)] text-[10px] text-black/45">Taxes calculated at checkout</span></div>
              <span className="font-[family-name:var(--font-family-secondary)] text-[20px] font-semibold text-black">{format(total)}</span>
            </div>

            <Link href="/checkout?mode=cart" className="flex min-h-12 w-full items-center justify-center border border-black bg-black px-6 font-[family-name:var(--font-family-button)] text-[12px] font-semibold uppercase tracking-[0.1em] text-white no-underline transition hover:bg-white hover:text-black">Continue to Checkout</Link>
            <p className="mt-4 text-center font-[family-name:var(--font-family-secondary)] text-[10px] leading-4 text-black/45">Complimentary insured shipping and signature packaging included.</p>
          </aside>
        </div>
      ) : (
        <section className="flex min-h-[440px] flex-col items-center justify-center border-b border-black/15 px-6 text-center">
          <h2 className="font-[family-name:var(--font-family-primary)] text-[24px] font-medium text-black">Your bag is empty</h2>
          <p className="mt-3 font-[family-name:var(--font-family-secondary)] text-[13px] text-black/55">Discover pieces made to become part of your story.</p>
          <Link href="/shop" className="mt-7 inline-flex min-h-12 items-center justify-center border border-black bg-black px-8 font-[family-name:var(--font-family-button)] text-[11px] font-semibold uppercase tracking-[0.1em] text-white no-underline transition hover:bg-white hover:text-black">Explore Products</Link>
        </section>
      )}
    </main>
  )
}
