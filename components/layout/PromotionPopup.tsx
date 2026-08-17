'use client'

import { type FormEvent, useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'

type PromotionPopupData = {
  label: string
  title: string
  description: string
  cta_text: string
  cta_link: string
  cta_action?: 'redirect' | 'reveal_coupon'
  selected_coupon_id?: number | null
  image_path?: string
  mobile_image_path?: string
  image_alt?: string
  image_only_mode?: boolean
  is_active: boolean
  show_once_per_session: boolean
  updated_at?: string
}

const SESSION_KEY = 'hod_promotion_popup_shown_v3'
const SUPABASE_PUBLIC_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_COLLECTION_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET || 'hod'

function buildVersionToken(item: PromotionPopupData) {
  return (
    item.updated_at ||
    [
      item.label,
      item.title,
      item.description,
      item.cta_text,
      item.cta_link,
      item.cta_action,
      item.selected_coupon_id,
      item.image_path,
      item.mobile_image_path,
      item.image_alt,
      item.image_only_mode ? '1' : '0',
      item.is_active ? '1' : '0',
    ].join('|')
  )
}

function toPublicUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (!SUPABASE_PUBLIC_BASE) return path
  return `${SUPABASE_PUBLIC_BASE}/storage/v1/object/public/${SUPABASE_COLLECTION_BUCKET}/${path}`
}

function appendCacheBuster(src: string, versionToken: string) {
  if (!src) return ''
  const separator = src.includes('?') ? '&' : '?'
  return `${src}${separator}v=${encodeURIComponent(versionToken)}`
}

export default function PromotionPopup() {
  const [item, setItem] = useState<PromotionPopupData | null>(null)
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [revealedCoupon, setRevealedCoupon] = useState<{ code: string; title?: string | null } | null>(null)
  const [redirectUrl, setRedirectUrl] = useState('')
  const [couponCopied, setCouponCopied] = useState(false)

  useEffect(() => {
    let ignore = false

    const load = async () => {
      try {
        const response = await fetch('/api/public/promotion-popup', { cache: 'no-store' })
        const payload = await response.json().catch(() => null)
        if (!response.ok || ignore) return

        const nextItem = payload?.item as PromotionPopupData | null
        if (!nextItem?.is_active) return

        const alreadyShown = typeof window !== 'undefined' && window.sessionStorage.getItem(SESSION_KEY) === '1'
        if (nextItem.show_once_per_session && alreadyShown) return

        if (nextItem.show_once_per_session && typeof window !== 'undefined') {
          window.sessionStorage.setItem(SESSION_KEY, '1')
        }

        setItem(nextItem)
        setVisible(true)
      } catch {}
    }

    void load()
    return () => {
      ignore = true
    }
  }, [])

  const close = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(SESSION_KEY, '1')
      document.body.style.overflow = ''
    }
    setVisible(false)
  }

  useEffect(() => {
    if (!visible) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [visible])

  if (!item || !visible) return null

  const versionToken = buildVersionToken(item)
  const imageSrc = appendCacheBuster(toPublicUrl(item.image_path || ''), versionToken)
  const mobileImageSrc = appendCacheBuster(toPublicUrl(item.mobile_image_path || item.image_path || ''), versionToken)
  const useTextOnlyLayout = Boolean(item.image_only_mode)
  const submitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const response = await fetch('/api/public/promotion-popup/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const payload = await response.json().catch(() => null) as { error?: string; action?: string; redirectUrl?: string; coupon?: { code: string; title?: string | null } } | null
      if (!response.ok) throw new Error(payload?.error || 'Unable to submit your email.')
      if (payload?.action === 'reveal_coupon' && payload.coupon?.code) {
        setRevealedCoupon(payload.coupon)
        return
      }
      if (payload?.redirectUrl) setRedirectUrl(payload.redirectUrl)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit your email.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const emailAction = revealedCoupon ? (
    <div className="mt-6 rounded-[10px] border border-[rgba(10,22,40,0.14)] bg-white px-4 py-4 text-center" aria-live="polite">
      <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[rgba(10,22,40,0.48)]">Your coupon code</p>
      {revealedCoupon.title ? <p className="mt-2 text-[12px] text-[rgba(10,22,40,0.62)]">{revealedCoupon.title}</p> : null}
      <div className="mt-3 flex items-stretch gap-2">
        <strong className="flex min-h-[44px] flex-1 items-center justify-center border border-dashed border-[rgba(10,22,40,0.28)] bg-[#f7f3eb] px-3 text-[15px] tracking-[0.12em] text-[var(--theme-ink)]">{revealedCoupon.code}</strong>
        <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(revealedCoupon.code); setCouponCopied(true); window.setTimeout(() => setCouponCopied(false), 2500) } catch { setCouponCopied(false) } }} className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center bg-[var(--theme-ink)] px-3 text-white transition hover:bg-[#182a45]" aria-label="Copy coupon code" title="Copy coupon code">{couponCopied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}</button>
      </div>
      <p className={`mt-2 min-h-4 text-[10px] font-medium transition-opacity ${couponCopied ? 'text-[#35634a] opacity-100' : 'opacity-0'}`} aria-live="polite">Copied to clipboard</p>
    </div>
  ) : redirectUrl ? (
    <div className="mt-6" aria-live="polite">
      <p className="mb-3 text-[11px] leading-5 text-[rgba(10,22,40,0.58)]">Thank you. Your offer is ready.</p>
      <a href={redirectUrl} onClick={close} className="inline-flex min-h-[46px] w-full items-center justify-center bg-[var(--theme-ink)] px-5 text-[10px] font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#182a45] sm:min-h-[48px] sm:text-[11px]">{item.cta_text || 'Continue'}</a>
    </div>
  ) : (
    <form onSubmit={submitEmail} className="mt-6" noValidate>
      <label htmlFor="promotion-email" className="sr-only">Email address</label>
      <input id="promotion-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" className="h-[46px] w-full border border-[rgba(10,22,40,0.18)] bg-white px-4 text-[12px] text-[var(--theme-ink)] outline-none placeholder:text-[rgba(10,22,40,0.4)] focus:border-[var(--theme-ink)] sm:h-[48px]" />
      <button type="submit" disabled={isSubmitting} className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center border border-[var(--theme-ink)] bg-white px-5 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--theme-ink)] transition hover:bg-[#f4f1e9] disabled:cursor-wait disabled:opacity-65 sm:min-h-[46px]">{isSubmitting ? 'Submitting…' : 'Submit'}</button>
      {submitError ? <p className="mt-2 text-[11px] leading-4 text-[#9f2f2f]" role="alert">{submitError}</p> : null}
    </form>
  )

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[rgba(10,22,40,0.48)] p-3 backdrop-blur-[6px] sm:p-5">
      <div className="relative max-h-[calc(100vh-24px)] w-full max-w-[calc(100vw-24px)] overflow-hidden rounded-[18px] border border-[rgba(10,22,40,0.1)] bg-[#f7f3eb] shadow-[0_28px_80px_rgba(10,22,40,0.24)] sm:max-h-[calc(100vh-40px)] sm:max-w-[760px] sm:rounded-[12px]">
        <button
          type="button"
          onClick={close}
          aria-label="Close promotion popup"
          className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(10,22,40,0.14)] bg-[rgba(255,255,255,0.92)] text-[var(--theme-ink)] shadow-[0_8px_22px_rgba(10,22,40,0.14)] transition hover:bg-white hover:scale-[1.04] sm:right-4 sm:top-4 sm:h-9 sm:w-9"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>

        {useTextOnlyLayout ? (
          <div className="flex min-h-[380px] items-center justify-center overflow-y-auto bg-[linear-gradient(180deg,#fdfcf8_0%,#f5f0e6_100%)] px-7 py-14 sm:min-h-[480px] sm:px-16 sm:py-20">
            <div className="w-full max-w-[480px] text-center">
              {item.label ? <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[rgba(10,22,40,0.45)]">{item.label}</p> : null}
              <h2 className="font-display-title text-[clamp(2.25rem,8vw,4.75rem)] leading-[0.92] tracking-[-0.03em] text-[var(--theme-ink)]">{item.title}</h2>
              {item.description ? <p className="mx-auto mt-6 max-w-[40ch] text-[14px] leading-7 text-[rgba(10,22,40,0.64)] sm:text-[16px]">{item.description}</p> : null}
              {emailAction}
              <p className="mx-auto mt-7 max-w-[44ch] text-[9px] leading-5 text-[rgba(10,22,40,0.42)] sm:text-[10px]">Promotion only valid on select styles. This code cannot be used during sale periods or in combination with other promotion codes.</p>
            </div>
          </div>
        ) : (
          <div className="grid max-h-[calc(100vh-24px)] min-h-[250px] grid-cols-1 overflow-y-auto md:max-h-none md:grid-cols-[0.94fr_1.06fr] md:overflow-hidden sm:min-h-[420px]">
            <div className="relative h-[46vh] max-h-[360px] min-h-[240px] bg-[radial-gradient(circle_at_top,#f3e7d4_0%,#eadfcb_46%,#ddc8a6_100%)] md:h-auto md:max-h-none md:min-h-full">
              {imageSrc ? (
                <picture>
                  <source media="(max-width: 767px)" srcSet={mobileImageSrc} />
                  <img
                    src={imageSrc}
                    alt={item.image_alt || item.title || 'Promotion image'}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    loading="eager"
                  />
                </picture>
              ) : (
                <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#efe5d3_0%,#dcc8a6_100%)] p-8 text-center text-[13px] uppercase tracking-[0.24em] text-[rgba(10,22,40,0.5)]">
                  Promotion Image
                </div>
              )}
            </div>

            <div className="flex min-h-full items-center justify-center bg-[linear-gradient(180deg,#fdfcf8_0%,#f5f0e6_100%)] px-5 py-5 sm:px-9 sm:py-8 md:px-10">
              <div className="w-full max-w-[240px] text-center sm:max-w-[300px]">
                {item.label ? (
                  <p className="mb-3 text-[9px] uppercase tracking-[0.22em] text-[rgba(10,22,40,0.42)] sm:mb-4 sm:text-[10px] sm:tracking-[0.26em]">
                    {item.label}
                  </p>
                ) : null}

                <h2
                  className="font-display-title text-[var(--theme-ink)] text-[clamp(1.35rem,8vw,2.35rem)] sm:text-[clamp(2.1rem,4vw,3.9rem)]"
                  style={{
                    fontWeight: 400,
                    lineHeight: 0.9,
                    letterSpacing: '-0.025em',
                  }}
                >
                  {item.title}
                </h2>

                <p className="mx-auto mt-3 max-w-[24ch] text-[12px] leading-5 text-[rgba(10,22,40,0.62)] sm:mt-5 sm:max-w-[28ch] sm:text-[15px] sm:leading-7">
                  {item.description}
                </p>

                {emailAction}

                <p className="mx-auto mt-4 max-w-[28ch] text-[9px] leading-4 text-[rgba(10,22,40,0.42)] sm:mt-6 sm:max-w-[30ch] sm:text-[10px] sm:leading-5">
                  Promotion only valid on select styles. This code cannot be used during sale periods or in combination with other promotion codes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
