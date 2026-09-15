'use client'

import { useEffect, useState } from 'react'

type Offer = {
  discountType: 'percentage' | 'fixed'
  discountValue: number
  description: string | null
  minimumOrderAmount: number | null
}

function formatAmount(offer: Offer) {
  if (offer.discountType === 'percentage') return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(offer.discountValue)}%`
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(offer.discountValue)
}

export default function SelectedCouponOffer() {
  const [offer, setOffer] = useState<Offer | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await fetch('/api/public/promotion-popup/offer', { cache: 'no-store' })
        const payload = await response.json().catch(() => null)
        if (active && response.ok) setOffer(payload?.offer ?? null)
      } catch { if (active) setOffer(null) }
    }
    void load()
    const refreshOnFocus = () => { void load() }
    const refreshOnVisibility = () => { if (document.visibilityState === 'visible') void load() }
    window.addEventListener('focus', refreshOnFocus)
    document.addEventListener('visibilitychange', refreshOnVisibility)
    return () => {
      active = false
      window.removeEventListener('focus', refreshOnFocus)
      document.removeEventListener('visibilitychange', refreshOnVisibility)
    }
  }, [])

  if (!offer) return null

  return (
    <section aria-labelledby="selected-coupon-offer-heading" className="w-full bg-[var(--color-brand-secondary)] px-[var(--space-4)] py-[var(--space-12)] text-center sm:px-[var(--space-6)] lg:py-[var(--space-12)]">
      <div className="mx-auto max-w-3xl">
        <p className="font-[family-name:var(--font-family-button)] text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-primary)]">Exclusive offer</p>
        <h2 id="selected-coupon-offer-heading" className="mt-[var(--space-4)] font-[family-name:var(--font-family-primary)] text-[clamp(2.4rem,4.4vw,4.4rem)] font-medium leading-[1.08] text-[var(--color-brand-primary)]">Get {formatAmount(offer)} Off</h2>
        <p className="mx-auto mt-[var(--space-4)] max-w-[48ch] font-[family-name:var(--font-family-secondary)] text-sm leading-7 text-[var(--color-brand-primary)] sm:text-base">{offer.description || 'Discover fine jewellery and enjoy an exclusive offer selected for you.'}</p>
        <button type="button" onClick={() => window.dispatchEvent(new Event('hod:open-coupon-offer'))} className="mt-[var(--space-6)] inline-flex min-h-12 items-center justify-center bg-[var(--color-brand-primary)] px-[var(--space-6)] font-[family-name:var(--font-family-button)] text-xs font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand-primary)]">Get Your Coupon Code</button>
        {offer.minimumOrderAmount != null && offer.minimumOrderAmount > 0 ? <p className="mt-[var(--space-4)] font-[family-name:var(--font-family-secondary)] text-xs text-[var(--color-brand-primary)]">Minimum purchase {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(offer.minimumOrderAmount)}</p> : null}
      </div>
    </section>
  )
}
