'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type PromotionPopupData = {
  label: string
  title: string
  description: string
  cta_text: string
  cta_link: string
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

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[rgba(10,22,40,0.48)] p-4 backdrop-blur-[6px]">
      <div className="relative w-full max-w-[560px] overflow-hidden rounded-[32px] border border-[rgba(184,149,74,0.2)] bg-[linear-gradient(180deg,#fffdf9_0%,#f8f4ec_100%)] p-6 shadow-[0_30px_90px_rgba(10,22,40,0.26)] sm:p-8">
        <button
          type="button"
          onClick={close}
          aria-label="Close promotion popup"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(10,22,40,0.1)] bg-white/70 text-[var(--theme-ink)] transition hover:bg-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {item.label ? (
          <div className="mb-4 inline-flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--theme-muted-2)]">
            <span className="inline-block h-px w-8 bg-[rgba(184,149,74,0.72)]" />
            {item.label}
          </div>
        ) : null}

        <h2 className="max-w-[14ch] text-[clamp(2rem,4vw,3.2rem)] leading-[0.96] text-[var(--theme-ink)]">
          {item.title}
        </h2>

        <p className="mt-4 max-w-[44ch] text-[14px] leading-7 text-[var(--theme-muted)]">
          {item.description}
        </p>

        {item.cta_text && item.cta_link ? (
          <div className="mt-8">
            <Link
              href={item.cta_link}
              onClick={close}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--theme-ink)] px-7 text-[10px] font-medium uppercase tracking-[0.28em] text-white transition hover:bg-[#13233b]"
            >
              {item.cta_text}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
