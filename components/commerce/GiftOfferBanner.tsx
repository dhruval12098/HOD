'use client'

import Link from 'next/link'
import { Check, Gift } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import type { StorefrontPromotion } from './PromotionBanner'

type GiftOfferBannerProps = {
  promotion: StorefrontPromotion
  amount: number
  checked?: boolean
  included?: boolean
  attempted?: boolean
  borderless?: boolean
  /** Renders the checkout status card without allowing a gift to be changed there. */
  displayOnly?: boolean
  confirmationTone?: 'green' | 'blue'
  onToggle?: () => void
}

export function GiftOfferBanner({ promotion, amount, checked = false, included = false, attempted = false, borderless = false, displayOnly = false, confirmationTone = 'green', onToggle }: GiftOfferBannerProps) {
  const { format } = useCurrency()
  const gift = promotion.gift
  const remaining = Math.max(0, promotion.minimumOrderAmount - amount)
  const unlocked = remaining === 0

  if (promotion.rewardType !== 'free_gift' || !gift) return null

  if (included && unlocked) {
    const blueConfirmation = confirmationTone === 'blue'
    return (
      <aside className={`${borderless ? '' : 'mt-4'} flex items-center gap-3 px-3 py-2.5 font-[family-name:var(--font-family-secondary)] ${blueConfirmation ? 'bg-[#eff8ff] text-[#175cd3]' : 'bg-[#f1faf3] text-[#114a29]'} ${borderless ? '' : blueConfirmation ? 'border border-[#b2ddff]' : 'border border-[#cde8d5]'}`} aria-label="Gift offer included">
        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white ${blueConfirmation ? 'bg-[#2e6bda]' : 'bg-[#16804b]'}`}><Check aria-hidden="true" className="h-3 w-3" strokeWidth={3} /></span>
        <span className="min-w-0 flex-1 text-[13px] font-medium">{gift.name} included</span>
        <Link href={`/shop/${gift.slug}`} className="shrink-0 text-[12px] text-[#315fd4] no-underline hover:underline">View gift ›</Link>
      </aside>
    )
  }

  return (
    <aside className={`${borderless ? '' : 'mt-4'} bg-[#fff7f8] p-3 font-[family-name:var(--font-family-secondary)] ${borderless ? '' : 'border border-[#df3350]'}`} aria-label="Gift offer">
      {unlocked || !displayOnly ? (
        <button type="button" onClick={onToggle} disabled={displayOnly} aria-disabled={displayOnly} className={`flex w-full items-center gap-2.5 border-0 bg-transparent p-0 text-left text-[#cf2943] ${displayOnly ? 'cursor-default' : ''}`}>
          {unlocked ? <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] border-2 ${checked ? 'gift-check-pop border-[#cf2943] bg-[#cf2943] text-white' : 'border-[#cf2943] bg-white text-transparent'}`}><Check className="h-3 w-3" strokeWidth={3} /></span> : null}
          <span className="text-[14px] font-medium leading-5 sm:text-[16px]">Apply {promotion.title || promotion.bannerTitle || 'this offer'}</span>
        </button>
      ) : (
        <p className="text-[14px] font-medium leading-5 text-[#cf2943] sm:text-[16px]">Apply {promotion.title || promotion.bannerTitle || 'this offer'}</p>
      )}
      <div className="mt-3 grid w-full grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-2.5 text-left">
        {gift.imageUrl ? <img src={gift.imageUrl} alt="" className="h-[46px] w-[46px] rounded-full border border-[#f0dfe2] bg-white object-cover" /> : <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#f0dfe2] bg-white"><Gift aria-hidden="true" className="h-4 w-4 text-[#cf2943]" /></span>}
        <span className="min-w-0"><span className="block font-[family-name:var(--font-family-inter)] text-[14px] font-semibold leading-5 text-[#2b3444] sm:text-[16px]">{gift.name}</span><span className="block text-[12px] leading-4 text-[#737987]">On orders {format(promotion.minimumOrderAmount)}+</span></span>
        <span className="text-right text-[13px] font-medium text-[#cf2943]">{promotion.discountValue > 0 ? <><s className="mr-1 text-[#2b3444]">{format(promotion.discountValue)}</s>FREE</> : 'FREE'}</span>
      </div>
      {!unlocked && attempted ? <p role="status" className="mt-3 border-t border-[#f0dfe2] pt-2.5 text-[12px] font-medium text-[#cf2943]">Add {format(remaining)} more to claim this offer.</p> : null}
    </aside>
  )
}
