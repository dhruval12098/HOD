'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type PromotionPopupData = {
  label: string
  title: string
  description: string
  cta_text: string
  cta_link: string
  image_path?: string
  image_alt?: string
  image_only_mode?: boolean
  is_active: boolean
  show_once_per_session: boolean
}

const SESSION_KEY = 'hod_promotion_popup_dismissed_v1'

export default function PromotionPopup() {
  const [item, setItem] = useState<PromotionPopupData | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let ignore = false

    const load = async () => {
      try {
        const response = await fetch('/api/public/promotion-popup')
        const payload = await response.json().catch(() => null)
        if (!response.ok || ignore) return

        const nextItem = payload?.item as PromotionPopupData | null
        if (!nextItem?.is_active) return

        const dismissed = typeof window !== 'undefined' && window.sessionStorage.getItem(SESSION_KEY) === '1'
        if (nextItem.show_once_per_session && dismissed) return

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

  const imageSrc = item.image_path || ''
  const imageOnlyMode = Boolean(item.image_only_mode)

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[rgba(10,22,40,0.48)] p-4 backdrop-blur-[6px]">
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-[28px] border border-[rgba(184,149,74,0.2)] bg-[linear-gradient(180deg,#fffdf9_0%,#f8f4ec_100%)] shadow-[0_24px_64px_rgba(10,22,40,0.22)]">
        <button
          type="button"
          onClick={close}
          aria-label="Close promotion popup"
          className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(10,22,40,0.14)] bg-white text-[var(--theme-ink)] shadow-[0_8px_24px_rgba(10,22,40,0.16)] transition hover:bg-[#f8f4ec]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {imageOnlyMode && imageSrc ? (
          <div className="flex min-h-[340px] flex-col">
            <div className="relative h-[210px] w-full shrink-0 overflow-hidden bg-[radial-gradient(circle_at_top,#f5e7c4_0%,#ebd8ad_42%,#dcc18d_100%)]">
              <img
                src={imageSrc}
                alt={item.image_alt || item.title || 'Promotion image'}
                className="h-full w-full object-contain object-center"
                loading="eager"
              />
            </div>
            <div className="flex flex-1 items-end p-5 sm:p-6">
              {item.cta_text && item.cta_link ? (
                <Link
                  href={item.cta_link}
                  onClick={close}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--theme-ink)] px-6 text-[10px] font-medium uppercase tracking-[0.24em] text-white transition hover:bg-[#13233b]"
                >
                  {item.cta_text}
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[340px] flex-col p-5 sm:p-6">
            <div className="flex-1">
              {item.cta_text && item.cta_link ? (
                <div className="sr-only">{item.cta_text}</div>
              ) : null}

              {item.label ? (
                <div className="mb-3 inline-flex items-center gap-3 text-[9px] font-medium uppercase tracking-[0.26em] text-[var(--theme-muted-2)]">
                  <span className="inline-block h-px w-8 bg-[rgba(184,149,74,0.72)]" />
                  {item.label}
                </div>
              ) : null}

              <h2 className="max-w-[14ch] text-[clamp(1.5rem,4vw,2.3rem)] leading-[0.98] text-[var(--theme-ink)]">
                {item.title}
              </h2>

              <p className="mt-3 max-w-[34ch] text-[13px] leading-6 text-[var(--theme-muted)]">
                {item.description}
              </p>
            </div>

            <div className="pt-6">
              {item.cta_text && item.cta_link ? (
                <Link
                  href={item.cta_link}
                  onClick={close}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--theme-ink)] px-6 text-[10px] font-medium uppercase tracking-[0.24em] text-white transition hover:bg-[#13233b]"
                >
                  {item.cta_text}
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
