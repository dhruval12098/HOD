'use client'

import Link from 'next/link'
import { useCurrency } from '@/context/CurrencyContext'
import type { StorefrontPromotion } from '@/components/commerce/PromotionBanner'

export default function FreeGiftOfferBanner({ promotion }: { promotion: StorefrontPromotion | null }) {
  const { format } = useCurrency()
  if (!promotion?.gift) return null

  return (
    <section aria-label="Complimentary gift offer" className="bg-[#174946] px-5 py-7 text-white sm:px-8 sm:py-8 lg:px-[52px]">
      <div className="relative mx-auto max-w-[1200px]">
        <Link href={`/shop/${promotion.gift.slug}`} className="absolute right-0 top-0 border-b border-white/65 pb-0.5 font-[family-name:var(--font-family-secondary)] text-[10px] font-medium uppercase tracking-[0.12em] text-white no-underline hover:border-white sm:text-[11px]">View gift</Link>
        <div className="flex min-h-[104px] flex-col items-center justify-center gap-4 pr-16 text-center sm:flex-row sm:gap-7 sm:pr-24">
          {promotion.gift.imageUrl ? <div className="h-[88px] w-[88px] shrink-0 overflow-hidden bg-white sm:h-[104px] sm:w-[104px]"><img src={promotion.gift.imageUrl} alt={promotion.gift.name} className="h-full w-full object-cover" /></div> : null}
          <div className="text-left">
            <p className="font-[family-name:var(--font-family-secondary)] text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">{promotion.title || 'Limited-time offer'}</p>
            <h2 className="mt-2 font-[family-name:var(--font-family-inter)] text-[17px] font-semibold leading-6 sm:text-[20px]">Receive {promotion.gift.name} <span className="font-[family-name:var(--font-family-secondary)] text-[13px] font-normal text-white/85 sm:text-[14px]">with purchase over {format(promotion.minimumOrderAmount)}.</span></h2>
            <p className="mt-2 font-[family-name:var(--font-family-secondary)] text-[13px] font-medium leading-5 text-white">Use coupon code <span className="font-semibold tracking-[0.08em]">{promotion.code}</span> to avail.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
