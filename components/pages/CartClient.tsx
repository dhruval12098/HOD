'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { Minus, Plus } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { useCurrency } from '@/context/CurrencyContext'
import { getProductKey, type CartItemSelection, type CartProductSnapshot } from '@/lib/product-keys'
import type { StorefrontPromotion } from '@/components/commerce/PromotionBanner'
import { GiftOfferBanner } from '@/components/commerce/GiftOfferBanner'
import CheckoutSummary from '@/components/checkout/CheckoutSummary'

const APPLIED_COUPON_KEY = 'hod_applied_coupon'

type SearchProduct = CartProductSnapshot & { mainCategorySlug?: string; mainCategoryName?: string }

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

export default function CartClient({ summaryInfo }: { summaryInfo?: ReactNode }) {
  const { items, addItem, updateQuantity, removeItem, clearCart, isHydrated } = useCart()
  const { format } = useCurrency()
  const [products, setProducts] = useState<SearchProduct[]>([])
  const [recommendations, setRecommendations] = useState<SearchProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [promotions, setPromotions] = useState<StorefrontPromotion[]>([])
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [couponMessage, setCouponMessage] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [requestedGiftPromotionId, setRequestedGiftPromotionId] = useState<number | null>(null)
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
    if (!isHydrated) return
    let ignore = false
    void fetch('/api/public/products/recommendations', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        slugs: items.map((item) => item.productSlug).filter(Boolean),
        ids: items.map((item) => item.productKey).filter(Boolean),
      }),
    })
      .then((response) => response.json())
      .then((payload) => {
        if (ignore || !Array.isArray(payload?.items)) return
        setRecommendations((payload.items as SearchProduct[]).slice(0, 4))
      })
      .catch(() => {})
    return () => { ignore = true }
  }, [isHydrated, items])

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

  const applyCoupon = async (requestedCode?: string) => {
    const code = (requestedCode || couponCode).trim().toUpperCase()
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
    <main className="min-h-screen bg-white px-5 pb-20 pt-10 text-[var(--color-brand-primary,#000000)] sm:px-8 sm:pt-14 lg:px-[10vw] 2xl:px-[200px]">
      <header className="relative flex justify-center pb-6 text-center">
        <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
          <h1 className="font-[family-name:var(--font-family-primary)] text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-none">My Bag</h1>
          <span className="font-[family-name:var(--font-family-secondary)] text-[14px] text-black/55">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
        </div>
        {resolvedItems.length ? <button type="button" onClick={clearCart} className="absolute right-0 top-1 border-0 bg-transparent font-[family-name:var(--font-family-secondary)] text-[11px] text-black/55 underline underline-offset-4 transition hover:text-black">Clear bag</button> : null}
      </header>

      {!isHydrated ? (
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]"><div className="space-y-0 divide-y divide-black/10 border-y border-black/10"><div className="h-48 animate-pulse bg-[var(--color-brand-secondary,#f9f9f9)]"/><div className="h-48 animate-pulse bg-[var(--color-brand-secondary,#f9f9f9)]"/></div><div className="h-80 animate-pulse bg-[var(--color-brand-secondary,#f9f9f9)]"/></div>
      ) : resolvedItems.length || (isLoading && items.length) ? (
        <>
        <div className="grid items-start gap-8 pt-12 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-12 xl:grid-cols-[minmax(0,1fr)_450px]">
          <section aria-label="Bag items" className="min-w-0">
            <div className="rounded-md border border-black/10 bg-white p-3 sm:p-4">
              <div>
              {resolvedItems.map(({ item, product }) => {
                const unitPrice = Number(item.selection.resolvedPrice ?? product.priceFrom ?? 0)
                const details = selectedDetails(item.selection)
                const imageUrl = item.selection.resolvedImageUrl || product.imageUrl
                const quantityControl = (
                  <div className="grid h-9 grid-cols-[34px_38px_34px] border border-black/25" aria-label={`Quantity for ${product.name}`}>
                    <button type="button" onClick={() => updateQuantity(item.key, item.quantity - 1)} aria-label="Decrease quantity" className="flex items-center justify-center border-0 bg-white text-black transition hover:bg-black hover:text-white"><Minus size={13} strokeWidth={1.5}/></button>
                    <span className="flex items-center justify-center border-x border-black/15 font-[family-name:var(--font-family-secondary)] text-[12px]">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.key, item.quantity + 1)} aria-label="Increase quantity" className="flex items-center justify-center border-0 bg-white text-black transition hover:bg-black hover:text-white"><Plus size={13} strokeWidth={1.5}/></button>
                  </div>
                )
                return (
                  <article key={item.key} className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 bg-white px-4 py-6 first:rounded-t-sm sm:grid-cols-[124px_minmax(0,1fr)_auto] sm:gap-6 lg:grid-cols-[142px_minmax(0,1fr)_auto] lg:py-7">
                    <Link href={`/shop/${product.slug}`} className="row-span-2 sm:row-span-1 relative block aspect-[4/5] w-[96px] overflow-hidden rounded-sm border border-black/10 bg-[var(--color-brand-secondary,#f9f9f9)] sm:w-full">
                      {imageUrl ? <img src={imageUrl} alt={product.name} className="absolute inset-0 h-full w-full object-cover" /> : null}
                    </Link>

                    <div className="flex min-w-0 flex-col">
                      <Link href={`/shop/${product.slug}`} className="font-[family-name:var(--font-family-primary)] text-[16px] font-semibold leading-[1.4] text-black no-underline sm:text-[18px]">{product.name}</Link>
                      {details ? <p className="mt-2 font-[family-name:var(--font-family-secondary)] text-[13px] leading-5 text-black/75">{details}</p> : null}
                      <p className="mt-1 font-[family-name:var(--font-family-secondary)] text-[12px] leading-5 text-black/70">{item.selection.loveLetter?.wantsLetter ? `Love letter included${item.selection.loveLetter.recipientName ? ` for ${item.selection.loveLetter.recipientName}` : ''}` : 'No love letter'}</p>

                      <div className="mt-auto flex flex-wrap items-end gap-x-6 gap-y-3 pt-5">
                        <Link href={`/shop/${product.slug}`} className="mb-2 font-[family-name:var(--font-family-secondary)] text-[12px] text-black/70 underline underline-offset-4 transition hover:text-black">Edit</Link>
                        <button type="button" onClick={() => removeItem(item.key)} className="mb-2 border-0 bg-transparent p-0 font-[family-name:var(--font-family-secondary)] text-[12px] text-black/70 underline underline-offset-4 transition hover:text-black">Remove</button>
                      </div>
                    </div>

                    <div className="col-start-2 row-start-2 mt-4 flex items-end justify-between gap-4 sm:col-auto sm:row-auto sm:mt-0 sm:flex sm:min-w-[110px] sm:flex-col sm:items-end sm:text-right">
                      <div>
                        <span className="font-[family-name:var(--font-family-secondary)] text-[13px] font-semibold text-black sm:text-[14px]">{format(unitPrice * item.quantity)}</span>
                        {item.quantity > 1 ? <span className="mt-1 block font-[family-name:var(--font-family-secondary)] text-[12px] text-black/70">{format(unitPrice)} each</span> : null}
                      </div>
                      <div className="sm:mt-auto">{quantityControl}</div>
                    </div>
                  </article>
                )
              })}

              {isLoading && items.filter((item) => !item.snapshot).map((item) => <div key={`legacy-${item.key}`} className="grid grid-cols-[124px_1fr] gap-5 py-6" aria-label="Refreshing saved cart item"><div className="aspect-[4/5] animate-pulse bg-[var(--color-brand-secondary,#f9f9f9)]"/><div className="space-y-3 py-2"><div className="h-3 w-24 animate-pulse bg-black/5"/><div className="h-5 w-1/2 animate-pulse bg-black/5"/><div className="h-4 w-28 animate-pulse bg-black/5"/></div></div>)}
              {appliedCoupon?.rewardType === 'free_gift' && appliedCoupon.gift && total >= Number(appliedCoupon.minimumOrderAmount ?? 0) ? <article className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-b-sm bg-white px-4 py-6 sm:grid-cols-[124px_minmax(0,1fr)_auto] sm:gap-6 lg:grid-cols-[142px_minmax(0,1fr)_auto] lg:py-7">
                <div className="row-span-2 sm:row-span-1 relative aspect-[4/5] w-[96px] overflow-hidden rounded-sm border border-black/10 bg-white sm:w-full">{appliedCoupon.gift.imageUrl ? <img src={appliedCoupon.gift.imageUrl} alt={appliedCoupon.gift.name} className="h-full w-full object-cover" /> : null}</div>
                <div><span className="inline-flex border border-[#b7ddc5] bg-[#eaf7ee] px-2 py-1 font-[family-name:var(--font-family-secondary)] text-[10px] font-medium uppercase tracking-[0.08em] text-[#16804b]">Gift</span><p className="mt-2 font-[family-name:var(--font-family-primary)] text-[16px] font-semibold leading-[1.4] text-black sm:text-[18px]">{appliedCoupon.gift.name}</p><p className="mt-1 font-[family-name:var(--font-family-secondary)] text-[12px] text-black/70">Gift with your order</p></div>
                <span className="flex items-center gap-2 sm:order-2 sm:justify-self-end font-[family-name:var(--font-family-secondary)] text-[13px] font-semibold text-black sm:text-[14px]"><span>{format(0)}</span>{Number(appliedCoupon.gift.originalUnitPrice ?? 0) > 0 ? <span className="text-black/55 line-through">{format(Number(appliedCoupon.gift.originalUnitPrice))}</span> : null}</span>
              </article> : null}
              </div>
              {recommendations[0] ? <article className="mt-4 grid grid-cols-[120px_minmax(0,1fr)] w-full gap-4 rounded-xl border border-black/10 bg-[#f8f8fa] p-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6 sm:p-6"><Link href={`/shop/${recommendations[0].slug}`} className="row-span-2 sm:row-span-1 aspect-square overflow-hidden rounded-lg border border-black/10 bg-white p-2 sm:p-3">{recommendations[0].imageUrl ? <img src={recommendations[0].imageUrl} alt={recommendations[0].name} className="h-full w-full object-contain" /> : null}</Link><div className="flex min-w-0 flex-col justify-center py-1"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-[family-name:var(--font-family-inter)] text-[12px] text-black/60 sm:text-[14px]">{recommendations[0].mainCategoryName || recommendations[0].shortMeta}</p><Link href={`/shop/${recommendations[0].slug}`} className="mt-1 block max-w-2xl font-[family-name:var(--font-family-inter)] text-[16px] font-semibold leading-6 text-black no-underline sm:text-[21px] sm:leading-7">{recommendations[0].name}</Link></div><p className="shrink-0 pt-1 font-[family-name:var(--font-family-inter)] text-[13px] font-semibold text-black sm:text-[16px]">{format(recommendations[0].priceFrom)}</p></div><button type="button" onClick={() => addItem(recommendations[0], {})} className="mt-4 min-h-10 w-full max-w-[180px] self-start border border-black bg-black px-4 font-[family-name:var(--font-family-button)] text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white hover:text-black sm:mt-5 sm:min-h-12 sm:px-6 sm:text-[12px]">Add to cart</button></div></article> : null}
            </div>
          </section>

          <aside className="h-fit lg:sticky lg:top-28">
            {featuredPromotion?.rewardType === 'free_gift' && featuredPromotion.gift ? <GiftOfferBanner promotion={featuredPromotion} amount={total} checked={requestedGiftPromotionId === featuredPromotion.id || (appliedCoupon?.rewardType === 'free_gift' && appliedCoupon.code === featuredPromotion.code)} included={appliedCoupon?.rewardType === 'free_gift' && appliedCoupon.code === featuredPromotion.code} borderless onToggle={() => { setRequestedGiftPromotionId(featuredPromotion.id); if (total >= featuredPromotion.minimumOrderAmount) { setCouponCode(featuredPromotion.code); void applyCoupon(featuredPromotion.code) } }} /> : null}
            <CheckoutSummary
              summary={{
                items: resolvedItems.map(({ item, product }) => ({
                  name: product.name,
                  slug: product.slug,
                  imageUrl: item.selection.resolvedImageUrl || product.imageUrl,
                  priceFrom: Number(item.selection.resolvedPrice ?? product.priceFrom ?? 0),
                  quantity: item.quantity,
                  metal: item.selection.metal,
                  purity: item.selection.purity,
                  sizeOrFit: item.selection.sizeOrFit || item.selection.ringSize,
                  gemstone: item.selection.gemstone,
                  carat: item.selection.hiphopCarat,
                })),
                couponCode: appliedCoupon?.code,
                couponDiscount: Number(appliedCoupon?.discountAmount ?? 0),
                gift: appliedCoupon?.rewardType === 'free_gift' && appliedCoupon.gift && total >= Number(appliedCoupon.minimumOrderAmount ?? 0) ? {
                  name: appliedCoupon.gift.name,
                  slug: '',
                  imageUrl: appliedCoupon.gift.imageUrl,
                  originalUnitPrice: Number(appliedCoupon.gift.originalUnitPrice ?? 0),
                } : null,
              }}
              shippingLabel="Free"
              couponValue={couponCode}
              onCouponChange={setCouponCode}
              onCouponAction={() => { if (appliedCoupon) { setAppliedCoupon(null); setCouponCode(''); setCouponMessage(''); localStorage.removeItem(APPLIED_COUPON_KEY) } else void applyCoupon() }}
              couponApplied={Boolean(appliedCoupon)}
              couponLoading={couponLoading}
              couponMessage={couponMessage}
              belowSummary={<>
                <Link href="/checkout?mode=cart" className="mt-5 flex min-h-12 w-full items-center justify-center border border-black bg-black px-6 font-[family-name:var(--font-family-button)] text-[12px] font-semibold uppercase tracking-[0.1em] text-white no-underline transition hover:bg-white hover:text-black">Checkout</Link>
              </>}
            />
            {summaryInfo}
          </aside>
        </div>
        </>
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
