'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { StorefrontPromotion } from '@/components/commerce/PromotionBanner'
import { useCart } from '@/lib/hooks/useCart'

const APPLIED_COUPON_KEY = 'hod_applied_coupon'
const COUPON_STATE_EVENT = 'hod:coupon-state'

type AppliedGiftCoupon = {
  code?: string
  rewardType?: string
  minimumOrderAmount?: number
}

function readAppliedGiftCoupon() {
  try {
    const value = localStorage.getItem(APPLIED_COUPON_KEY)
    const parsed = value ? JSON.parse(value) : null
    return parsed && parsed.rewardType === 'free_gift' ? parsed as AppliedGiftCoupon : null
  } catch {
    return null
  }
}

/** Keeps gift messaging consistent with the coupon validation that governs checkout. */
export function useGiftPromotionStatus(promotion: StorefrontPromotion | null) {
  const { items, isHydrated } = useCart()
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedGiftCoupon | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const validatingRef = useRef(false)

  const cartSubtotal = useMemo(
    () => items.reduce((total, item) => total + Number(item.selection.resolvedPrice ?? item.snapshot?.priceFrom ?? 0) * item.quantity, 0),
    [items],
  )
  const checkoutItems = useMemo(
    () => items.flatMap((item) => {
      const product = item.snapshot
      if (!product?.slug) return []
      return [{
        slug: product.slug,
        name: product.name,
        metalVariantId: item.selection.metalVariantId,
        metal: item.selection.metal,
        purity: item.selection.purity,
        quantity: item.quantity,
      }]
    }),
    [items],
  )

  useEffect(() => {
    if (!isHydrated) return
    const refresh = () => setAppliedCoupon(readAppliedGiftCoupon())
    refresh()
    window.addEventListener(COUPON_STATE_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(COUPON_STATE_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [isHydrated])

  const isValidated = Boolean(
    promotion &&
    appliedCoupon?.code?.toUpperCase() === promotion.code.toUpperCase() &&
    cartSubtotal >= promotion.minimumOrderAmount,
  )

  const validate = useCallback(async () => {
    if (!promotion || promotion.rewardType !== 'free_gift' || !checkoutItems.length || validatingRef.current) return false
    validatingRef.current = true
    setIsValidating(true)
    try {
      const response = await fetch('/api/checkout/coupon', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: promotion.code, items: checkoutItems }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || payload?.coupon?.rewardType !== 'free_gift') return false
      localStorage.setItem(APPLIED_COUPON_KEY, JSON.stringify(payload.coupon))
      setAppliedCoupon(payload.coupon)
      window.dispatchEvent(new Event(COUPON_STATE_EVENT))
      return true
    } finally {
      validatingRef.current = false
      setIsValidating(false)
    }
  }, [checkoutItems, promotion])

  return { cartSubtotal, isValidated, isValidating, validate }
}
