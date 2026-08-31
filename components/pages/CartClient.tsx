'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/hooks/useCart'
import { useCurrency } from '@/context/CurrencyContext'
import { getProductKey, type CartProductSnapshot } from '@/lib/product-keys'
import { PromotionBanner, type StorefrontPromotion } from '@/components/commerce/PromotionBanner'

const APPLIED_COUPON_KEY = 'hod_applied_coupon'

type SearchProduct = CartProductSnapshot

export default function CartClient() {
  const { items, updateQuantity, removeItem, clearCart, isHydrated } = useCart()
  const { format } = useCurrency()
  const [products, setProducts] = useState<SearchProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [promotions, setPromotions] = useState<StorefrontPromotion[]>([])
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
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
    return () => {
      ignore = true
    }
  }, [isHydrated, legacyLookupKey])

  useEffect(() => {
    void fetch('/api/public/promotions', { cache: 'no-store' }).then((response) => response.json()).then((payload) => setPromotions(Array.isArray(payload?.items) ? payload.items : [])).catch(() => {})
    try { const stored = localStorage.getItem(APPLIED_COUPON_KEY); if (stored) { const parsed = JSON.parse(stored); setAppliedCoupon(parsed); setCouponCode(parsed.code || '') } } catch {}
  }, [])

  const resolvedItems = useMemo(
    () =>
      items
        .map((item) => ({
          item,
          product: item.snapshot || products.find((product) => getProductKey(product) === item.productKey || product.slug === item.productSlug),
        }))
        .filter((entry): entry is { item: typeof items[number]; product: SearchProduct } => Boolean(entry.product)),
    [items, products]
  )

  const total = resolvedItems.reduce(
    (sum, entry) => sum + ((entry.item.selection.resolvedPrice ?? entry.product?.priceFrom ?? 0) * entry.item.quantity),
    0
  )
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
      {!isHydrated ? <div className="mt-10 space-y-3" aria-label="Loading cart"><div className="h-36 animate-pulse rounded-[24px] bg-[#f3f0e9]"/><div className="h-36 animate-pulse rounded-[24px] bg-[#f3f0e9]"/></div> : resolvedItems.length || (isLoading && items.length) ? (
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
                      <span className="mt-1 block text-[18px] font-medium text-[#0A1628]">{format(item.selection.resolvedPrice ?? product?.priceFrom ?? 0)}</span>
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
            {isLoading && items.filter((item) => !item.snapshot).map((item) => <div key={`legacy-${item.key}`} className="flex gap-4 rounded-[24px] border border-[rgba(10,22,40,0.08)] bg-white p-4" aria-label="Refreshing saved cart item"><div className="h-28 w-28 animate-pulse rounded-[18px] bg-[#f3f0e9]"/><div className="flex-1 space-y-3 py-2"><div className="h-3 w-24 animate-pulse rounded bg-[#eeeae1]"/><div className="h-5 w-1/2 animate-pulse rounded bg-[#eeeae1]"/><div className="h-4 w-28 animate-pulse rounded bg-[#eeeae1]"/></div></div>)}
            {appliedCoupon?.rewardType === 'free_gift' && appliedCoupon.gift && total >= Number(appliedCoupon.minimumOrderAmount ?? 0) ? <article className="flex gap-4 rounded-[20px] border border-[#cfded4] bg-[#f3f8f4] p-4"><div className="h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-white">{appliedCoupon.gift.imageUrl ? <img src={appliedCoupon.gift.imageUrl} alt={appliedCoupon.gift.name} className="h-full w-full object-cover"/> : null}</div><div className="min-w-0 flex-1"><span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#47705a]">Free gift</span><h2 className="mt-1 font-sans text-[15px] font-semibold text-[#183527]">{appliedCoupon.gift.name}</h2>{appliedCoupon.gift.variantData?.label ? <p className="mt-1 text-xs text-[#64766b]">{String(appliedCoupon.gift.variantData.label)}</p> : null}<div className="mt-3 flex flex-wrap items-center gap-3 text-xs"><span className="text-[#64766b]">Quantity 1</span><span className="text-[#8b958e] line-through">{format(Number(appliedCoupon.gift.originalUnitPrice || 0))}</span><strong className="text-[#24533a]">Free / {format(0)}</strong></div></div></article> : null}
            {featuredPromotion ? <PromotionBanner promotion={featuredPromotion} subtotal={total} applied={appliedCoupon?.id === featuredPromotion.id} mode="cart" /> : null}
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
              <span>{format(total)}</span>
            </div>
            <div className="mt-5 border-t border-[rgba(10,22,40,0.08)] pt-5"><div className="text-[10px] uppercase tracking-[0.2em] text-[#7F8898]">Coupon code</div><div className="mt-2 flex gap-2"><input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} disabled={Boolean(appliedCoupon)} placeholder="FREE100" className="min-w-0 flex-1 rounded-full border border-[rgba(10,22,40,0.14)] px-3 py-2 text-sm outline-none" /><button type="button" disabled={couponLoading} onClick={() => { if (appliedCoupon) { setAppliedCoupon(null); setCouponCode(''); setCouponMessage(''); localStorage.removeItem(APPLIED_COUPON_KEY) } else void applyCoupon() }} className="rounded-full bg-[#0A1628] px-4 text-[10px] uppercase tracking-[0.16em] text-white">{appliedCoupon ? 'Remove' : couponLoading ? '...' : 'Apply'}</button></div>{couponMessage ? <p className={`mt-2 text-xs ${appliedCoupon ? 'text-emerald-700' : 'text-amber-700'}`}>{couponMessage}</p> : null}</div>
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
