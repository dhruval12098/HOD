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
  const hasTextContent = Boolean(
    item.label?.trim() || item.title?.trim() || item.description?.trim() || item.cta_text?.trim()
  )
  const useImageOnlyLayout = imageOnlyMode && !hasTextContent

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[rgba(10,22,40,0.48)] p-4 backdrop-blur-[6px] sm:p-5">
      <div className="relative w-full max-w-[760px] overflow-hidden rounded-[12px] border border-[rgba(10,22,40,0.1)] bg-[#f7f3eb] shadow-[0_28px_80px_rgba(10,22,40,0.24)]">
        <button
          type="button"
          onClick={close}
          aria-label="Close promotion popup"
          className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center text-[rgba(10,22,40,0.42)] transition hover:text-[var(--theme-ink)]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {useImageOnlyLayout && imageSrc ? (
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
          <div className="grid min-h-[420px] grid-cols-1 md:grid-cols-[0.94fr_1.06fr]">
            <div className="relative min-h-[220px] bg-[#eadfcb] md:min-h-full">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={item.image_alt || item.title || 'Promotion image'}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  loading="eager"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#efe5d3_0%,#dcc8a6_100%)] p-8 text-center text-[13px] uppercase tracking-[0.24em] text-[rgba(10,22,40,0.5)]">
                  Promotion Image
                </div>
              )}
            </div>

            <div className="flex min-h-full items-center justify-center bg-[linear-gradient(180deg,#fdfcf8_0%,#f5f0e6_100%)] px-7 py-8 sm:px-9 md:px-10">
              <div className="w-full max-w-[300px] text-center">
                {item.label ? (
                  <p className="mb-4 text-[10px] uppercase tracking-[0.26em] text-[rgba(10,22,40,0.42)]">
                    {item.label}
                  </p>
                ) : null}

                <h2
                  className="font-display-title text-[var(--theme-ink)]"
                  style={{
                    fontSize: 'clamp(2.1rem, 4vw, 3.9rem)',
                    fontWeight: 400,
                    lineHeight: 0.9,
                    letterSpacing: '-0.025em',
                  }}
                >
                  {item.title}
                </h2>

                <p className="mx-auto mt-5 max-w-[28ch] text-[14px] leading-7 text-[rgba(10,22,40,0.62)] sm:text-[15px]">
                  {item.description}
                </p>

                {item.cta_text && item.cta_link ? (
                  <div className="mt-7">
                    <Link
                      href={item.cta_link}
                      onClick={close}
                      className="inline-flex h-[48px] w-full items-center justify-center bg-[var(--theme-ink)] px-6 text-[12px] font-medium text-white transition hover:bg-[#182a45]"
                    >
                      {item.cta_text}
                    </Link>
                  </div>
                ) : null}

                <p className="mx-auto mt-6 max-w-[30ch] text-[10px] leading-5 text-[rgba(10,22,40,0.42)]">
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
