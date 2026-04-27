'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type HeroSlide = {
  sort_order: number
  image_path: string
  mobile_image_path?: string
  button_text: string
  button_link: string
}

type HeroContent = {
  eyebrow: string
  headline: string
  subtitle: string
  slider_enabled?: boolean
}

const fallbackContent: HeroContent = {
  eyebrow: 'Hip Hop',
  headline: 'Hip Hop Jewellery',
  subtitle: 'Fully iced chains, grillz, pendants and statement rings - handcrafted with CVD diamonds in 14K and 18K gold.',
  slider_enabled: false,
}

export default function HipHopHero() {
  const [content, setContent] = useState<HeroContent>(fallbackContent)
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [activeSlide, setActiveSlide] = useState(0)

  const getPublicImageUrl = (path: string) => {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? 'hod'
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const response = await fetch('/api/public/hiphop/hero', { cache: 'no-store' })
        const payload = await response.json().catch(() => null)
        if (!active) return

        const newSlides = Array.isArray(payload?.items) ? payload.items : []
        const hasNewBanner = Boolean(payload?.item && Boolean(payload.item.slider_enabled) && newSlides.some((item: HeroSlide) => item.image_path?.trim()))

        if (hasNewBanner) {
          setContent({
            eyebrow: payload.item.eyebrow ?? fallbackContent.eyebrow,
            headline: payload.item.headline ?? fallbackContent.headline,
            subtitle: payload.item.subtitle ?? fallbackContent.subtitle,
            slider_enabled: true,
          })
          setSlides(newSlides)
          return
        }

        const legacyResponse = await fetch('/api/public/hiphop-showcase', { cache: 'no-store' })
        const legacyPayload = await legacyResponse.json().catch(() => null)
        const legacySection = legacyPayload?.section

        if (legacySection?.image_path) {
          const legacyHeadline = [legacySection.heading_line_1, legacySection.heading_line_2, legacySection.heading_emphasis]
            .filter((part: string | null | undefined) => typeof part === 'string' && part.trim().length > 0)
            .join(' ')

          setContent({
            eyebrow: legacySection.eyebrow ?? fallbackContent.eyebrow,
            headline: legacyHeadline || fallbackContent.headline,
            subtitle: fallbackContent.subtitle,
            slider_enabled: true,
          })
          setSlides([
            {
              sort_order: 1,
              image_path: legacySection.image_path,
              mobile_image_path: legacySection.image_path,
              button_text: legacySection.cta_label ?? 'Explore',
              button_link: legacySection.cta_link ?? '/hiphop',
            },
          ])
          return
        }

        if (payload?.item) {
          setContent({
            eyebrow: payload.item.eyebrow ?? fallbackContent.eyebrow,
            headline: payload.item.headline ?? fallbackContent.headline,
            subtitle: payload.item.subtitle ?? fallbackContent.subtitle,
            slider_enabled: Boolean(payload.item.slider_enabled),
          })
          setSlides(newSlides)
        }
      } catch {
        if (active) {
          setContent(fallbackContent)
          setSlides([])
        }
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const sortedSlides = useMemo(() => slides.filter((item) => item.image_path?.trim()).sort((a, b) => a.sort_order - b.sort_order), [slides])

  useEffect(() => {
    setActiveSlide(0)
  }, [sortedSlides.length])

  useEffect(() => {
    if (!content.slider_enabled || sortedSlides.length <= 1) return
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % sortedSlides.length)
    }, 4500)
    return () => window.clearInterval(intervalId)
  }, [content.slider_enabled, sortedSlides])

  const currentSlide = sortedSlides[activeSlide] ?? sortedSlides[0]
  const hasImageHero = Boolean(content.slider_enabled && currentSlide)

  if (hasImageHero && currentSlide) {
    return (
      <section className="relative overflow-hidden">
        <div className="relative h-[288px] sm:h-[360px] md:h-[408px] lg:h-[456px]">
          {sortedSlides.map((slide, index) => (
            <div key={`${slide.sort_order}-${slide.image_path}`} className={`absolute inset-0 transition-opacity duration-700 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}>
              <Image src={getPublicImageUrl(slide.mobile_image_path || slide.image_path)} alt={slide.button_text || `Hip Hop slide ${index + 1}`} fill priority={index === 0} sizes="100vw" className="object-cover sm:hidden" />
              <Image src={getPublicImageUrl(slide.image_path)} alt={slide.button_text || `Hip Hop slide ${index + 1}`} fill priority={index === 0} sizes="100vw" className="hidden object-cover sm:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,22,40,0.55)] via-[rgba(10,22,40,0.18)] to-transparent" />
            </div>
          ))}
          <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
            <div className="flex flex-col items-start gap-4">
              <Link href={currentSlide.button_link || '/hiphop'} className="inline-flex items-center justify-center gap-2.5 bg-[#0A1628] px-[24px] py-3 text-[9px] uppercase tracking-[0.22em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#20304a] sm:px-[28px] sm:py-4 sm:text-[10px] sm:tracking-[0.28em]">
                {currentSlide.button_text || 'Explore'}
              </Link>
              {sortedSlides.length > 1 ? (
                <div className="flex items-center gap-2">
                  {sortedSlides.map((slide, index) => (
                    <button key={`${slide.sort_order}-dot`} type="button" onClick={() => setActiveSlide(index)} className={`h-2.5 rounded-full transition-all ${index === activeSlide ? 'w-10 bg-white' : 'w-2.5 bg-white/45'}`} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const words = content.headline.split(' ')
  const firstWord = words[0] ?? 'Hip Hop'
  const rest = words.slice(1).join(' ') || 'Jewellery'

  return (
    <section className="
      px-[52px] pt-20 pb-[50px] text-center
      bg-gradient-to-b from-[#0A1628] to-[#1A1A1A]
      border-b border-[rgba(10,22,40,0.15)]
      relative overflow-hidden
      md:px-7 sm:px-5
    ">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(10,22,40,0.1), transparent)',
        }}
      />

      <div className="reveal relative z-10 mb-5 text-[9px] tracking-[0.3em] uppercase text-[#6A6A6A]">
        <Link href="/" className="text-white/60 transition-colors duration-300 hover:text-white">
          Home
        </Link>
        <span className="mx-[10px] text-white/30">/</span>
        <span className="text-[#FFFFFF]">{content.eyebrow || 'Hip Hop'}</span>
      </div>

      <h1
        className="
          reveal reveal-delay-1 relative z-10 mb-[14px]
          font-serif font-light text-[#FFFFFF] tracking-[0.02em] leading-[1.1]
          text-[clamp(46px,6vw,76px)]
        "
      >
        {firstWord} <em className="not-italic text-[#d9e2ee]">{rest}</em>
      </h1>

      <p className="
        reveal reveal-delay-2 relative z-10
        text-[12px] tracking-[0.12em] text-white/65
        max-w-[540px] mx-auto leading-[1.8]
      ">
        {content.subtitle}
      </p>
    </section>
  )
}
