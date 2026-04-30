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
  updated_at?: string
}

const SESSION_KEY_PREFIX = 'hod_promotion_popup_dismissed_v2'
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
      item.image_path,
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

  useEffect(() => {
    let ignore = false

    const load = async () => {
      try {
        const response = await fetch('/api/public/promotion-popup', { cache: 'no-store' })
        const payload = await response.json().catch(() => null)
        if (!response.ok || ignore) return

        const nextItem = payload?.item as PromotionPopupData | null
        if (!nextItem?.is_active) return

        const versionToken = buildVersionToken(nextItem)
        const sessionKey = `${SESSION_KEY_PREFIX}:${versionToken}`
        const dismissed = typeof window !== 'undefined' && window.sessionStorage.getItem(sessionKey) === '1'
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
    if (typeof window !== 'undefined' && item) {
      const sessionKey = `${SESSION_KEY_PREFIX}:${buildVersionToken(item)}`
      window.sessionStorage.setItem(sessionKey, '1')
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
  const imageOnlyMode = Boolean(item.image_only_mode)

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[rgba(10,22,40,0.48)] p-4 backdrop-blur-[6px] sm:p-5">
      <div className="relative w-full max-w-[620px] overflow-hidden rounded-[30px] border border-[rgba(184,149,74,0.2)] bg-[linear-gradient(180deg,#fffdf9_0%,#f8f4ec_100%)] shadow-[0_24px_64px_rgba(10,22,40,0.22)]">
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
          <div className="flex min-h-[500px] flex-col sm:min-h-[560px]">
            <div className="relative h-[320px] w-full shrink-0 overflow-hidden bg-[radial-gradient(circle_at_top,#f5e7c4_0%,#ebd8ad_42%,#dcc18d_100%)] sm:h-[380px]">
              <img
                src={imageSrc}
                alt={item.image_alt || item.title || 'Promotion image'}
                className="h-full w-full object-cover object-center"
                loading="eager"
              />
            </div>
            <div className="flex flex-1 items-end p-6 sm:p-8">
              {item.cta_text && item.cta_link ? (
                <Link
                  href={item.cta_link}
                  onClick={close}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[var(--theme-ink)] px-7 text-[10px] font-medium uppercase tracking-[0.24em] text-white transition hover:bg-[#13233b]"
                >
                  {item.cta_text}
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[420px] flex-col p-6 sm:min-h-[500px] sm:p-8">
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

              <h2 className="max-w-[15ch] text-[clamp(1.9rem,4vw,3rem)] leading-[0.96] text-[var(--theme-ink)]">
                {item.title}
              </h2>

              <p className="mt-4 max-w-[44ch] text-[14px] leading-7 text-[var(--theme-muted)] sm:text-[15px]">
                {item.description}
              </p>
            </div>

            <div className="pt-8">
              {item.cta_text && item.cta_link ? (
                <Link
                  href={item.cta_link}
                  onClick={close}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[var(--theme-ink)] px-7 text-[10px] font-medium uppercase tracking-[0.24em] text-white transition hover:bg-[#13233b]"
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
