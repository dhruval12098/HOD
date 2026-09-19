'use client'

import Link from 'next/link'
import { useCurrency } from '@/context/CurrencyContext'

export type StorefrontPromotion = {
  id: number; code: string; title?: string | null; rewardType: 'percentage' | 'fixed' | 'free_gift'; discountValue: number
  minimumOrderAmount: number; bannerTitle?: string | null; bannerDescription?: string | null; bannerImageUrl?: string
  gift?: { name: string; slug: string; sku?: string | null; imageUrl?: string; variantLabel?: string } | null; endsAt?: string | null
}

export function PromotionBanner({ promotion, subtotal, applied, mode = 'checkout' }: { promotion: StorefrontPromotion; subtotal: number; applied: boolean; mode?: 'cart' | 'checkout' }) {
  const { format } = useCurrency()
  const remaining = Math.max(0, promotion.minimumOrderAmount - subtotal)
  const image = promotion.bannerImageUrl || promotion.gift?.imageUrl || ''
  const dynamic = mode === 'checkout'
  const cartMode = mode === 'cart'
  const status = applied
    ? promotion.rewardType === 'free_gift' ? 'Gift added' : `${promotion.code} applied`
    : remaining > 0 ? `Add ${format(remaining)} more to unlock` : `Unlocked — apply ${promotion.code}`

  return (
    <aside className={cartMode ? "border border-black/15 bg-white p-4 font-[family-name:var(--font-family-secondary)] text-black" : "rounded-[18px] border border-[#436762] bg-[#244b48] p-4 font-[var(--font-manrope)] text-[#f2f7f5] shadow-[0_12px_30px_rgba(20,53,50,.13)]"} aria-label="Current promotion">
      <div className="flex items-center gap-4">
        {image ? <div className={`h-20 w-20 shrink-0 overflow-hidden border ${cartMode ? 'border-black/10 bg-[var(--color-brand-secondary,#f9f9f9)]' : 'rounded-[12px] border-white/15 bg-[#eef2ec]'}`}><img src={image} alt={promotion.gift?.name || promotion.title || 'Offer gift'} className="h-full w-full object-cover" /></div> : null}
        <div className={cartMode ? "min-w-0 flex-1 font-[family-name:var(--font-family-secondary)]" : "min-w-0 flex-1 font-[var(--font-manrope)]"}>
          <div className="flex flex-wrap items-center gap-2"><span className={cartMode ? "text-[9px] font-semibold uppercase tracking-[0.12em] text-black/50" : "text-[9px] font-semibold uppercase tracking-[0.18em] text-[#b9d2cc]"}>Current offer</span><span className={cartMode ? "border border-black/15 px-2 py-1 text-[9px] font-semibold tracking-[0.1em] text-black" : "rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[9px] font-bold tracking-[0.16em] text-[#f5f8f7]"}>{promotion.code}</span></div>
          <h2 className={cartMode ? "promotion-banner-title mt-1.5 font-[family-name:var(--font-family-primary)] text-[15px] font-semibold leading-5 text-black" : "promotion-banner-title mt-1.5 text-[15px] font-semibold leading-5 text-white"}>{promotion.bannerTitle || promotion.title || (promotion.rewardType === 'free_gift' ? 'Complimentary gift' : 'Exclusive offer')}</h2>
          {promotion.bannerDescription ? <p className={cartMode ? "mt-1 text-[12px] leading-5 text-black/60" : "mt-1 text-[12px] leading-5 text-[#d1dfdc]"}>{promotion.bannerDescription}</p> : null}
          {dynamic ? <p className={`mt-2 text-[12px] font-semibold ${applied ? 'text-[#bfe7cf]' : 'text-[#d8e6e2]'}`}>{status}</p> : null}
          {promotion.gift?.slug ? <Link href={`/shop/${promotion.gift.slug}`} className={cartMode ? "mt-2 inline-flex text-[10px] font-semibold text-black/60 underline underline-offset-4 hover:text-black" : "mt-2 inline-flex text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c8ddd8] underline underline-offset-4"}>View gift</Link> : null}
        </div>
      </div>
    </aside>
  )
}
